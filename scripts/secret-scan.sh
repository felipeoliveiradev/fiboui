#!/usr/bin/env bash
# Scan for leaked secrets. Never print secret values (gitleaks --redact).
# Usage: secret-scan.sh [--git|--dir|--pack]
set -euo pipefail

GITLEAKS_VERSION="8.24.2"
MODE="dir"

usage() {
  echo "usage: $0 [--git|--dir|--pack]" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --git) MODE="git"; shift ;;
    --dir) MODE="dir"; shift ;;
    --pack) MODE="pack"; shift ;;
    -h|--help) usage ;;
    *) usage ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

checksum_for() {
  case "$1" in
    linux_x64) echo "fa0500f6b7e41d28791ebc680f5dd9899cd42b58629218a5f041efa899151a8e" ;;
    linux_arm64) echo "574a6d52573c61173add7ddb5e3cc68c0e82cb0735818a1eeb9a0a2de1643fbc" ;;
    darwin_x64) echo "bc3c46f8039ba716ba8461fa6745c9d1cfb90ca2f5f881d8d0cf66b7ba7b742c" ;;
    darwin_arm64) echo "90d13686937ac7429b97a3acbf1e1d0ce90d92ae2d0cf46a690bd8ae5230bea0" ;;
    *) echo "" ;;
  esac
}

platform_id() {
  local os arch
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "${os}_${arch}" in
    linux_x86_64|linux_amd64) echo "linux_x64" ;;
    linux_aarch64|linux_arm64) echo "linux_arm64" ;;
    darwin_x86_64|darwin_amd64) echo "darwin_x64" ;;
    darwin_arm64) echo "darwin_arm64" ;;
    *) echo "" ;;
  esac
}

file_sha256() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

ensure_gitleaks() {
  if command -v gitleaks >/dev/null 2>&1; then
    local have
    have="$(gitleaks version 2>/dev/null || true)"
    if [[ "${have}" == *"${GITLEAKS_VERSION}"* ]]; then
      echo "gitleaks ${GITLEAKS_VERSION} (PATH)"
      return 0
    fi
  fi

  local plat archive expected url tmp dest
  plat="$(platform_id)"
  expected="$(checksum_for "${plat}")"
  if [[ -z "${plat}" || -z "${expected}" ]]; then
    echo "unsupported platform for gitleaks download: $(uname -s) $(uname -m)" >&2
    exit 1
  fi

  dest="${ROOT}/.cache/gitleaks/${GITLEAKS_VERSION}"
  mkdir -p "${dest}"
  if [[ -x "${dest}/gitleaks" ]]; then
    PATH="${dest}:${PATH}"
    export PATH
    if gitleaks version 2>/dev/null | grep -q "${GITLEAKS_VERSION}"; then
      echo "gitleaks ${GITLEAKS_VERSION} (cache)"
      return 0
    fi
  fi

  archive="gitleaks_${GITLEAKS_VERSION}_${plat}.tar.gz"
  url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${archive}"
  tmp="$(mktemp -d)"
  echo "downloading gitleaks ${GITLEAKS_VERSION} (${plat})"
  curl -sSfL "${url}" -o "${tmp}/${archive}"
  local got
  got="$(file_sha256 "${tmp}/${archive}")"
  if [[ "${got}" != "${expected}" ]]; then
    echo "gitleaks checksum mismatch for ${archive}" >&2
    echo "expected ${expected}" >&2
    echo "got      ${got}" >&2
    rm -rf "${tmp}"
    exit 1
  fi
  tar -xzf "${tmp}/${archive}" -C "${tmp}" gitleaks
  mv "${tmp}/gitleaks" "${dest}/gitleaks"
  chmod +x "${dest}/gitleaks"
  rm -rf "${tmp}"
  PATH="${dest}:${PATH}"
  export PATH
  echo "gitleaks ${GITLEAKS_VERSION} (downloaded)"
}

run_gitleaks_git() {
  echo "gitleaks git (history, --redact)"
  gitleaks git --redact --no-banner --exit-code 1 --config "${ROOT}/.gitleaks.toml"
}

run_gitleaks_dir() {
  local target="${1:-${ROOT}}"
  echo "gitleaks dir ${target} (--redact)"
  # 8.24 `dir` has no --no-git; it scans the tree as files.
  gitleaks dir --redact --no-banner --exit-code 1 --config "${ROOT}/.gitleaks.toml" \
    --max-target-megabytes 20 \
    "${target}"
}

scan_pack_filenames() {
  local list="$1"
  local bad=0
  # Report paths only — never dump file contents.
  if grep -E '(^|/)(\.env|\.env\.[^/]+|\.npmrc|id_rsa|id_dsa|id_ecdsa|id_ed25519|auth\.json)$' "${list}" >/dev/null; then
    echo "pack contains credential-like filenames:" >&2
    grep -E '(^|/)(\.env|\.env\.[^/]+|\.npmrc|id_rsa|id_dsa|id_ecdsa|id_ed25519|auth\.json)$' "${list}" >&2 || true
    bad=1
  fi
  if grep -E '\.(pem|key|p12|pfx|keystore)$' "${list}" >/dev/null; then
    echo "pack contains key/cert filenames:" >&2
    grep -E '\.(pem|key|p12|pfx|keystore)$' "${list}" >&2 || true
    bad=1
  fi
  if grep -E '\.map$' "${list}" >/dev/null; then
    echo "pack contains sourcemaps (not shipped by 2.0.0 policy):" >&2
    grep -E '\.map$' "${list}" >&2 || true
    bad=1
  fi
  if grep -E '(^|/)(src|examples|vendor)/' "${list}" >/dev/null; then
    echo "pack includes src/, examples/, or vendor/ (files field should be dist-only):" >&2
    grep -E '(^|/)(src|examples|vendor)/' "${list}" | head -20 >&2 || true
    bad=1
  fi
  return "${bad}"
}

run_pack() {
  local tmp tgz
  tmp="$(mktemp -d)"
  echo "npm pack --dry-run filename check + extract scan"
  # Write the tarball under tmp so the working tree stays clean.
  tgz="$(npm pack --pack-destination "${tmp}" --silent)"
  tar -tzf "${tmp}/${tgz}" | sed 's|^package/||' | sort > "${tmp}/files.txt"
  echo "pack ${tgz} files=$(wc -l < "${tmp}/files.txt")"
  if ! scan_pack_filenames "${tmp}/files.txt"; then
    rm -rf "${tmp}"
    exit 1
  fi
  mkdir -p "${tmp}/unpack"
  tar -xzf "${tmp}/${tgz}" -C "${tmp}/unpack"
  run_gitleaks_dir "${tmp}/unpack"
  rm -rf "${tmp}"
}

ensure_gitleaks

case "${MODE}" in
  git)
    run_gitleaks_git
    ;;
  dir)
    run_gitleaks_dir "${ROOT}"
    ;;
  pack)
    run_gitleaks_dir "${ROOT}"
    run_pack
    ;;
esac

echo "secret-scan: clean (${MODE})"
