# Changelog

All notable changes to this project are documented in this file.

## [2.0.0] - 2026-10-14

Breaking release. Nobody was consuming 1.0.x in production; APIs that needed a break were taken now. Migration: [MIGRATION.md](./MIGRATION.md).

### Breaking

- **Column default is `center`** (Flutter `CrossAxisAlignment.center` / SwiftUI `VStack`). Use `.crossAxisAlignment('start'|'stretch')` to opt out. Test: `tests/column-row.test.tsx`, `tests/breaking-2.0.test.tsx`.
- **`src/` is not published.** Import from `fiboui` or a subpath, never `fiboui/src/...`. Test: `tests/breaking-2.0.test.tsx` / `tests/packaging.test.ts`.
- **CSS is not imported from JS.** Callers must `import 'fiboui/style.css'` (or a layout). Test: `tests/breaking-2.0.test.tsx`.
- **ESM-only** (`"type": "module"`). No `require('fiboui')` / CJS / UMD. Test: `tests/packaging.test.ts`.
- **Subpath exports:** `fiboui/core`, `fiboui/layout`, `fiboui/content`, `fiboui/interactive`, `fiboui/structure`, `fiboui/navigation`, `fiboui/theme`. Test: `tests/packaging.test.ts`.
- **Curated named exports.** `Stakent*`, `_styleManager`, `createBuilder`, and other internals are not on the public surface. Test: `tests/breaking-2.0.test.tsx`.
- **Theme tokens unified to Material 3** (`--fibo-primary: #6750A4` in CSS + `materialTheme`). Test: `tests/breaking-2.0.test.tsx`.

### Added

- **Per-root `activeEffect`:** `createReactivityRoot()`, `runInScope()`, `ReactivityRoot`. Test: `tests/breaking-2.0.test.tsx`.
- **Fine-grained text updates:** `Text(() => ...)` and `bindText(signal)` write `textContent` without remounting. Test: `tests/breaking-2.0.test.tsx`.
- **Monetron example** (`examples/monetron`): Vite + React 18 consumer of the packed `fiboui-2.0.0.tgz` (subpath imports, `bindSignal`, `Text(() => …)`, explicit `style.css`). Playwright + compare shots in `examples/monetron/REPORT.md`.

## [1.0.3] - 2026-10-14

### Production hardening (all AUDIT.md severities)

- Runtime `.state()` via `useBuilderState`; `StateWrapper` re-renders on `set`.
- `useSignal` / `useReactiveStore` / `useObservable` / `Observer` use `useSyncExternalStore` (StrictMode, no extra effect write, unsubscribe on unmount).
- Select/Combobox WAI-ARIA listbox + keyboard; Collapse `<button aria-expanded>`; Spinner/Skeleton `role="status"`; Progress `role="progressbar"`; Table `th scope="col"`.
- Checkbox/Switch single native control; `indeterminate` written to the DOM input; RadioGroup `useId` name.
- VirtualColumn/List measurement version bump; List horizontal virtualization; VirtualColumn wraps text children.
- `responsive()` tablet/desktop via `ResponsiveWrapper`; AnimatedWrapper seeds from current signal; theme `initialTheme` syncs after mount.
- Grid `bento` variant; Sidebar active path from Router; Link `href` includes `basename`.
- Stable SVG / gradient ids; `StoreImpl.setState` shallow-compare; `PluginManager.registerStore`.
- Ripple keyframes renamed to `fibo-ripple`; dead `.fibo-card` border and unused `.fibo-flex-center` removed.
- ESM bundle minified; ESLint (`npm run lint`); `useReactiveStore` alias; docs aligned to real APIs.
- Tests: `tests/production-audit.test.tsx`, `tests/builders-smoke.test.tsx`, packaging exports map. Coverage: `npm run test:coverage`.

No breaking changes. Items that would break apps (Column default, drop `src/`, theme hex unify, subpath exports, `"type": "module"`) stay listed in AUDIT.md as intentionally not fixed.

### Packaging (verified against a packed tarball)

- Roll up `dist/index.d.ts` so NodeNext consumers resolve types (no extensionless `./src` re-exports).
- Mark `react`, `react-dom`, `react-dom/client`, and `scheduler` as externals. The previous ESM/UMD builds inlined React 19 DOM and crashed React 18 Vite apps (`Cannot read properties of undefined (reading 'S')`).
- Emit `dist/index.cjs.js` and point `exports.require` / `main` at it. `require` used to load UMD, which broke Next.js SSR (`createContext is not a function`).
- `'use client'` on the package entry (source + bundle banner) so App Router treats FiboUI as a client module. Pages that *call* builders still need `'use client'` — factories are not RSC-safe.
- `exports` for `fiboui/style.css`. Consumer Vite build of `import 'fiboui/style.css'` has **no** esbuild “outside a block” warning.

### Added

- GitHub Actions `Publish` workflow: on GitHub Release **and** push to `main`; install/typecheck/test/build; skip if `npm view fiboui@$VERSION` exists; `npm publish --provenance --access public` with `id-token: write` and `NPM_TOKEN`; concurrency `npm-publish`; tag `vX.Y.Z` on main publishes.
- [CONTRIBUTING.md](./CONTRIBUTING.md) release steps. **A `main` branch must be created** (repo currently only has `teste`).
- [VERIFICATION.md](./VERIFICATION.md) pack + Vite/NodeNext/Next/Playwright results.

### Fixed

- **`bindSignal()` is reactive.** `createBuilder` used to wrap a *pre-built* element in `SignalWrapper`, so a signal update forced a React render of the same stale tree. `SignalWrapper` now accepts a child factory and re-invokes `build()`. Use a function child (or `Text(() => ...)`) so values are read on each rebuild. Covered by `tests/bind-signal.test.tsx`.
- **Builders type-check as children.** `.children()` accepts `FiboChild` / `FiboChildren` (`ReactNode | { build() } | factory`). A builder ending in `.onPress`, `.id`, `.spacing`, or `.children` is a valid child without a trailing CSS proxy call. Covered by `tests/children-types.test.tsx`.
- **Function children auto-build.** `processChildren()` now runs the same `build()` detection for `.children(() => ...)` results as for arrays. `ScrollView` and `Grid` use `processChildren()` instead of raw `_children`. Covered by `tests/children-autobuild.test.tsx`.
- **Button user `.style()` wins.** Size/shape utilities (and `font-semibold`) are omitted when the matching inline keys are set; user `style` is applied last. Defaults `type="button"`. Covered by `tests/button-style.test.tsx`.
- **Row inside Column + `spaceBetween`.** Column keeps `crossAxisAlignment: start` (non-breaking). Row adds `self-stretch` so it fills the column width under `align-items: flex-start` (CSS percentage-width gotcha). Flutter/SwiftUI default to *center*, not stretch; stretching every Column child would widen buttons. Documented in README. Covered by `tests/column-row.test.tsx`.
- **Malformed `web.css` rule.** `background-color: var(--fibo-primary-container)` sat outside a block (esbuild warning). Restored as `.fibo-theme-web .fibo-tag`. Covered by `tests/css-theme.test.ts`.
- **README vs API.** Header is v1.0.3; examples use `.onPress`, `Scaffold.headerBar` / `sideBarLeft`, and type-checked snippets in `tests/readme-examples.test.tsx`.

### Fixed (audit, non-breaking)

- `SignalWrapper` / `ObserverWrapper` use `useSyncExternalStore` (React 18 concurrent / StrictMode-safe subscribe).
- `FiboApp` passes empty `stateMap` / `providers` so `useProvider` does not throw.
- `NavLink` reads `useRouter().currentPath` instead of a one-shot `window.location.pathname`.
- `Router` derives `params` on render (no one-frame lag) and guards `window` for SSR.
- `useLocation` does not touch `window` during SSR.
- `getClassName()` no longer mutates `_classNames` on every call (Observer rebuilds).
- `Image.foregroundStyle()` applies the color instead of no-op.
- `DashboardLayout.sidebar` / `.header` and `Collapse.content` auto-build builders.
- `ProviderWrapper` / `StateWrapper` default to empty maps.
- Web theme defines `--fibo-on-surface-variant` (used by table headers).

### Added

- Vitest + Testing Library (`npm test`).
- `FiboChild`, `FiboChildren`, `Buildable` public types; `buildChild` / `normalizeFiboChildren` helpers.
- `package.json` `exports`, `sideEffects`, React 18–19 peer range.
- `AUDIT.md` full codebase audit and 1.1/2.0 roadmap.

### Documentation

- Column/Row cross-axis decision (Flutter/SwiftUI vs CSS flex).
- `bindSignal` requires a function child to re-read values.
