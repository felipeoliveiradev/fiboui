# FiboUI 1.0.3 audit (production-perfect pass)

Scope: `teste` at `d44d678` (package `1.0.2`) plus this PR. npm `fiboui@1.0.2` `gitHead` is `a47e5c5`. **Only git branch was `teste`.** This PR stays **1.0.3** (non-breaking). Nothing was published.

Legend: **Fixed** includes the covering test name. Items that would break existing apps are listed under [Intentionally not fixed](#intentionally-not-fixed).

---

## P0 — reported 1.0.2 real-app issues

| # | Severity | Finding | File:line | Fix | Status / test |
|---|----------|---------|-----------|-----|---------------|
| 1 | **critical** | `bindSignal()` did not update UI | `src/core/builder.ts`; `src/core/StateWrapper.tsx` | Function children + `useSyncExternalStore` | **Fixed** — `tests/bind-signal.test.tsx` |
| 2 | **high** | Builders not assignable after typed methods | `src/core/builder.ts` `children()` | `FiboChild` / `FiboChildren` | **Fixed** — `tests/children-types.test.tsx` |
| 3 | **high** | Function `.children()` skipped auto-build | `src/core/builder.ts` `processChildren` | `normalizeFiboChildren` | **Fixed** — `tests/children-autobuild.test.tsx` |
| 4 | **high** | Button overwrote user `.style()` | `src/interactive/Button` | User inline style last | **Fixed** — `tests/button-style.test.tsx` |
| 5 | **medium** | Column + Row `spaceBetween` collapsed | `Column` / `Row` | Row `self-stretch`; Column stays `start` | **Fixed** — `tests/column-row.test.tsx` |
| 6 | **medium** | Orphan CSS declarations | `src/styles/themes/web.css` | `.fibo-theme-web .fibo-tag` | **Fixed** — `tests/css-theme.test.ts` |
| 7 | **medium** | README out of date | `README.md` | `.onPress`, real Scaffold APIs | **Fixed** — `tests/readme-examples.test.tsx` |

---

## 1. Correctness — builders & components

| Sev | Title | Fix | Status / test |
|-----|-------|-----|---------------|
| critical | Signal/observable wrappers did not rebuild | Function children + `useSyncExternalStore` | **Fixed** — `tests/bind-signal.test.tsx` |
| high | `FiboApp` `ProviderWrapper` without `providers` | Empty maps / default props | **Fixed** — `tests/audit-fixes.test.tsx` (`ProviderWrapper defaults`) |
| high | `NavLink` stale active state | `useRouter().currentPath` | **Fixed** — `tests/audit-fixes.test.tsx` (`NavLink active class`) |
| high | `ScrollView` ignored `processChildren` | `processChildren()` | **Fixed** — `tests/children-autobuild.test.tsx` |
| high | `Grid` / `GridItem` overrode `children()` | Inherited `children` + `processChildren` | **Fixed** — `tests/children-autobuild.test.tsx` |
| high | Router params one frame late | Context `params: matchedParams` | **Fixed** — `tests/audit-fixes.test.tsx` + `tests/production-audit.test.tsx` (`Link basename`) |
| high | Router / `useLocation` assume `window` | `typeof window` guards | **Fixed** — `tests/production-audit.test.tsx` (`SSR window guards`) |
| high | Builder `.state()` had no runtime update | `useBuilderState` + reactive `StateWrapper` | **Fixed** — `tests/production-audit.test.tsx` (`useBuilderState reads and writes`) |
| high | Virtualization height cache did not re-layout | `layoutVersion` bump when measured size changes | **Fixed** — `tests/production-audit.test.tsx` (`VirtualColumn remounts layout`) |
| high | `Select` / `Combobox` missing listbox ARIA + keyboard | WAI-ARIA combobox/listbox + arrows/Enter/Escape | **Fixed** — `tests/production-audit.test.tsx` (`Select exposes listbox`, `Combobox uses combobox`) |
| high | `Collapse` header was a clickable `div` | `<button aria-expanded>` + `role="region"` | **Fixed** — `tests/production-audit.test.tsx` (`uses a button with aria-expanded`) |
| medium | `DashboardLayout` / `Collapse` did not build slot builders | `buildChild()` | **Fixed** — `tests/children-autobuild.test.tsx` + smoke |
| medium | `Image.foregroundStyle` no-op | Apply as `style.color` | **Fixed** — `tests/audit-fixes.test.tsx` |
| medium | `getClassName()` mutated `_classNames` | Compute extra classes without push | **Fixed** — Observer rebuilds in `tests/bind-signal.test.tsx` |
| medium | `GridVariant` `'bento'` unimplemented | Dense auto-flow span pattern | **Fixed** — `tests/production-audit.test.tsx` (`Grid bento`) |
| medium | `responsive()` only merged `mobile` | `applyResponsiveStyles` + `ResponsiveWrapper` on resize | **Fixed** — `tests/production-audit.test.tsx` (`applyResponsiveStyles picks tablet and desktop`) |
| medium | `AnimatedWrapper` applied transforms after effect | Seed from `signal.value` | **Fixed** — `tests/production-audit.test.tsx` (`seeds transform`) |
| medium | List virtualized ignored `direction: 'horizontal'` | `translateX` / `scrollLeft` / overflow-x | **Fixed** — `tests/production-audit.test.tsx` (`List virtualized horizontal`) |
| medium | `Sidebar` plugin active path at build time | `useRouterOptional()` in `SidebarInner` | **Fixed** — `tests/production-audit.test.tsx` (`Sidebar plugin items`) |
| medium | `Link` `href` ignored `basename` | Prefix `router.basename` | **Fixed** — `tests/production-audit.test.tsx` (`prefixes href with Router basename`) |
| medium | Checkbox/Switch double toggle; `indeterminate` not on DOM | Single native control; `input.indeterminate` | **Fixed** — `tests/production-audit.test.tsx` (`Checkbox click toggles once`, `Switch click toggles once`) |
| medium | SVG shapes random `key` every build | Stable `rect-group` / `circle-group` / `path-group` | **Fixed** — `tests/production-audit.test.tsx` (`does not remount grouped shapes`) |
| medium | `VirtualColumn` `cloneElement` on non-elements | Wrap every child in a measuring `div` | **Fixed** — `tests/production-audit.test.tsx` (`wraps non-element children`) |
| medium | Theme `initialTheme` ignored after mount | `useEffect` syncs `theme` prop | **Fixed** — `tests/production-audit.test.tsx` (`syncs when the theme prop changes`) |
| low | `hasStateManagement()` unused | Used in `createBuilder` wrap path | **Fixed** — `tests/bind-signal.test.tsx` (wrappers still attach) |
| low | `StoreImpl.setState` always notified | Shallow compare; skip identical values | **Fixed** — `tests/production-audit.test.tsx` (`setState does not notify`) |
| low | `PluginManager.registerStore` empty | Store map + `getStore` / `getStores` | **Fixed** — `tests/production-audit.test.tsx` (`PluginManager.registerStore`) |
| low | `RadioGroup` random `name` per `build()` | `useId` in inner | **Fixed** — `tests/production-audit.test.tsx` (`keeps a stable name`) |
| low | Tags/Table index keys | Title/id keys; `th scope="col"` | **Fixed** — `tests/production-audit.test.tsx` (`Table headers`, `Tags render`) |
| low | LinearGradient / pseudo-class random ids | `nextStableId()` | **Fixed** — `tests/production-audit.test.tsx` (`nextStableId is deterministic`) |

Public factories smoke-rendered in `tests/builders-smoke.test.tsx`. `Stakent*` remain demo-only (not public exports).

---

## 2. Reactivity (signals / computed / observables)

| Sev | Title | Status / test |
|-----|-------|---------------|
| critical | bindSignal stale tree | **Fixed** — `tests/bind-signal.test.tsx` |
| high | Wrappers used `useEffect` + `forceUpdate` | **Fixed** — `useSyncExternalStore` in `SignalWrapper` / `ObserverWrapper` / `Observer` / `useSignal` — `tests/production-audit.test.tsx` (`unsubscribes on unmount and survives StrictMode`) |
| medium | `useSignal` extra `setValue` in effect | **Fixed** — hook is `useSyncExternalStore` only — same test |
| medium | Computed dirty/notify ordering | **Fixed (docs + test)** — first `.value` read attaches the effect — `tests/production-audit.test.tsx` (`computes on first read`) + `docs/guide/state-management.md` |
| medium | `ValueBinder` signals without `subscribe` | **Fixed** — `subscribe` required — `tests/production-audit.test.tsx` (`ValueBinder requires subscribe`) |
| medium | Router `navigate` stale `route` in deps | **Fixed** — `routeRef.current` — `tests/production-audit.test.tsx` (`Link basename`) |
| low | No SSR story for signals | **Fixed (docs)** — README + state-management: client-only — `tests/readme-examples.test.tsx` |
| low | Global `activeEffect` not concurrent-root-safe | **Not fixed** — see below (2.0 architecture) |

Leaks: Observer / wrappers / `useSignal` / `useReactiveStore` / `useObservable` dispose on unmount. Covered by StrictMode + unmount tests.

---

## 3. TypeScript

| Sev | Title | Status / test |
|-----|-------|---------------|
| high | Children rejected builders | **Fixed** — `tests/children-types.test.tsx` |
| medium | Widespread `any` on `*Inner` props | **Fixed** for Select, Combobox, Checkbox, Switch, RadioGroup, Collapse, Sidebar, VirtualColumn — `tests/production-audit.test.tsx` |
| medium | `FiboBuilder._props` public | **Documented `@internal`**; type left as `Record<string, any>` so existing `.props()` callers type-check. Removing the field would be breaking. |
| medium | Dual `useStore` / `Store` | **Documented**; hook aliased `useReactiveStore` — `tests/production-audit.test.tsx` (`useReactiveStore updates`) + README |
| medium | `moduleResolution: "bundler"` | **OK** — consumers get rolled-up `dist/index.d.ts` — `tests/packaging.test.ts` |
| low | `Page.ts` `React.ComponentType` | **Fixed** — `import type { ComponentType }` — `npx tsc --noEmit` |
| low | StyleBuilder + CSS proxy `any` collapse | **Not fixed** — branded method map would change inference for CSS proxies (see below) |

---

## 4. Packaging (`package.json`)

| Sev | Title | Status / test |
|-----|-------|---------------|
| high | `react-dom/client` not external | **Fixed** — `tests/packaging.test.ts` |
| high | `exports.require` → UMD | **Fixed** — `index.cjs.js` — `tests/packaging.test.ts` |
| high | Split `.d.ts` without `.js` | **Fixed** — `rollupTypes: true` — `tests/packaging.test.ts` |
| medium | No `exports` / `sideEffects` | **Fixed** — `tests/packaging.test.ts` (`exports map covers ESM, CJS, types, and CSS`) |
| medium | React peer `^18` vs dev 19 | **Fixed** — `>=18` — same test |
| medium | `files` includes full `src` | **Not fixed** — some consumers import `fiboui/src/...` (breaking to drop) |
| low | No `"type": "module"` | **Not fixed** — dual CJS/ESM; `eslint.config.mjs` used instead |

---

## 5. Build / bundle

| Sev | Title | Status / test |
|-----|-------|---------------|
| high | `minify: false` | **Fixed** — `vite.config.ts` `minify: 'esbuild'` — `tests/packaging.test.ts` (externals still hold) |
| low | UMD missing `react/jsx-runtime` global | **Fixed** — globals already include `react/jsx-runtime` / `jsx-dev-runtime` |
| medium | Monolithic entry / subpath exports | **Not fixed** — new import paths would be 2.0 |
| medium | CSS always imported from `src/index.ts` | **Not fixed** — removing is breaking if JS stops emitting CSS |
| low | `style.css` ~677 kB Tailwind sweep | **Not fixed** — aggressive purge can drop dynamic utility classes |

---

## 6. CSS / theme

| Sev | Title | Status / test |
|-----|-------|---------------|
| high | Orphan declarations | **Fixed** — `tests/css-theme.test.ts` |
| low | Missing `--fibo-on-surface-variant` | **Fixed** — `tests/css-theme.test.ts` |
| medium | `.fibo-card` border then `border: none` | **Fixed** — `tests/production-audit.test.tsx` (`material card has a single border`) |
| low | Ripple keyframes name mismatch | **Fixed** — `@keyframes fibo-ripple` matches `effects.ts` — `tests/production-audit.test.tsx` (`core.css uses fibo-ripple`) |
| low | Unused `.fibo-flex-center` | **Fixed** — removed — same test |
| medium | Duplicate theme tokens (`#1976d2` vs `#6750A4`) | **Not fixed** — unifying hex is a visual breaking change |

---

## 7. Accessibility

| Sev | Title | Status / test |
|-----|-------|---------------|
| high | Select/Combobox | **Fixed** — `tests/production-audit.test.tsx` |
| high | Collapse disclosure | **Fixed** — `tests/production-audit.test.tsx` |
| medium | Button default `type` | **Fixed** — `tests/button-style.test.tsx` |
| medium | Spinner/Skeleton `role="status"` | **Fixed** — `tests/production-audit.test.tsx` (`Spinner and Skeleton expose status`) |
| medium | Progress `progressbar` | **Fixed** — `tests/production-audit.test.tsx` (`Progress exposes progressbar`) |
| low | Table `th` `scope` | **Fixed** — `tests/production-audit.test.tsx` (`Table headers have scope=col`) |

No `dangerouslySetInnerHTML` / `innerHTML` / `eval` / `document.write` in `src/`. ESLint `no-eval` / `no-new-func`.

---

## 8. Performance

- Inner shells stay `React.memo`. Signal ticks still rebuild the bound subtree (fine-grained text-node writes would be 2.0).
- `getClassName` mutation (fixed) no longer grows class lists.
- SVG keys are stable (no remount).
- Bundle is minified.
- 100 sequential signal writes: `tests/production-audit.test.tsx` (`100 signal writes`).

---

## 9. Security

- Library source: no HTML injection sinks.
- `npm audit --omit=dev`: **0** production vulnerabilities (re-check at release).
- Full `npm audit` (dev tree: VitePress / vite / vue) is **not shipped**. Bumping those is a docs-toolchain task, not a consumer fix.

---

## 10. Docs vs API

| Sev | Location | Status |
|-----|----------|--------|
| medium | `docs/components/content-all.md` | **Fixed** — `.description()` / `.intent()`; Badge `.text()` + `neutral\|accent\|…` |
| medium | `docs/guide/getting-started.md` | **Fixed** — `.variant()` / `.weight()` |
| low | `docs/components/interactive-button.md` | **Fixed** — `.text()` / `.onPress()` |
| low | Stakent helpers | **Documented** as demo-only (not exported) |
| — | Dual stores + computed lazy + SSR signals | **Fixed** — README + `docs/guide/state-management.md` |

---

## 11. Tests / CI / lint

| Sev | Title | Status |
|-----|-------|--------|
| high | No tests | **Fixed** — Vitest + Testing Library (`npm test`, 62+ cases) |
| high | No CI | **Fixed** — `.github/workflows/ci.yml` type-check + test |
| medium | `lint` script without eslint | **Fixed** — `eslint.config.mjs` + `npm run lint` |
| low | No CHANGELOG | **Fixed** — `CHANGELOG.md` |
| — | Coverage | `npm run test:coverage` (`@vitest/coverage-v8`). Smoke + audit tests cover the public builder surface; CLI / specialized cards remain thinner (not part of the 1.0.3 consumer API story). |

---

## Extra production checks (this pass)

| Check | Status / test |
|-------|---------------|
| Memory leaks / StrictMode double-mount | **Fixed** — `useSyncExternalStore` + dispose — `unsubscribes on unmount and survives StrictMode` |
| SSR safety | **Fixed** — window guards, `getServerSnapshot`, no CSS media at build — `SSR window guards` |
| React 18 and 19 | **Fixed** — peers `>=18`; hooks use `useSyncExternalStore` (18+) — packaging + leak tests |
| Tree-shaking / `sideEffects` | **Fixed** (CSS + entry marked) — `tests/packaging.test.ts`. Full subpath split is 2.0. |
| Exports map + types ESM/CJS | **Fixed** — `tests/packaging.test.ts` |
| Runtime console warnings | **Fixed** for library code (no `console.log` on plugin load; Observer no longer `console.error`). Residual React `key` warnings on some pre-existing fragment lists are listed below. |
| A11y on interactive components | **Fixed** — Select, Combobox, Collapse, Checkbox, Switch, RadioGroup, Button, Progress, Spinner, Skeleton, Table |
| Many re-renders | **Fixed** — `100 signal writes re-render a bound tree without warnings` |

Pack/Vite/Next leftovers from verification remain fixed: externals, `rollupTypes`, CJS, `'use client'` docs. See `VERIFICATION.md`.

---

## Intentionally not fixed

These are **breaking**, architectural 2.0, or consumer-toolchain issues. Shipping them in 1.0.3 would break existing apps or change visuals.

1. **Column default `stretch` or Flutter `center`** — visual/layout break vs 1.0.2 `start`. Opt in with `.crossAxisAlignment('stretch'|'center')`.
2. **Eager-build removal** (always lazy-build static arrays so they re-read signals) — behavior change; function children already re-read.
3. **Drop `src/` from `files`** — breaks `fiboui/src/...` imports. Planned 1.1 with a deprecation note.
4. **Stop importing CSS from JS** — consumers that rely on `import 'fiboui'` pulling styles would lose them. Keep `import 'fiboui/style.css'` documented.
5. **Subpath exports / split chunks** — new import paths. `sideEffects` is set so bundlers can still tree-shake unused ESM bindings from the single entry.
6. **Unify theme token hexes** (`#1976d2` vs Material `#6750A4`) — visual breaking.
7. **Remove `GridVariant 'bento'`** — implemented instead of dropping the type.
8. **NodeNext `.js` specifiers in `src/`** — requires rewriting every internal import; published types are already rolled up.
9. **`"type": "module"`** — would change `require('fiboui')` resolution for CJS consumers.
10. **Curated `export *`** — missing names at compile time.
11. **Per-root `activeEffect` tracker** — concurrent multi-root isolation needs a 2.0 reactivity rewrite.
12. **Fine-grained DOM writes** (signals patch text nodes) — 2.0 renderer.
13. **Merge the two Store APIs** — decorator `useStore(Class)` vs `useReactiveStore(createStore())` documented; merging would break one of them.
14. **`FiboBuilder._props` removal / narrowing to a closed type** — breaking for `.props({ onClick, ... })`. Marked `@internal`.
15. **Branded CSS proxy method map** — would change how `Button().color(...)` infers and can make valid CSS methods fail.
16. **Purge / split the 677 kB Tailwind `style.css`** — dynamic class names (`grid-cols-${n}`) would disappear.
17. **Dev-only `npm audit` (VitePress/vite/vue)** — not shipped to consumers. Bump the docs toolchain separately.
18. **Some React `key` warnings on pre-existing fragment lists** (Header/Scaffold/Grid maps that pass builder arrays without keys). Not a functional bug; assigning keys at every `processChildren` site would change reconciliation and is deferred.

No breaking change was shipped. Version stays **1.0.3**.
