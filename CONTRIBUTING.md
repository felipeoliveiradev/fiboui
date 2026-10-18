# Contributing to FiboUI

## Development

```bash
npm install
npm run type-check
npm test
npm run build
```

`teste` is the current default development branch. **A `main` branch must be created and set as the GitHub default** before automated npm publish will run on merge. The publish workflow listens to `main` only (plus GitHub Releases).

## Release (owner)

Publishing is automated. Do **not** run `npm publish` locally.

1. Add a repo secret named **`NPM_TOKEN`** (an npm [automation token](https://docs.npmjs.com/creating-and-viewing-access-tokens) with permission to publish `fiboui`).
2. Enable GitHub Actions and allow the `Publish` workflow to request the `id-token` permission (OIDC provenance).
3. Create/set the **`main`** branch if it does not exist.
4. Bump `package.json` `version` (and `CHANGELOG.md`) on the PR that should ship.
5. Merge to `main`, **or** publish a GitHub Release.

The workflow (`.github/workflows/publish.yml`) then:

1. `npm ci`
2. `npm run type-check`
3. `npm test`
4. `npm run build`
5. `npm view fiboui@$VERSION` — if that version already exists, **skip publish** (so merges without a bump do not fail)
6. Otherwise `npm publish --provenance --access public` using `NODE_AUTH_TOKEN` from `NPM_TOKEN` and `id-token: write`
7. On `main` publishes, create GitHub Release **`vX.Y.Z`** (and the git tag) whose notes are the matching `CHANGELOG.md` section. A `release` event does not create a second release.

Concurrency group `npm-publish` prevents overlapping publishes.

## Editor extension (VS Code + Cursor)

The npm package and the editor extension are **separate versions**. Do not bump root `package.json` to ship `extensions/vscode-fiboui`.

One VSIX (`felipeoliveiradev.fiboui`) includes editor support and **FiboUI Noir**. Cursor reads **Open VSX**, not the Visual Studio Marketplace.

1. Add repo secrets **`VSCE_PAT`** (Azure DevOps Marketplace Manage) and **`OVSX_PAT`** (https://open-vsx.org/user-settings/tokens).
2. Claim the Open VSX namespace once: `npx ovsx create-namespace felipeoliveiradev -p "$OVSX_PAT"` (not in CI).
3. Bump `extensions/vscode-fiboui/package.json` `version` when you want a new editor release.
4. Merge to `main`, or run **Actions → Publish extension**.

Workflow: `.github/workflows/publish-extension.yml`. Details: `extensions/vscode-fiboui/PUBLISH.md`.

### Checklist before bumping

- [ ] `npm test` and `npm run type-check` pass
- [ ] `npm run secret-scan` (or `secret-scan:pack` after a build) is clean
- [ ] CHANGELOG has a section for the new version
- [ ] README version string matches `package.json`
- [ ] ESM-only: `node --input-type=commonjs -e "…package.json version…"` still works (publish.yml)
- [ ] You are not republishing an existing version number
