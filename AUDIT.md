# FiboUI audit

Package is **2.7.0**. Waves 8–27 shipped in this release.

---

## 2.7.0 — Waves 8–27

Product P0/P1 hunts after Waves 1–7. CHANGELOG `[2.7.0]` is the user-facing list. The 2.0.0 tables below stay shipped history — do not re-open them.

Waves 1–7 already shipped empty state, Form validators (`url` / `integer` / `equalTo`, blur, submitting), TextField helper/clear, interp on Label/Alert/ListTile/Button/Banner/Card/fields, `listSignal.search()` / `.filter()` snapshot / `.viewWhere()`, SVG no inset drop-shadow, `FiboApp` StrictMode, JS `--fibo-elevation-*`, Plugin SSR reset, Grid CSS longhands, Avatar overflow, VirtualColumn cache by key, Combobox/RadioGroup/Progress/Table/Tags interp, `url()` http/https only, site computed subscribe, List empty interp.

### Shipped (Waves 8–15)

| Wave | Product |
|------|---------|
| 8 | CLI generate stays under the project root; `toPascalCase` rejects null and prefixes digit names. Pan tracks `pointerId`; window listeners clean up; tap `pointercancel`. Persist skips missing `data`; include/exclude merge; quota rethrows. Presence leftover `animationend` / NaN; AnimatedWrapper text children. RSC `StateWrapper` passes `stateMap` / `providers`. `@Signal` is real; hooks bind `this`; empty `Page` path throws. LinearGradient unique ids; Path `d(null)`; Canvas fill defs. VS Code labels skip strings/comments; Noir JS/JSX; helper/clearable/Grid completions. Boilerplate `FiboApp` mount + Vite react dedupe. Demo / SSR fixtures `document` guard; Playwright `baseURL` on 127.0.0.1. |
| 9 | Parent `@Inject` on subclasses; skip native paramtypes. PluginManager `run()` uninstalls; LIFO teardown; duplicate name throws. Router query/hash split; basename not doubled; nested SSR; unmount cancels `beforeEnter`. Outlet outside Router is null; NavLink exact `matchPath`. Optional/splat match; guard self-redirect no-op; lazy ErrorBoundary recovers. Breadcrumbs exact match; DefaultLoader keyframes out of the live region. `--fibo-theme` + `color-scheme`; palette OOB; `ThemeType.noir`; cupertino/web/noir M3 containers; CSS tokens lockstep; noscript Reveal fallback. |
| 10 | Builder proxy `toCssDeclName` (`grid-template-columns`, `-ms-*`, `--vars`). Nested `interp()` resolve. CSS fluent expands axes without clobbering longhands; `aspectRatio` unitless. `mount('#root')` strips the hash; factory inside React; `page()` meta. StyleManager re-attaches a detached sheet. `watch(computed)` re-reads `.value`. Spring/transition NaN guards; `bindScrollProgress` without `document`. `buildChild` skips signals/null; `nextStableId` rewinds on SSR reset; `open()` guards a partial window. `toMediaQuery` strips leftover `@media`. Hover color-fn alpha; Reveal `once` unobserves. |
| 11 | Checkbox / Switch / Textarea error interp; Textarea `.helper()`. Form aria on the visible combobox; host blur; native reset clears paint. Button `.props({ type })` not overwritten. Password-eye mousedown does not commit; unnamed error `aria-describedby`. Select formError on combobox; open list highlights current. Combobox first keystroke replaces a committed label. RadioGroup error a11y + unnamed roving tabindex. Interactive barrels already export Form / `FormErrorMode` (NO_BUG). |
| 12 | `Text().text(null)` clears leftover nodes; FineGrain keeps `fibo-text`. Label drops colliding `text-sm`; `fibo-text-label`. Alert locks `role`/`live`; Dismiss. Image `isDangerousUrl`; `alt` always a string; `object-fit` vs resizable. Icon size clamp; drop javascript / inline SVG as `src`. Skeleton `aria-busy` + reduced-motion. Spinner reduced-motion. Integration iframe sanitize + sandbox. Avatar CSS `url()` sanitize; Progress `className` on the host. Content barrels already complete (NO_BUG). |
| 13 | Box children interp. Card no forced white; accent border; keep `fibo-card`. ListTile `.onClick` vs `.onPress`; extra `role` kept. Banner lock role/live; Dismiss. Collapse title inherits host color. Table cell FineGrain interp. Tags interp after bind; keys `_id`; keep `fibo-tags`. Grid masonry inline `break-inside`; bento placement on the grid child. ProfileCard banner URL sanitize; rest on Card host. Structure barrels already complete (NO_BUG). |
| 14 | Column / Row / Stack / Center / Line / Container / Header / Sidebar / ScrollView / DashboardLayout children interp. Row `.spacing(0)`. Stack top/bottom. Host classes kept. Header sticky offset is top+height. Sidebar dangerous href omitted; prefix active. Scaffold host props/`lang`; provider merge; overlay not a flex child. ScrollView overflow class; horizontal `scrollByChild`. `fibo-dashboard`. |
| 15 | Site hamburger name + `aria-expanded`; checkout/search `htmlFor`. Animation `document` guard. Monetron pressable a11y; e2e paths in-repo. `listSignal` publish copies so splice cannot hole the source. `Icons.Verify` `aria-hidden={false}`. ShapeBuilder `css({…})`; `boxShadow: 0`; inset filter strip; 3D transform as CSS. Subpath `types` + vite `closeBundle` d.ts. Playground `new Function` stays accepted P2 (NO_BUG). Types/test helpers and public barrels already complete (NO_BUG). |

### Shipped (Waves 16–22)

| Wave | Product |
|------|---------|
| 16 | Docs drift (guide / components / README / CHANGELOG Unreleased + this file through wave 15). CLI plugin stem `Plugin` is not an empty path. Pan foreign `pointerup` does not tear down the live pan. Persist restore **slices** `include` / `exclude` (stale full snapshot). RSC `AnimatedWrapper` text children + NaN transforms. VS Code `List.empty` / `TextField.clear` / itemStyle `insets` / `boxShadow`. Boilerplate Todo checkbox name + `.empty()`; interval cleanup; header button names. |
| 17 | Paren-aware box shorthand (`calc()` / `var()` / `clamp()`); sequential FiboBuilder `.style({ padding })` after axis longhands; `--fibo-*` keys survive `normalizeCssProperties`. DI process singletons drop on SSR `endSsrRequest`. Textarea placeholder interp. Unnamed Switch error `id`. Alert warning glyph (not Search). Box / Row extra `className` keeps the host class. |
| 18 | Table stamps `fibo-table`. Button invalid HTML `type` coerced to `button`. StyleManager request-local ALS for overlapping SSR. `open()` / `openExternal()` restore `isSafeOpenUrl` (ZWSP `javascript:`, `file:`, non-string no throw). Plugin `use()` in-flight same-name guard. `DIContainer.run()` forks singletons. RSC `Presence.show()`. Persist include/exclude when current is `null`. Tap / LongPress `pointerId` + capture + unmount `onEnd`. |
| 19 | `FormControl.reset(name)` clears painted errors. TextField helper+error `aria-describedby`; invalid `.type()`; password `autocomplete`; `inputMode` / `enterKeyHint`; clear dispatches `input`. Select `options[].disabled`. Combobox disabled / Escape / typed query. Checkbox indeterminate after click; `__fiboRules` on the host. Textarea `.resize()` vs `.props({ style })`. RadioGroup named roving tabindex; disabled `.value()` not shown selected. Form `.rules()` on Checkbox / Switch / Select / Combobox already attached (NO_BUG leftover). |
| 20 | Text `.children()` interp live; HTML vs CSS `.type()`; strip `dangerouslySetInnerHTML`. Alert decorative blobs `aria-hidden`. Image `src` / `alt` interp + `clipShape` overflow/radius. Skeleton first-party pulse + reduced-motion. Spinner visually-hidden label. Integration URL iframe sandbox. Avatar initials trim; Progress `aria-valuenow` clamp. |
| 21 | Box XSS / `role=button` / `as` / style merge. Card `.title()` / clickable / header / footer / `.as()`. ListTile leading/trailing interp; `onTap` / `href`. Banner action slot. Grid `.gridTemplateColumns()` + `rowGap` / `columnGap`. Tags unique keys / wrap / `onRemove`. InputCard dual `type` + `name` / `rules`. List key from `id`; virt empty reset; `onEndReached` IO guard (itemHover descendant CSS kept). |
| 22 | Column / Row `.spacing(0)` + `.props({ style })` merge. Center inline flex. Spacer grow survives `props.style`. Line column / decorative vs separator. Container XSS / `as` / `maxWidth` / inline center. Scaffold `.props({ children })` keeps chrome; `boxSizing` default. Dashboard fluent slots win over props. VirtualColumn host `.id()` / `.props()`. StakentCard stays a fluent Box (`.children()`). |

### Shipped (Waves 23–27)

| Wave | Product |
|------|---------|
| 23–26 | Last-write `.style()` vs `.css()` bags; computed notify + cycle guard; Link outside Router; basename / fragment dests; CSS custom-property `--` class idents hashed. |
| 27 | Reveal two-arg (scroll vs password); barrel sweep around user widgets; KEEP user APIs (`Text.italic` / `underline`, MapView, SecureField, RadioTile.group). |

WIP kept (do not revert): List `itemHover` descendant CSS (`scope, scope *`); playground indent / editor / `PlaygroundPage`. User widgets in content / interactive / layout / nav / overlay / structure stay.

### Honest leftover (not Waves 8–22 P0/P1)

Former Wave 17 re-hunts **shipped**: sequential `.style({ padding })` after axis longhands (W17-01 / W17-06); DI process singleton across Node SSR (W17-02 + W18-07 `run()` fork); Form `.rules()` on Checkbox / Switch / Select / Combobox (W11 + W19-05 host `__fiboRules`).

| Item | Status |
|------|--------|
| Default validation messages in English | By design — pass your own string |
| Playground `new Function` | Accepted P2 (same-origin; Run click only) |
| List `itemHover` descendant CSS + playground indent | WIP kept |
| True SVG inner shadow | Needs filter primitives; inset strip is the CSS fix |

---

## 2.0.0 (historical)

Scope: `teste` plus the 2.0.0 PR. **Nothing remains unfixed** from that pass. Version was **2.0.0** (breaking). Nothing was published.

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

Real-app pack verification (Vite 18 + Next 14 SSR + Playwright, 2026-10-14): [VERIFICATION.md](./VERIFICATION.md). **Passed.** Screenshots: `verify-vite-initial.png`, `verify-vite-after-clicks.png`, `verify-next-ssr.png`, `verify-next-after-clicks.png`.

---

## Intentionally not fixed

**None.**
