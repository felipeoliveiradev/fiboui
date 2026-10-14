# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

Planned as **2.2.0**. Easy CSS media queries, CSS motion presets, and a fluent scroll family on the existing builders (no `fiboui/motion` subpath). `package.json` stays **2.1.0** until publish.

### Added

- **`.media('md', { padding: 16 })`** and aliases **`.sm()` / `.md()` / `.lg()` / `.xl()`** — compile to `@media (min-width: …)` via StyleManager. Raw queries work: `.media('(prefers-color-scheme: dark)', { … })`.
- Shared **`FIBO_BREAKPOINTS`** (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280, same as Tailwind). `toMediaQuery()`, `useViewportWidth()` exported.
- Existing **`.responsive({ mobile, tablet, desktop })`** is unchanged (JS `innerWidth` + resize). Prefer `.media()` / `.md()` for CSS.
- **`.animate('fadeIn')`** CSS presets (`fadeIn`/`fadeOut`, `slide*`, `scale*`, `blur*`, `pop`, `bounce`) compiled to deduped `@keyframes` (`FIBO_MOTION_CSS`, `src/styles/motion.css`, `<MotionStyles />`). Custom `{ from, to }` keyframes via `StyleManager.registerKeyframes`.
- **`.ease('spring')` / `.spring({ stiffness, damping, mass })`** → CSS `linear()` (no rAF). Same options now apply to `signal().spring()`.
- **`prefers-reduced-motion`** disable-by-default; `.reducedMotion('never')` opt-out.
- **`.stagger(ms)`** sets `--fibo-stagger` / `--fibo-i` on children.
- **Scroll family:** `.onScroll()` / `.reveal()` (IntersectionObserver), `.scrollTimeline('view'|'scroll')` with IO fallback, `.scrollProgress()` (`animation-timeline: scroll()` + `--fibo-progress` fallback), `.smoothScroll()`, `.scrollSnap()` / `.scrollSnapAlign()`, `.sticky()`, `.anchor()` + `scrollTo()`.
- **Extras:** `.press()`, `.focusVisible()` / `.focusRing()`, `.viewTransition()` + `startViewTransition()`, `Presence(open).enter().exit().duration().children()` (signal or boolean; component form still works), `usePrefersReducedMotion()`, `useScrollProgress()`.
- Typed exports: `useSpring`, `useTransition`, `useStagger`, `useMountTransition`, `SpringConfig`. Hooks remain the opt-in numeric rAF path.
- Docs: [Animation](./docs/guide/animation.md), [Scroll](./docs/guide/scroll.md). Demo: `examples/animation`.

### Fixed

- **Easing camelCase** (`easeIn` → `ease-in`) on `.easing()`, `.animation({ curve })`, and AnimatedWrapper.
- **Spring `damping` / `stiffness` / `mass`** were ignored on `Signal.spring` / `useSpring` defaults now match the CSS sampler.
- **`.duration()` stacked** a new transition class each call — now replaces one `_transitionClass`.
- **Hover `.scale()` + `.translateY()`** overwrote `transform` — PseudoStateBuilder composes via a map.
- **Missing `@keyframes stripes`** used by `Progress` (`animate-[stripes_1s_linear_infinite]`).
- **`Button.onHover`** now fires on `mouseenter`. Documented as a callback (visual hover is `.hover()`).
- **`.hover(h => …)` inside `.map()`** no longer infers `h` as implicit `any` (callback overload is last). `PseudoStateBuilder` is a public type.
- **`Text().variant('h1')`** applies a rem typographic scale (tag-only was invisible under Tailwind preflight).
- **`.anchor()` / `scrollTo` under a sticky bar** — `.sticky()` publishes `--fibo-sticky-offset`, `html` gets `scroll-padding-top`, anchors get `scroll-margin-top`. Override with `.scrollMargin()`.

### Security

- Gitleaks CI job on every push/PR (`scripts/secret-scan.sh --git`, values redacted).
- `prepublishOnly` + Publish workflow scan the working tree and `npm pack` tarball before publish.
- `.gitignore` / `.npmignore` now cover `.env`, `.npmrc`, key material, and VitePress cache.

## [2.1.0] - 2026-10-14

Builders are React elements. You can return, nest, and pass them anywhere a `ReactNode` is accepted — **no `.build()`**.

### Added

- Every `createBuilder` / `createShapeBuilder` factory stamps the running React’s `$$typeof` (React 18 `react.element` and React 19 `react.transitional.element`) so `Column()`, `Button()`, `Text()`, … are valid `ReactElement`s.
- Works as JSX children, component return values (`function App() { return Column(...) }`), arrays/lists (`.key(id)`), conditionals, `ReactNode` props, `React.createElement`, `mount()`, StrictMode, and `renderToString` SSR.
- `.build()` remains as a **deprecated** assemble helper for 2.0 call sites. Test: `tests/no-build.test.tsx`.

### Migration

```tsx
// before (2.0)
function App() {
  return Column().children([Text('Hi')]).build();
}

// after (2.1)
function App() {
  return Column().children([Text('Hi')]);
}
```

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

- **Button `shape` / `size` / `tone` / `expand`:** `shape('rect'|'rounded'|'sharp')`, `size('xs')`, `tone('inverse')`, `expand()`, `variant('solid')`, `motion('none')`. Labels are always centered. Test: `tests/ergonomics-2.0.test.tsx`.
- **`Row.hug()` / `Column.hug()`** — skip the default `w-full` / `self-stretch` so chips stay compact. Test: `tests/column-row.test.tsx`.
- **`ListTile`** — leading/`.icon()`, title, subtitle, trailing, `.chevron()`, `.divider()`. Test: `tests/ergonomics-2.0.test.tsx`.
- **`Avatar.icon()` / `.initials()`** — built-in `'user'` glyph or two-letter initials; no image URL required. Test: `tests/ergonomics-2.0.test.tsx`.
- **`Progress` ring + `segments`:** `variant('ring')` with `.size()`, `.strokeWidth()`, `.segments([{ value, color }])`, centered children. Test: `tests/ergonomics-2.0.test.tsx`.
- **`mount('#root', App)` / `<Fibo>` / `toElement()`** — root builders no longer need `.build()`. Test: `tests/ergonomics-2.0.test.tsx`.
- **`Text.nowrap()` / `.mono()` / `.muted()`**; Text default margin is 0. Test: `tests/ergonomics-2.0.test.tsx`.
- **Per-root `activeEffect`:** `createReactivityRoot()`, `runInScope()`, `ReactivityRoot`. Test: `tests/breaking-2.0.test.tsx`.
- **Fine-grained text updates:** `Text(() => ...)` and `bindText(signal)` write `textContent` without remounting. Test: `tests/breaking-2.0.test.tsx`.
- **Monetron example** (`examples/monetron`): Vite + React 18 consumer of the packed `fiboui-2.0.0.tgz`. Playwright + compare shots in `examples/monetron/REPORT.md`.
- **Publish workflow** (on `main`): after a successful npm publish, create git tag `vX.Y.Z` and a GitHub Release whose notes are this CHANGELOG section. Version existence is checked by `scripts/npm-version-check.sh` (E404 → publish; no nested-quote `VERSION="$(node -e "…")"`). `package.json` `repository.url` is `https://github.com/felipeoliveiradev/fiboui` so `--provenance` can verify the Sigstore bundle.

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
