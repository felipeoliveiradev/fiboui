# FiboUI 1.0.3 audit

Scope: `teste` at `d44d678` (package `1.0.2`) plus this patch. npm `fiboui@1.0.2` `gitHead` is `a47e5c5` (older; that tree’s `package.json` still said `1.0.0`). **Only git branch is `teste`.** This PR is based on current `teste`, not the stale publish snapshot.

Legend: **Fixed in this PR** means a 1.0.3-safe patch landed here. Everything else is a prioritized roadmap.

---

## P0 — reported 1.0.2 real-app issues

| # | Severity | Finding | File:line | Evidence | Fix | In this PR? |
|---|----------|---------|-----------|----------|-----|-------------|
| 1 | **critical** | `bindSignal()` did not update UI | `src/core/builder.ts` (createBuilder `build`); `src/core/StateWrapper.tsx` | Proxy called `target.build()` once and passed the element as static `children`. `hasStateManagement()` is unused. `forceUpdate` re-rendered the same snapshot. `.observer()` + function child and `useSignal()` worked. | `SignalWrapper` takes `children: () => ReactNode` and re-assembles; subscribe via `useSyncExternalStore`. Function children must re-read `sig.value`. | **Yes** + `tests/bind-signal.test.tsx` |
| 2 | **high** | Builders not assignable to `.children()` after typed methods | `src/core/builder.ts` `children()`; `src/core/types.ts` | Parameter was `ReactNode`. `Button().onPress()` is `ButtonBuilder`, not `ReactNode`. CSS proxy methods typed as `any` hid the error. | Public `FiboChild` / `FiboChildren` / `Buildable`. | **Yes** + `tests/children-types.test.tsx` |
| 3 | **high** | Function `.children()` skipped auto-build | `src/core/builder.ts` `processChildren` | Arrays mapped `.build()`; `_childFunction()` results returned raw. | `normalizeFiboChildren` for both paths. | **Yes** + `tests/children-autobuild.test.tsx` |
| 4 | **high** | Button overwrote user `.style()` | Published 1.0.2 `ButtonInner` (`a47e5c5`) `Object.assign(finalStyle, sizeStyles)` after user style; current teste used Tailwind classes | User `borderRadius` / `padding` / `fontSize` / `height` / `fontWeight` lost. | Skip conflicting utilities; apply user `style` last. | **Yes** + `tests/button-style.test.tsx` |
| 5 | **medium** | Column + Row `spaceBetween` looks collapsed | `src/layout/Column/index.ts` (`items-start`); `src/layout/Row/index.ts` | CSS `align-items: flex-start` makes `width: 100%` on the Row fail to resolve. Flutter Column default is **center** (not stretch); SwiftUI `VStack` is **center**. Stretching Column would full-width buttons (breaking). | Keep Column `start`. Add Row `self-stretch`. Document. | **Yes** + `tests/column-row.test.tsx` |
| 6 | **medium** | Orphan CSS declarations | `src/styles/themes/web.css` (was ~126) | `background-color: var(--fibo-primary-container)` outside a block. esbuild warns. Sibling themes style `.fibo-tag` next. | Wrap as `.fibo-theme-web .fibo-tag`. | **Yes** + `tests/css-theme.test.ts` |
| 7 | **medium** | README out of date | `README.md` | `onClick` vs `.onPress`; header `v1.0.0`; fictional `Stakent*` exports; `Scaffold().header/sidebar/fab`; `variant("fab")`. | Rewrite examples; type-check in tests. | **Yes** + `tests/readme-examples.test.tsx` |

---

## 1. Correctness — builders & components

### Critical / high (safe ones fixed)

| Sev | Title | File:line | Evidence | Recommended fix | Fixed? |
|-----|-------|-----------|----------|-----------------|--------|
| critical | Signal/observable wrappers did not rebuild | `src/core/StateWrapper.tsx`; `src/core/builder.ts` createBuilder | Static element children | Function children + `useSyncExternalStore` | **Yes** |
| high | `FiboApp` `ProviderWrapper` without `providers` | `src/core/FiboApp.ts` | `createElement(ProviderWrapper, null)` → `useProvider` throws | Pass empty maps; default props | **Yes** |
| high | `NavLink` stale active state | `src/navigation/Link.tsx` | Read `window.location.pathname` once, not `Router` | `useRouter().currentPath` | **Yes** |
| high | `ScrollView` ignored `processChildren` | `src/layout/ScrollView/index.ts` | Spread `this._children` | `processChildren()` | **Yes** |
| high | `Grid` / `GridItem` overrode `children()` without auto-build | `src/structure/Grid/index.ts` | Shadowed `_children`, assigned raw nodes | Use inherited `children` + `processChildren` | **Yes** |
| high | Router params one frame late | `src/navigation/Router.tsx` | `useEffect` copied `matchedParams` | Context `params: matchedParams` | **Yes** |
| high | Router / `useLocation` assume `window` | `src/navigation/Router.tsx`, `RouterContext.ts` | SSR crash | `typeof window` guards | **Yes** |
| medium | `DashboardLayout` / `Collapse` did not build slot builders | `DashboardLayout/index.ts`, `Collapse/index.ts` | Raw `ReactNode` | `buildChild()` | **Yes** |
| medium | `Image.foregroundStyle` no-op | `src/content/Image/index.ts` | Ignored argument | Apply as `style.color` | **Yes** |
| medium | `getClassName()` mutated `_classNames` | `src/core/builder.ts` | Each Observer rebuild appended Tailwind conversion | Compute extra classes without push | **Yes** |

### Still open (roadmap)

| Sev | Title | File:line | Evidence | Recommended fix | 1.1 / 2.0? |
|-----|-------|-----------|----------|-----------------|------------|
| high | Builder `.state()` has no runtime update | `builder.ts` `state()`; `StateWrapper.tsx` | `useStateContext()` unused; map cloned once | `useBuilderState` hook or document as build-time only | 1.1 |
| high | Virtualization height cache does not re-layout | `VirtualColumn/index.ts` ~109; `List/index.ts` ~102 | `useLayoutEffect` writes ref, no setState | Version bump when measured height changes | 1.1 |
| high | `Select` / `Combobox` missing listbox ARIA + keyboard | `Select/index.ts` ~87; `Combobox/index.ts` ~128 | `<div onClick>` options | WAI-ARIA combobox/listbox | 1.1 (a11y, may change DOM) |
| high | `Collapse` header is a clickable `div` | `Collapse/index.ts` ~72 | No button, `aria-expanded`, keyboard | `<button aria-expanded>` | 1.1 |
| medium | `GridVariant` includes `'bento'` but unimplemented | `Grid/index.ts` | Falls through to standard grid | Implement or drop from type | 1.1 type-drop is breaking |
| medium | `responsive()` only merges `mobile` | `builder.ts` `getStyle` | tablet/desktop ignored; `applyResponsiveStyles` unused | Shared helper + resize or CSS | 1.1 |
| medium | `AnimatedWrapper` applies transforms after effect | `AnimatedWrapper.tsx` | First paint empty | Seed from `signal.value` | 1.1 |
| medium | List virtualized ignores `direction: 'horizontal'` | `List/index.ts` | Always `translateY` | Horizontal branch | 1.1 |
| medium | `Sidebar` plugin active path at build time | `Sidebar/index.ts` | `window.location.pathname` in `build()` | `useRouter` in inner | 1.1 |
| medium | `Link` `href` ignores `basename` | `Link.tsx` | `href={to}` | Prefix basename | 1.1 |
| medium | Checkbox/Switch double toggle; `indeterminate` not on DOM | `Checkbox/index.ts`, `Switch/index.ts` | Wrapper click + hidden input | Single control; set `input.indeterminate` | 1.1 |
| medium | SVG shapes random `key` every build | `graphics/shapes/Rect.ts` etc. | Remount / animation reset | Stable key | 1.1 |
| medium | `VirtualColumn` `cloneElement` on non-elements | `VirtualColumn/index.ts` ~169 | Throws on strings | Wrap in measuring div | 1.1 |
| medium | Theme `initialTheme` ignored after mount | `theme/provider.tsx` | No sync from prop | `useEffect` on prop | 1.1 |
| low | `hasStateManagement()` unused | `builder.ts` | Dead helper | Use or delete | 1.1 |
| low | `StoreImpl.setState` always notifies | `core/state.ts` ~254 | New object every time | Shallow compare | 1.1 |
| low | `PluginManager.registerStore` empty | `PluginManager.ts` ~40 | Stub | Wire or document | 1.1 |
| low | `RadioGroup` random `name` per `build()` | `RadioGroup/index.ts` | Breaks grouping on rebuild | `useId` in inner | 1.1 |
| low | Tags/Table index keys | `Tags/index.ts`, `Table/index.ts` | Reorder bugs | Stable ids | 1.1 |

Public factories reviewed: `Button`, `TextField`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`, `Select`, `Combobox`, `Center`, `Column`, `Row`, `Container`, `Spacer`, `Scaffold`, `Header`, `Sidebar`, `DashboardLayout`, `Line`, `ScrollView`, `VirtualColumn`, `ZStack`, `Text`, `Label`, `Image`, `Icon`, `Avatar`, `Badge`, `Alert`, `Spinner`, `Skeleton`, `Progress`, `Integration`, `Box`, `Card`, `List`, `Table`, `Tags`, `Banner`, `Collapse`, `Grid`, `GridItem`, specialized cards, `Canvas`, `Rect`, `Circle`, `Path`, `LinearGradient`, `BurgerIcon`, `CardSvg`. `Stakent*` exist in `StakentComponents.tsx` but are **not** public exports.

---

## 2. Reactivity (signals / computed / observables)

| Sev | Title | File:line | Evidence | Fix | Fixed? |
|-----|-------|-----------|----------|-----|--------|
| critical | bindSignal stale tree | see P0 | see P0 | Re-assemble | **Yes** |
| high | Wrappers used `useEffect` + `forceUpdate` | `StateWrapper.tsx` | StrictMode double-subscribe; tearing | `useSyncExternalStore` | **Yes** |
| medium | `useSignal` extra `setValue` in effect | `hooks.ts` ~7 | StrictMode churn | Drop redundant set | 1.1 |
| medium | Computed dirty/notify ordering | `state.ts` `ComputedSignal` | First `value` read required to attach `internalEffect` | Document; lazy init is OK if read | No |
| medium | `ValueBinder` signals without `subscribe` | `builder.ts` `FluentValueBuilder` | No-op unsubscribe | Require `subscribe` in types | 1.1 |
| low | Global `activeEffect` | `state.ts` | Not React-concurrent-safe across roots | Per-root tracker | 2.0 |
| low | No SSR story for signals | — | Signals are in-memory | Document client-only | 1.1 docs |

Leaks: `Observer` / wrappers dispose on unmount. `Effect.dispose` exists. Unsubscribing looks correct after the `useSyncExternalStore` change. Stale closures remain in `Router.navigate` (`route` in deps) — 1.1.

---

## 3. TypeScript

| Sev | Title | Evidence | Fix | Fixed? |
|-----|-------|----------|-----|--------|
| high | Children rejected builders | `ReactNode` only | `FiboChild` | **Yes** |
| medium | Widespread `any` on `*Inner` props | e.g. `Button/index.ts` | Typed inner props | 1.1 |
| medium | `FiboBuilder._props: Record<string, any>` public | `builder.ts` | Narrow / `@internal` | 2.0 (removing is breaking) |
| medium | Dual `useStore` / `Store` (decorator vs `createStore`) | `src/state/Store.ts` vs `core/state.ts` | Document; explicit re-exports | 1.1 docs |
| medium | `moduleResolution: "bundler"` + `allowImportingTsExtensions` | `tsconfig.json` | Fine for Vite lib; consumers get bundled `dist` | OK |
| medium | No NodeNext `.js` import specifiers in `src/` | TS paths are extensionless | Keep bundling; don’t switch src to NodeNext without a plan | 2.0 |
| low | `StyleBuilder` + `CSSProperties` index signatures | Proxy CSS methods can collapse to `any` | Branded CSS method map | 1.1 |
| low | `Page.ts` `React.ComponentType` | May need `import type` | Import `ComponentType` | 1.1 |

---

## 4. Packaging (`package.json`)

| Sev | Title | Evidence | Fix | Fixed? |
|-----|-------|----------|-----|--------|
| medium | No `exports` / `sideEffects` | 1.0.2 package | Conditional exports + CSS + `sideEffects` | **Yes** (additive) |
| medium | React peer `^18` vs dev React 19 | `package.json` | `>=18` | **Yes** |
| medium | `files` includes full `src` (~11 MB unpacked) | `npm pack --dry-run` | Publish `dist` only | 1.1 (some consumers import `src`) |
| low | No `"type": "module"` | Dual CJS/ESM via Vite | Keep dual for now | 2.0 |

---

## 5. Build / bundle

| Sev | Title | Evidence | Fix | Fixed? |
|-----|-------|----------|-----|--------|
| high | `minify: false` | `vite.config.ts`; ESM ~1.91 MB / gzip ~339 kB | Enable minify | 1.1 (output-only, but keep 1.0.3 predictable) |
| medium | Monolithic entry, poor tree-shaking | One chunk + ripple dynamic import | Subpath exports | 2.0 |
| medium | CSS always imported from `src/index.ts` | Side-effect stylesheet | Optional CSS entry only | 2.0 (breaking if JS stops emitting CSS) |
| low | UMD missing `react/jsx-runtime` global | Rollup warning | Add global | 1.1 |
| low | `style.css` ~677 kB raw (Tailwind) | Full utility sweep | Content-path purge / split themes | 1.1 |

---

## 6. CSS / theme

| Sev | Title | File:line | Evidence | Fix | Fixed? |
|-----|-------|-----------|----------|-----|--------|
| high | Orphan declarations | `web.css` | esbuild warning | `.fibo-tag` rule | **Yes** |
| medium | Duplicate theme tokens | `base.css` vs `themes/*.css` | Different `--fibo-primary` (#1976d2 vs #6750A4); import order overwrites M3 | Single source of truth | 1.1 (**visual breaking**) |
| medium | `.fibo-card` border then `border: none` | `material.css` ~98 | Dead rule | Delete | 1.1 |
| low | Ripple keyframes name mismatch | `core.css` `fibo-ripple-anim` vs `effects.ts` `fibo-ripple` | Animation may no-op | Align names | 1.1 |
| low | Unused `.fibo-flex-center` | `core.css` | No references | Remove | 1.1 |
| low | Missing `--fibo-on-surface-variant` on web tokens | `web.css` table `th` | Undefined var | Added in theme block | **Yes** |

---

## 7. Accessibility

| Sev | Title | File | Fix | Fixed? |
|-----|-------|------|-----|--------|
| high | Select/Combobox | see above | ARIA + keyboard | 1.1 |
| high | Collapse disclosure | see above | button + aria | 1.1 |
| medium | Button default `type` | implicit `submit` in forms | `type="button"` | **Yes** |
| medium | Spinner/Skeleton no `role="status"` | `Spinner`, `Skeleton` | label + role | 1.1 |
| medium | Progress no `progressbar` | `Progress` | aria-valuenow | 1.1 |
| low | Table `th` missing `scope` | `Table` | `scope="col"` | 1.1 |

No `dangerouslySetInnerHTML` / `innerHTML` / `eval` / `document.write` in `src/`.

---

## 8. Performance

- `React.memo` on many `*Inner` shells is good; wrappers that rebuild on every signal tick re-create the whole subtree (acceptable for 1.0.3; fine-grained DOM updates would be 2.0).
- `getClassName` mutation (fixed) caused class-list growth under Observer.
- Random SVG keys force remount (1.1).
- Unminified bundle (1.1).

---

## 9. Security

- Library source: no HTML injection sinks found.
- `npm audit --omit=dev`: **0** production vulnerabilities.
- Full `npm audit` (dev tree): 36 (1 low, 14 moderate, 19 high, 2 critical) — VitePress / vite / vite-plugin-dts / Vue chain. Not shipped to consumers. Bump in 1.1.

---

## 10. Docs vs API

Fixed in README (this PR). Remaining docs/ drift:

| Sev | Location | Drift |
|-----|----------|-------|
| medium | `docs/components/content-all.md` | `Alert().message`, `Badge().label` / `variant('info')` — actual: `.description()`, `.intent()`, Badge `.text()`, variants `neutral\|accent\|…` |
| medium | `docs/guide/getting-started.md` | `Text().size("xl").bold()` — use `.variant()` / `.weight()` / CSS proxy |
| low | `docs/components/interactive-button.md` | Documents `.label()` — actual `.text()` |
| low | Stakent helpers | Demo-only; do not document as public until exported |

---

## 11. Tests / CI / lint

| Sev | Title | Evidence | Fixed? |
|-----|-------|----------|--------|
| high | No tests | 1.0.2 had zero `*.test.*` | **Yes** — Vitest + Testing Library |
| high | No CI | No `.github/workflows` | **Yes** — type-check + test |
| medium | `lint` script without eslint | `eslint: not found` | 1.1 add ESLint or drop script |
| low | No Prettier / no CHANGELOG | — | CHANGELOG **added** |

---

## 12. Breaking proposals (1.1 / 2.0 only)

Do **not** ship these in 1.0.3:

1. **Column default `crossAxisAlignment: 'stretch'`** — matches CSS flex, breaks shrink-wrapped buttons. Prefer opt-in.
2. **Column default `center`** — matches Flutter/SwiftUI, moves children horizontally vs 1.0.2 `start`.
3. **Eager-build removal** — always lazy-build children so static arrays re-read signals (behavior change).
4. **Drop `src/` from `files`** — smaller pack; breaks `fiboui/src/...` imports.
5. **CSS not imported from JS** — consumers must `import 'fiboui/style.css'` only.
6. **Minify + split / subpath exports** — new import paths.
7. **Unify theme tokens** — visual change (Material primary hex).
8. **Remove unused public methods** (`GridVariant 'bento'`, no-op APIs) — type breaking.
9. **NodeNext + `.js` specifiers in published types** — consumer TS config change.
10. **Curated exports** (stop `export *`) — missing names at compile time.

---

## Suggested 1.1 order

1. ESLint + a11y for Select/Combobox/Collapse/Progress.
2. Virtual list measurement loop + horizontal list.
3. Theme token single source + ripple keyframes.
4. Minify and document CSS import.
5. `useBuilderState` or remove `.state()` wrapper.
6. Docs/ alignment for `docs/`.

## Suggested 2.0

- Fine-grained DOM updates (signals write into text nodes).
- Subpath exports / tree-shaking.
- Constraint-based layout closer to Flutter (optional).
- Drop dual Store APIs or namespace them.
