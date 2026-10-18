#!/usr/bin/env bash
# Read the VS Code / Cursor extension version and ask Visual Studio
# Marketplace + Open VSX whether publisher.name@version exists.
# Never fails on 404 / empty gallery — that means "will publish".
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="${ROOT}/extensions/vscode-fiboui/package.json"

if [[ -n "${3:-}" ]]; then
  PUBLISHER="$1"
  NAME="$2"
  VERSION="$3"
else
  PUBLISHER="$(node --input-type=commonjs -p 'require(process.argv[1]).publisher' "${MANIFEST}")"
  NAME="$(node --input-type=commonjs -p 'require(process.argv[1]).name' "${MANIFEST}")"
  VERSION="$(node --input-type=commonjs -p 'require(process.argv[1]).version' "${MANIFEST}")"
fi

if [[ -z "${PUBLISHER}" || -z "${NAME}" || -z "${VERSION}" ]]; then
  echo "could not read publisher/name/version" >&2
  exit 1
fi

echo "publisher=${PUBLISHER}"
echo "name=${NAME}"
echo "version=${VERSION}"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "publisher=${PUBLISHER}" >> "${GITHUB_OUTPUT}"
  echo "name=${NAME}" >> "${GITHUB_OUTPUT}"
  echo "version=${VERSION}" >> "${GITHUB_OUTPUT}"
fi

OVSX_JSON="$(mktemp)"
VSM_JSON="$(mktemp)"
trap 'rm -f "${OVSX_JSON}" "${VSM_JSON}"' EXIT

emit() {
  local key="$1"
  local value="$2"
  echo "${key}=${value}"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "${key}=${value}" >> "${GITHUB_OUTPUT}"
  fi
}

vsm_code="$(curl -sS -o "${VSM_JSON}" -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json;api-version=7.2-preview.1" \
  -X POST "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery" \
  -d "{\"filters\":[{\"criteria\":[{\"filterType\":7,\"value\":\"${PUBLISHER}.${NAME}\"}],\"pageNumber\":1,\"pageSize\":1}],\"flags\":914}")"

if [[ "${vsm_code}" != "200" ]]; then
  echo "VS Marketplace lookup failed with HTTP ${vsm_code}" >&2
  exit 1
fi

vsce_exists="$(node --input-type=commonjs -e '
  const fs = require("fs");
  const version = process.argv[1];
  const file = process.argv[2];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const ext = (((data.results || [])[0] || {}).extensions || [])[0];
  if (!ext) {
    process.stdout.write("false");
    process.exit(0);
  }
  const versions = (ext.versions || []).map((v) => v.version);
  process.stdout.write(versions.includes(version) ? "true" : "false");
' "${VERSION}" "${VSM_JSON}")"

if [[ "${vsce_exists}" == "true" ]]; then
  emit "vsce_exists" "true"
  echo "${PUBLISHER}.${NAME}@${VERSION} is already on the Visual Studio Marketplace — skipping that store."
else
  emit "vsce_exists" "false"
  echo "${PUBLISHER}.${NAME}@${VERSION} is not on the Visual Studio Marketplace — will publish if VSCE_PAT is set."
fi

ovsx_code="$(curl -sS -o "${OVSX_JSON}" -w "%{http_code}" \
  "https://open-vsx.org/api/${PUBLISHER}/${NAME}/${VERSION}")"

if [[ "${ovsx_code}" == "200" ]]; then
  emit "ovsx_exists" "true"
  echo "${PUBLISHER}.${NAME}@${VERSION} is already on Open VSX — skipping that store."
elif [[ "${ovsx_code}" == "404" ]]; then
  emit "ovsx_exists" "false"
  echo "${PUBLISHER}.${NAME}@${VERSION} is not on Open VSX — will publish if OVSX_PAT is set."
else
  echo "Open VSX lookup failed with HTTP ${ovsx_code}" >&2
  exit 1
fi
