# Publish FiboUI to the marketplaces

One VSIX (`felipeoliveiradev.fiboui`) ships both the editor extension and the **FiboUI Noir** theme. Publish that same package to:

- **Visual Studio Marketplace** (`vsce`) — VS Code
- **Open VSX** (`ovsx`) — Cursor (and other Open VSX clients)

Cursor does **not** install from the Visual Studio Marketplace. It mirrors Open VSX (`marketplace.cursorapi.com`) after a malware scan, so both stores are required.

Do not commit a `.vsix`. Do not bump the npm library (`fiboui` on npm) when shipping the editor.

The Azure DevOps / Visual Studio Marketplace publisher **felipeoliveiradev** must already exist. Claim the Open VSX namespace **once** on a laptop (not in CI):

```bash
npx ovsx create-namespace felipeoliveiradev -p "$OVSX_PAT"
```

If that namespace is already yours, skip this step.

## GitHub Actions (preferred)

Workflow: [`.github/workflows/publish-extension.yml`](../../.github/workflows/publish-extension.yml).

1. Add repo secrets (never paste tokens into the repo):
   - **`VSCE_PAT`** — Azure DevOps PAT with **Marketplace (Manage)** for publisher `felipeoliveiradev`.
   - **`OVSX_PAT`** — token from [open-vsx.org/user-settings/tokens](https://open-vsx.org/user-settings/tokens).
2. Keep extension `version` in `extensions/vscode-fiboui/package.json` (today `0.1.0`). Bump it when you want a new marketplace release.
3. Merge to `main` (paths under `extensions/vscode-fiboui/**`), or run **Actions → Publish extension → Run workflow**.

The workflow then:

1. Runs `npm --prefix extensions/vscode-fiboui test`
2. Asks Visual Studio Marketplace and Open VSX whether `felipeoliveiradev.fiboui@$VERSION` already exists (`scripts/marketplace-version-check.sh`)
3. Packages one VSIX with `npx @vscode/vsce package`
4. Publishes to each store independently:
   - missing secret → skip that store (green)
   - version already on that store → skip that store (green)
   - `vsce publish --skip-duplicate --packagePath`
   - `ovsx publish --skip-duplicate`

`engines.vscode` stays `^1.85.0` so Cursor’s gallery does not hide the extension.

After it is live:

```text
ext install felipeoliveiradev.fiboui
```

VS Code: [marketplace.visualstudio.com](https://marketplace.visualstudio.com/items?itemName=felipeoliveiradev.fiboui)  
Open VSX / Cursor: [open-vsx.org/extension/felipeoliveiradev/fiboui](https://open-vsx.org/extension/felipeoliveiradev/fiboui)

Cursor may take extra time to show the listing after Open VSX accepts it.

## Manual fallback

```bash
cd extensions/vscode-fiboui
npx @vscode/vsce package --out /tmp/fiboui-0.1.0.vsix
npx @vscode/vsce publish --pat "$VSCE_PAT" --packagePath /tmp/fiboui-0.1.0.vsix
npx ovsx publish /tmp/fiboui-0.1.0.vsix -p "$OVSX_PAT"
```

`vsce login felipeoliveiradev` stores a PAT locally if you prefer that over `--pat`.
