#!/usr/bin/env bash
# Read package.json version (ESM-safe) and ask the registry whether
# $1@$VERSION exists. Never fails on E404 — that means "will publish".
set -euo pipefail

PKG="${1:-fiboui}"
if [[ -n "${2:-}" ]]; then
  VERSION="$2"
else
  VERSION="$(node --input-type=commonjs -p 'require("./package.json").version')"
fi

if [[ -z "${VERSION}" ]]; then
  echo "could not read version" >&2
  exit 1
fi

echo "version=${VERSION}"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "version=${VERSION}" >> "${GITHUB_OUTPUT}"
fi

# Command substitution inside `if` is exempt from set -e, so E404 is a miss.
if npm view "${PKG}@${VERSION}" version >/dev/null 2>&1; then
  echo "exists=true"
  echo "${PKG}@${VERSION} is already on npm — skipping publish."
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "exists=true" >> "${GITHUB_OUTPUT}"
  fi
else
  echo "exists=false"
  echo "${PKG}@${VERSION} is not on npm — will publish."
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "exists=false" >> "${GITHUB_OUTPUT}"
  fi
fi
