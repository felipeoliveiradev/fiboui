# Publish FiboUI to the Marketplace

Do this from `extensions/vscode-fiboui`. Do not commit a `.vsix`.

The Azure DevOps / Visual Studio Marketplace publisher **felipeoliveiradev** must already exist. This file does not create that publisher, an Azure DevOps org, or a personal access token.

## 1. Log in

`vsce login` asks for a Marketplace PAT (Manage scope) for that publisher. Create the token yourself in Azure DevOps; do not paste it into the repo.

```bash
cd extensions/vscode-fiboui
npx @vscode/vsce login felipeoliveiradev
```

## 2. Package (optional check)

```bash
npx @vscode/vsce package --out /tmp/fiboui-0.1.0.vsix
```

## 3. Publish to the VS Code Marketplace

```bash
npx @vscode/vsce publish
```

That publishes version `0.1.0` from `package.json` (`publisher` `felipeoliveiradev`, extension `fiboui`). After it is live:

```text
ext install felipeoliveiradev.fiboui
```

Extensions search name: **FiboUI**.

`vsce package` only builds a `.vsix`. `vsce publish` uploads it.

`vsce package` warns that `LICENSE`, `LICENSE.md`, or `LICENSE.txt` is missing. `package.json` already says `"license": "MIT"`. Add a license file in this folder before publish if you want that warning gone. The repo root has no license file to copy.

## Cursor

Cursor installs extensions from Open VSX, not from the VS Code Marketplace. A Marketplace publish does not show up in Cursor by itself.

Install the same `.vsix` in Cursor: Extensions → **Install from VSIX…** → the file from `vsce package`.

A separate Open VSX publish (`ovsx`) needs its own token and is not part of the commands above.
