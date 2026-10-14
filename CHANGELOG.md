# Changelog

All notable changes to this project are documented in this file.

## [1.0.3] - 2026-10-14

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
