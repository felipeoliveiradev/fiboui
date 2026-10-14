# FiboUI 2.0.0 audit

Scope: `teste` plus this PR. **Nothing remains unfixed.** Version is **2.0.0** (breaking). Nothing was published.

Every prior 1.0.3 finding stays fixed. The former “intentionally not fixed” list is implemented below.

---

## P0 — reported 1.0.2 real-app issues

| # | Finding | Status / test |
|---|---------|---------------|
| 1 | `bindSignal()` did not update UI | **Fixed** — `tests/bind-signal.test.tsx` |
| 2 | Builders not assignable after typed methods | **Fixed** — `tests/children-types.test.tsx` |
| 3 | Function `.children()` skipped auto-build | **Fixed** — `tests/children-autobuild.test.tsx` |
| 4 | Button overwrote user `.style()` | **Fixed** — `tests/button-style.test.tsx` |
| 5 | Column + Row `spaceBetween` | **Fixed** — Column default `center` (2.0) + Row `self-stretch` — `tests/column-row.test.tsx` |
| 6 | Orphan CSS declarations | **Fixed** — `tests/css-theme.test.ts` |
| 7 | README out of date | **Fixed** — `tests/readme-examples.test.tsx` |

---

## Former “intentionally not fixed” (all shipped in 2.0)

| Item | What shipped | Test |
|------|----------------|------|
| Column default | `crossAxisAlignment: 'center'` (Flutter / SwiftUI) | `tests/column-row.test.tsx`, `tests/breaking-2.0.test.tsx` (`defaults Column`, `centers children`) |
| Drop `src/` from the pack | `files: ["dist"]` | `tests/packaging.test.ts`, `tests/breaking-2.0.test.tsx` (`drops src/`) |
| Stop importing CSS from JS | No CSS import in `src/index.ts`; `import 'fiboui/style.css'` | `tests/breaking-2.0.test.tsx` (`root JS entry does not import CSS`), `tests/packaging.test.ts` |
| Subpath exports | `./core` `./layout` `./content` `./interactive` `./structure` `./navigation` `./theme` | `tests/packaging.test.ts` (`ESM-only with subpath exports`) |
| Unify theme hexes | Material 3 `#6750A4` in `base.css`, `material.css`, `materialTheme` | `tests/breaking-2.0.test.tsx` (`Material JS + CSS agree`) |
| `"type": "module"` | ESM-only package; no `exports.require` | `tests/packaging.test.ts` |
| Curated exports | Named public surface only; no Stakent / `_styleManager` / `createBuilder` | `tests/breaking-2.0.test.tsx` (`curated exports`) |
| Per-root `activeEffect` | `ReactivityScope` stack, `createReactivityRoot`, `runInScope`, `<ReactivityRoot>` | `tests/breaking-2.0.test.tsx` (`isolates effect tracking`) |
| Fine-grained DOM writes | `Text(() => …)` + `bindText()` patch `textContent` without remount | `tests/breaking-2.0.test.tsx` (`updates textContent without remounting`) |

---

## Remaining 1.0.3 production items (still fixed)

Covered by `tests/production-audit.test.tsx`, `tests/audit-fixes.test.tsx`, `tests/builders-smoke.test.tsx`:

- `useBuilderState`, virtualization re-layout, Select/Combobox/Collapse a11y, Checkbox/Switch/RadioGroup, Grid `bento`, responsive tablet/desktop, AnimatedWrapper seed, Sidebar router path, Link basename, SVG keys, theme prop sync, store shallow compare, PluginManager stores, Spinner/Skeleton/Progress roles, Table `scope`, leaks / StrictMode / `useSyncExternalStore`, SSR window guards, 100-signal updates.

---

## Packaging / publish

| Check | Status |
|-------|--------|
| ESM-only `exports` | **Fixed** — `tests/packaging.test.ts` |
| Publish workflow version read | **Fixed** — `node --input-type=commonjs` JSON parse (works when `"type": "module"`) in `.github/workflows/publish.yml` |
| CLI under ESM | **Fixed** — CLI emits ESM; `createRequire` for `package.json` |
| `npm publish` | **Not run** (owner + `main` + `NPM_TOKEN`) |

Real-app pack verification: [VERIFICATION.md](./VERIFICATION.md).

---

## Intentionally not fixed

**None.**
