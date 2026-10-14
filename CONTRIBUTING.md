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
7. On `main` publishes, create and push git tag `vX.Y.Z` if it is missing

Concurrency group `npm-publish` prevents overlapping publishes.

### Checklist before bumping

- [ ] `npm test` and `npm run type-check` pass
- [ ] CHANGELOG has a section for the new version
- [ ] README version string matches `package.json`
- [ ] You are not republishing an existing version number
