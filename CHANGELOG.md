# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

## [2.8.5] - 2026-10-20

### Fixed

- **`page` rebuilds only inside React render.** A root signal marks the page dirty and notifies. `produce()` runs in `view()`, so hooks in the page function (`useRouter`, `useState`) stay valid.
- **Dev warns when ownership is wrong.** A page root, an unsplit string template, and a failed live text slot each print once in development. A read inside `.observer()` / `.bindSignal()` does not warn or become a page root. Nested fluent calls (`.border()`, `.color()`) keep that owner — they do not steal it and false-warn.
- **`Table().data(listSignal)` and `Tags().items(listSignal)` update one row / tag** by `_id`, same contract as `List`.
- **Live text split rejects bare `toFixed` fragments.** `1.5` inside `1.50` does not claim the node — use `Format.fixed` / `Format.euro` (dev warns).

### Added

- **`Format`** — `fixed`, `euro`, `currency`, `percent`, `integer`, `compact` for live `Text` (alias `Transform`). Prefer these over `n.value.toFixed(2)`.
- **`Unit`** — `px`, `rem`, `em`, `percent`, `vh`, `vw` for live sizes (`Box().width(Unit.px(w))`).
- **`Plural`** — `of` / `word` for live count labels (`Plural.of(n, 'task', 'tasks')`).
- **`fiboDevStats()`** — returns `{ produces, replays, pageRoots, warns }` for ownership debugging in development.
- **`npm run pack:local`** — builds and writes `fiboui-<version>.tgz` under `.pack/` for sibling apps.
- **`Switch().checked(signal)`** — the switch owns that signal and stays controlled.

### Changed

- **README** — signal ownership decision tree, good/bad examples, helpers table, and local pack path under `.pack/`.
- **Subpath `.d.ts` are real bundles** — `build:dts` runs `dts-bundle-generator` per entry (`core`, `layout`, …), not re-exports of `index.d.ts`.
- **`StyleBuilder` d.ts size** — CSS fluent methods return `any` in types so `index.d.ts` stays ~180KB instead of tens of MB. Runtime chaining is unchanged.

## [2.8.4] - 2026-10-19

### Fixed

- **Each node owns the signals it read, on every fluent method.** `Box().width(n.value)` and `Box().width(\`${n.value}px\`)` replay on that box. `Text(\`Pontos ${n.value}\`)` and `Button(\`Menu ${n.value}\`)` keep the sentence and write that text node. The page function does not run again. A sibling and an `.observer()` branch stay put.
- **`page` reads the formula by itself.** `Box().width(n.value + 1)` stays on that box. The text of the page function is scanned once. Sum, subtract, multiply, divide, and a written number replay there. A local that is not a signal still belongs to the page function.
- **`List().items(listSignal)` updates one row.** `update` / `replace` rewrite that `_id`. `add` / `remove` / `set` / `view` mount or unmount rows. A row that stays does not run `renderItem` again. `.subscribe` still hears every mutation. A read inside `.observer()` stays on that box, so the page function does not run again.
- **`computed` stays on the node that read it.** `Text(\`${left.value} left\`)` writes that text. Reads inside the computed (the list, another signal) do not subscribe the page. A sibling stays.

## [2.8.3] - 2026-10-19

### Added

- **`signal().set()` / `.change()` / `.reset()`** — extra writes on a plain signal, same notify path as `.value =`. `.change(n => n + 1)` takes an updater. `.reset()` restores the value passed to `signal(initial)`. `listSignal.update(id, patch)` stays the item patch.

## [2.8.2] - 2026-10-19

### Added

- **Tokens for the closed sets** (`Align`, `Size`, `Space`, `Radius`, `Color`, `Motion`, `Effect`, variants, and the rest of the fluent vocabulary). Same shape as `When`. A raw string or number still works. `Space`, `Radius`, and `Color` read the active theme. The editor completes `Align.center` inside `.align(`.
- **`.width()` / `.height()` lock the axis** (`min-width` / `min-height` and `flex-shrink: 0`). A size passed into the Scaffold body is kept, and the body scrolls. `.flex(1)` after the size opts back into sharing the viewport.
- **`signal()` inside `page()` stays the same signal.** `Text(\`Menu ${count.value}\`)` and `Button(\`Menu ${count.value}\`)` write the text node in place. The scaffold does not render again. No `useEffect`. A read that changes layout still commits the tree. A signal created outside the page is unchanged.

## [2.8.1] - 2026-10-19

### Fixed

- **`leaflet` is a dependency.** `leafletEngine()` imports it from `dist/index.js`, so the module has to be installed with the package. Vite still leaves that import external; it is not copied into the bundle.

## [2.8.0] - 2026-10-19

### Added

- **`leafletEngine()`** loads the `leaflet` package on the client when no namespace is passed. `MapView()` stays a builder, including on the server.
- **`AppBar` and `ToolbarItem`** — `.appBar(AppBar().items([...]))`. A `ToolbarItem` sits at `.leading()`, `.principal()`, or `.trailing()` (several trailing items share the actions slot). `.onPress()`, `.tooltip()`, `.disabled()`, `.size({ width, height })` locks each axis on its own, like Flutter `SizedBox`. `.openDrawer()` / `.openEndDrawer()` are handled by the scaffold, so the page does not call `useScaffold()`.
- **`Scaffold` slots** — `.fab()` / `.fabAt()`, `.drawer()` / `.endDrawer()`, `.bottomSheet()`, `.footerButtons()`, `.extendBody()`, `.extendBehindHeader()`, `.avoidKeyboard()`. `useScaffold()` opens them. Drawer, snack bar, sheet, and keyboard inset update the DOM directly, so the body does not re-render.
- **`tone(color, level)`** — the color, its steps (`-8`…`8`), and `tone.sheet(color)`: `on`, `container`, `secondary`, `tertiary`, `opposite`, `near`, `sides`, `three`, `four`, `mute`. CSS `color-mix` / `hsl(from)` so tokens work. Ink is computed in JavaScript. No state.
- **User paint wins** — `.height()`, `.width()`, `.bg()`, and any other CSS method write an inline style plus a `fibo-*` class in the same Tailwind group as the host utility (`h-auto`, `h-14`, `bg-transparent`). `fiboCn` drops the host class. Same rule on every component that merges chrome with the builder classes.
- **`.when(When, style)`** — one paint method. `When` is the closed set: `hover`, `focus`, `active`, `visited`, `disabled`, `on` / `checked`, `off` / `unchecked`, `indeterminate` / `mixed`. On `List`, `hover` / `focus` / `active` paint each row. On Checkbox and Switch, `on` / `off` replace the default fill.
- **`.alignX()` / `.alignY()`** — screen-axis alignment (horizontal / vertical). Same meaning on `Row` and `Column`: X is left–right, Y is top–bottom. Prefer these over remembering main/cross. `centerX` / `centerY` now go through the same mapping (so they stay correct when `flexDirection` is column).
- **Editor marketplace pipeline** — GitHub Actions packages the VS Code / Cursor extension (editor support and **FiboUI Noir** in one VSIX) and publishes to the Visual Studio Marketplace (`VSCE_PAT`) and Open VSX / Cursor (`OVSX_PAT`). Each store is skipped when its secret is missing or that version already exists.

## [2.7.1] - 2026-10-17

### Fixed

- **RSC Button** — Next App Router prerender no longer fails with `Event handlers cannot be passed to Client Component props`. The `react-server` entry paints the same `<button>` without `onClick` / `onMouseEnter`; the client island still runs material ripple and `.onPress()`.

## [2.7.0] - 2026-10-17

Widget wave + audit passes that sat unreleased on 2.6.4 (`aab933c`). This is the npm publish of that work.

### Added

- **Widgets — content** — `AsyncImage`, `Chart`, `ContentUnavailable`, `Gauge`, `MapView` (canvas / Leaflet / Google), `Markdown`, `NumericText`, `PdfView`, `RichEditor`, `RichText`, `SelectableText`, `VideoPlayer`, `WebView`.
- **Widgets — interactive** — `Calendar`, `CodeScanner`, `ColorPicker`, `ContextMenu`, `DatePicker`, `DateRangePicker`, `DragTarget`, `Draggable`, `FilePicker`, `Hero`, `InteractiveViewer`, `Menu`, `OtpField`, `PhotosPicker`, `RangeSlider`, `SearchBar`, `SecureField`, `SegmentedButton`, `SensoryFeedback`, `Shake`, `ShareLink`, `Shortcuts`, `Slider`, `Stepper`, `TimePicker`, `Tooltip`, `WheelPicker`.
- **Widgets — structure** — `Carousel`, `CheckboxTile`, `Dismissible`, `LazyGrid`, `OutlineGroup`, `PageView`, `RadioTile`, `RefreshIndicator`, `ReorderableList`, `Searchable`, `Section`, `SwipeRow`, `SwitchTile`, `Wizard`.
- **Widgets — layout / nav / overlay** — `AspectRatio`, `Baseline`, `CustomScrollView`, `Inspector`, `KeyboardInset`, `LayoutBuilder`, `NavigationSplitView`, `OrientationBuilder`, `Overlay`, `PopScope`, `SafeArea`, `SliverAppBar`, `SliverList`, `ViewThatFits`, `Wrap`, `Anchor`, `BottomBar`, `Breadcrumbs`, `NavigationBar`, `NavigationRail`, `TabView`, `Toolbar`. Overlays live in `src/overlay`. Graphics: `MeshGradient`.
- **Playground Kit** — demo chip for the new widgets; leaflet / lucide-react imports; preview height for Web / PDF / Empty / Inspector.

- **`List().empty(...)`** — shown when there are no rows. String, node, builder, or a factory that re-runs on rebuild.
- **`fiboui/interactive`** — re-exports `Form`, the validation helpers, and `FormErrorMode`.
- **RadioGroup `.rules()` / `.error()`** — field checks and a painted error line, same as the other named controls. Checkbox / Switch / Select / Combobox / Textarea `.rules()` attach the same way.
- **`ComputedSignal.dispose()`** — drops the internal effect and listeners.
- **SSR builders** — `createPage`, `Header`, `Scaffold`, `Grid`, and `GridItem` from the `react-server` entry. RSC `Presence.show()` matches the client chain.
- **Shape CSS** — unknown methods on `Circle` / `Rect` / `Path` write inline style (`cursor`, `pointerEvents`, `boxShadow(0)`, logical axes). SVG `.shadow(dx, dy, blur, color)` stays a drop-shadow.
- **Nested routes** — a parent with `children` is a layout and renders `Outlet`. Prefix and `*` match; `lazyRoute` / `preloadRoute` share one fetch; `useRouteMeta` reads the leaf. Guards run on the whole chain; the error boundary remounts on navigation.
- **Plugins** — `uninstall(name)` and `resetForTests()` drop that plugin's routes, stores, and services. Getters return copies.
- **TextField `.helper()` / `.clearable()`** — helper line under the field. A clear control when there is a value. `.clear(true)` is the same write. `.inputMode()` / `.enterKeyHint()` stamp native attributes (not CSS classes).
- **Validation** — `url`, `integer`, `equalTo`. Rules run on blur as well as submit. The form is `data-submitting` / `aria-busy` while `onSubmit` is in flight.
- **`listSignal.search()`** — live `view()` on `.value`, plus a copy of the visible rows. **`.filter(fn)`** is a one-shot snapshot of `_source` (does not change `.value`; safe inside `computed`). **`.viewWhere(fn)`** is the live predicate (AND with the query); `viewWhere()` clears it.
- **Grid** — `.rows(n)`, `.templateColumns()`, `.templateRows()`, `.autoFlow()`, `.gridTemplateColumns()`, `.rowGap()`, `.columnGap()`. **GridItem** `.colStart` / `.colEnd` / `.rowStart` / `.rowEnd` stamp real CSS (not the unknown-method proxy).
- **Textarea `.helper()`** — helper line under the field, same as TextField.
- **`@Signal`** — real decorator; `initializeSignals` wires fields; lifecycle hooks bind `this`; `Page('')` throws.
- **Optional / splat routes** — `:id?` and `:rest*` match; `lazyRoute` recovers from a rejected chunk.
- **Subpath types** — advertised `fiboui/core` (and layout / content / interactive / structure / navigation / theme / server) ship a `types` condition so consumer `tsc` is not implicit any.
- **Card slots** — `.title()` / `.header()` / `.footer()` paint (not CSS-proxy classes). `.as('article'|'section')` changes the host tag. A clickable Card is a keyboard button.
- **Banner action** — `.children()` and `.props({ action })` reach the host; unknown `intent` is stripped.

### Changed

- **Theme tokens** — JS objects match the CSS sheets. `FiboThemeProvider` defaults to `material`, same as `base.css`. Web publishes `--fibo-error`.
- **Theme elevation** — JS `themeToCssVars` emits `--fibo-elevation-*`, same names as the CSS sheets.
- **Theme provider** — stamps `--fibo-theme` and `color-scheme`. Cupertino / web / noir fill M3 container keys. Palette `color()` no longer returns silent black out of range. `ThemeType.noir`.
- **`rule()`** — `check` may return a `Promise`. False or reject fails the field.
- **interp** — `$length` / `interp` markers stay live on Label, Alert, ListTile, Button, Banner, Card, Combobox / Select / RadioGroup / Progress labels, Table headers **and cells**, Tags (including after add/update), `List().empty(...)` strings, field labels / helper / error, Checkbox / Switch / Textarea errors **and Textarea placeholder**, Text `.children()`, Image `src` / `alt`, and layout/structure children (Box, Column, Row, Stack, Center, Line, Container, Header, Sidebar, ScrollView, DashboardLayout). Nested `interp()` inside a computed value resolves. Same as `Text`.
- **`FiboApp.mount()`** — wraps `StrictMode` by default (`strict: false` opts out), same as `mount()`. `mount('#root')` strips the hash. The app factory runs inside React so hooks work. `page()` writes document title / description.
- **CLI** — Node ESM imports; `fibo generate` templates are 2.x builders (no `.build()` / `Chip` / `IconButton`); `fibo.config.js` is `export default`. Generate paths stay under the project root; `toPascalCase` rejects null and prefixes digit-leading names. Plugin generate does not emit an empty path when the stem is `Plugin`.
- **PluginManager** — `run()` uninstalls the scoped manager; teardown is LIFO; a second plugin with the same name throws. `use()` rejects an in-flight duplicate name.
- **CSS names** — the builder proxy writes `grid-template-columns`, `-ms-*`, and `--custom` (not `template-columns` / `ms-overflow-style`). `.css()` / `.style()` / `.media()` expand axes without clobbering longhands; `aspectRatio` stays unitless. `--fibo-*` keys survive `normalizeCssProperties`. Box shorthand keeps `calc()` / `var()` / `clamp()` as one token.

### Fixed

- **Form** — `set()` on radios matches `el.value` only. A second submit waits. Rejected `onSubmit` is caught. `FormData` includes the clicked submitter. `javascript:` / `data:` `action` is omitted. Select / Combobox errors land on the visible combobox (not the hidden input). Host blur validates those controls. Native `reset` **and** `FormControl.reset(name)` clear painted errors.
- **TextField / Textarea** — static `.error()` sets `aria-invalid` and `aria-describedby`. Helper + error share `aria-describedby` after live-clear. `.mask()` applies on first paint. A reset textarea keeps `rows`. The password eye is named (`Show password` / `Hide password`) and mousedown does not fire `onCommit`; password fields keep `autocomplete`. Unnamed `.error()` still gets a described-by id. Invalid HTML `.type()` (checkbox / submit / …) does not leak onto the input. Clear dispatches `input` so Form live-clears. Textarea `.helper()`, error, and placeholder interp stay live; `.resize()` survives `.props({ style })`.
- **RadioGroup** — radios are not `aria-hidden`. Unnamed groups stay out of `FormData` but share a name for arrows / roving tabindex. Named groups keep roving tabindex. A disabled `.value()` is not shown selected. Focus ring on the circle. `.error()` paints `role="alert"` + `aria-invalid` / `aria-describedby`.
- **Checkbox / Switch** — focus-visible ring on the box and track. Static `.error()` sets `aria-invalid` and `aria-describedby` and interpolates. Label `htmlFor` matches the control. Switch `aria-checked`; indeterminate is `mixed` and is re-applied after click. `.rules()` land on the host as well as the named input. Unnamed Checkbox / Switch error has an id.
- **Select / Combobox** — disabled hidden inputs skip submit; `options[].disabled` is not committed (click / keyboard / `aria-disabled`). `reset` / `set` sync the UI; Combobox reopen shows every option; Tab closes; commit fires `input` / `change`. Enter in a closed list submits the form. Multiple values emit one hidden per item (`FormData` `string[]`). Open list highlights the current value. First Combobox keystroke replaces a committed label. Disabled Combobox does not open; Escape only when open; a typed query is not re-selected.
- **Button** — `.onClick` merges with `.onPress`; `.resetStyle()` drops chrome; disabled skips hover/press; ripple stays inside the host. `.props({ type: 'submit' | 'reset' | 'button' })` is not overwritten by the default. Invalid HTML `type` is coerced to `button`.
- **`.resetStyle()`** — prior `.bg()` / `.padding()` / `.hover()` hashes and inline `.style()` no longer beat `all: unset`. Helpers chained after it still apply.
- **List** — `itemHover` color reaches child `Text` without wiping nested chrome; virtual height cache keys by `_id` / `id` / `.key()`; empty virtual lists reset leftover scroll offset; `onEndReached` no-ops without `IntersectionObserver`. `items(fn)` stays live; `itemStyle({…})` goes through the CSS normalizer.
- **Table / Tags** — bind `listSignal`; row keys prefer `_id`. `<table>` stamps `fibo-table` so theme CSS applies. Cell / chip `$length` / `interp()` stay live after add. Tags keep `fibo-tags` when extra className is set; keys stay unique; wrap and `onRemove` are named. Null items do not throw.
- **CSS** — `.style()` / `.css()` / `.media()` run `normalizeCssValue`; later `.padding()` does not clobber `.paddingHorizontal()` (including `calc()` / `var()` / `clamp()` tokens and sequential `.style({ padding })`). `hover.shadow(0)` is `none`. Kebab `box-shadow: 0` becomes `none`. Leftover `@media` prefixes are stripped; named breakpoint keys trim first. `--fibo-*` custom properties are not camelCased away.
- **Layout** — ScrollView overflows instead of shrinking; overflow class survives extra props; horizontal `scrollByChild` uses `left`. Dashboard drawer is labeled and Escape-closes; host class is `fibo-dashboard`; header / sidebar / children interp; `.props({ sidebar, header })` do not drop fluent slots. Scaffold overlay sidebars pin to the edge; host `.id()` / `.props()` / `lang` reach the node; provider maps merge; `.props({ children })` does not drop chrome; `boxSizing` defaults when unset. ZStack left/right **and** top/bottom. Header sticky offset is top+height. Container is centered (inline, not only Tailwind); `dangerouslySetInnerHTML` is stripped; `as` / `tag` change the host (script/iframe fall back to `div`); leftover `maxWidth` constrains width. VirtualColumn SSR keys; host `.id()` / `.props()` reach the scroller. Sidebar renders without a Router (`<a>` fallback); `javascript:` / `data:` items omit href; active is a prefix match. Empty `Line()` is `<hr role="separator">`; a column Line is vertical; decorative lines drop separator semantics. Column / Center shrink (`min-h-0`). Center actually centers with inline flex. Spacer stays presentational (`aria-hidden`) and keeps grow when `.props({ style })` merges. Row **and** Column `.spacing(0)` wins over a prior gap. Column / Row / Stack / Center / Line / Container / Header / Sidebar / ScrollView children interp; host classes (`fibo-column`, `fibo-center`, …) survive extra className. `.props({ style })` merges instead of replacing layout longhands.
- **Content** — Icon/Integration clone element sources; Icon size clamps and drops `javascript:` / inline SVG as `src`. Alert `role` / `aria-live` stay locked; Dismiss when `onClose` is set; host class `fibo-alert`; warning uses a triangle glyph (not Search); decorative blobs are `aria-hidden`. Progress meter on every variant; `.className()` / `.style()` land on the `progressbar` host; `aria-valuenow` is clamped. Avatar `role="img"`; CSS `url()` sanitizes `javascript:` / `data:` / `vbscript:` / `file:`; initials trim. Label asterisk is decorative; Label drops colliding `text-sm` and stamps `fibo-text-label`. Image `alt` is always a string; `src` / `alt` interp stay live; dangerous `src` (including resolved interp) is omitted; `.clipShape()` sets overflow/radius; `.resizable()` keeps frame height so `object-fit` can crop. Badge intent chips are live regions and unknown intent does not crash. `Text` coerces props / numbers / interp tokens; `.children()` interp stays live; `.text(null)` clears leftover nodes; FineGrain keeps `fibo-text`; HTML `.type('h1')` is not dropped by CSS `.type('flex')`; `dangerouslySetInnerHTML` is stripped. Skeleton size wins over leftover `style.width`; `aria-busy`; pulse is first-party keyframes and respects `prefers-reduced-motion`. Spinner spin / bounce respects reduced-motion; a visually-hidden label sits inside `role=status`. Integration iframes drop dangerous `src` / `srcdoc` and get a default `sandbox`.
- **Structure** — Box/Card single child no longer throws; Box children interp; Box strips `dangerouslySetInnerHTML`; clickable Box gets `role=button`; `as` / `tag` change the host. Card does not force white; `.color()` paints an accent border; `fibo-card` survives extra className; `.title()` paints (not a CSS class); `.header()` / `.footer()` slots render; clickable Cards are keyboard-reachable; `.as()` changes the tag; elevation uses theme `--fibo-elevation-*`. Collapse `.children()` fills the panel; string title inherits host `.color()`. ListTile is keyboard-reachable; `.onClick` merges with `.onPress`; extra `role` is kept; leading / trailing interp; `.onTap` / `href`. Banner live region is `aria-atomic`; `role` / `live` stay locked; Dismiss when `onClose` is set; action / children slots paint; error intent locks `role=alert`. `Grid` / `GridItem` use real CSS (`repeat` / `span`), not JIT Tailwind classes; `.gridTemplateColumns('repeat(auto-fit, …)')` wins over numeric columns; `.rowGap()` / `.columnGap()` stamp longhands. Masonry uses inline `break-inside`; bento placement sits on the grid child. AssetCard / CollectionCard images have `alt`. InputCard `.type('email')` reaches the field; `.name()` / `.rules()` reach the inputs. ProfileCard banner URL is sanitized; rest props reach the Card host.
- **Shapes** — `clipPath` reaches Circle and Path. `.style()` merges instead of replacing. `css({…})` takes an object. `boxShadow: 0` is `none`. LinearGradient ids are unique per instance; `.fill(gradient)` is `url(#id)` and Canvas emits `<defs>`. Path `d(null)` does not throw. Raw `filter('drop-shadow(… inset)')` strips inset. `rotateX` / `perspective` stay CSS, not an SVG `transform` attr. Canvas keeps host `id` / `role` / `aria-*`.
- **Motion** — FX sheet re-injects after SSR reset; Presence leftover enter `animationend` no longer unmounts during exit; unknown presets do not crash; cssDecls drop NaN. Presence exit under reduced-motion `never`; host transitions respect reduce; Reveal visible without JS (noscript fallback). Reveal `once` unobserves. Hover color functions keep alpha. RSC `AnimatedWrapper` does not throw on text children; NaN / Infinity transforms are dropped.
- **Signals** — `interp` reuses slot ids; nested resolve; `hasInterpMarks` coerces. Observer survives StrictMode; FineGrain SSR emits the same host as the client. `watch(computed)` re-reads `.value`; `watchMultiple` touches sources. `listSignal` publish copies so `.value.splice` cannot hole the source.
- **Link / Router** — external `http` / `mailto` / `#` stay native; basename is path-safe (not doubled); `beforeEnter` runs on first paint and is cancelled on unmount; guards skip `window` on the server. Query and hash stay out of `currentPath`. Nested SSR shares the parent location. Outlet outside a Router is null. NavLink uses exact `matchPath` (not `startsWith`). Guard self-redirect is a no-op. `javascript:` / `data:` / `vbscript:` `to` omit `href`; rest cannot override it. `target="_blank"` gets `noopener noreferrer`. `open()` / `openExternal()` use `isSafeOpenUrl` (ZWSP `javascript:`, `file:`, non-string URLs no-op; no throw).
- **Error page** — `DefaultErrorPage` receives the error; Try Again always shows (reset or reload). Go Home uses the router basename. Crash UI is `role="alert"`; empty messages fall back to a generic line. Breadcrumbs use exact match (layout title does not leak onto unmatched children). DefaultLoader keyframes stay out of the live region.
- **Packaging** — `./server` no longer claims the full `index.d.ts`; advertised subpaths ship their own `types`. `FiboStyles` escapes `</style>` and still calls `endSsrRequest` after snapshot. Vite `closeBundle` writes d.ts.
- **DI / `FiboApp`** — `@Inject` tokens and factory functions construct. Parent `@Inject` reaches subclasses. Native `String` / `Number` paramtypes are not tokens. Circular resolve throws. Process singletons drop on SSR `endSsrRequest`; `DIContainer.run()` forks overlapping requests. `FiboApp.mount()` no-ops without `document`; unmount drops the root and uninstalls plugins. Platform helpers read `globalThis.window`. `buildChild` skips signals and null. `nextStableId` rewinds on SSR reset.
- **Persist / gestures** — storage helpers no-op on SSR. Persist skips a version mismatch unless `migrate` is set, and flushes on dispose. A wrapper with no `data` is skipped; `include` / `exclude` **slice** restore (including when current is `null`); quota errors rethrow. Pan tracks `pointerId`; a foreign `pointerup` does not tear down the live pan; window listeners clean up; cancel fires `onEnd`. Tap / LongPress track `pointerId`, capture, and fire `onEnd` on unmount. `scrollTo` with an invalid id does not throw. Spring / transition NaN no longer write Infinity. `bindScrollProgress` no-ops without `document`.
- **Editor** — snippets use 2 spaces; Enter indent matches the playground; completions work on untitled buffers. Closing labels skip strings and comments. Completions are public factories (`Circle` / `Rect` / `Path`) plus `helper` / `clearable` / `List.empty` / `TextField.clear` / itemStyle `insets` / `boxShadow` / Grid templates; internal cards / `Chip` / `IconButton` / `Reveal()` are gone. Noir tokens cover JS/JSX.
- **Site** — playground list-signal fills insert `add()` / `$length` (not `('')`). `/#work` scrolls after mount. Hamburger has an accessible name and `aria-expanded`. Checkout / shop search labels use `htmlFor`.
- **Boilerplate** — views no longer call `.build()`. `fiboui` path maps to the package. Todo add/search are named `Form`s with `.submit()`. Todo checkbox is named and follows `isCompleted`; the list has `.empty()`. `window` interval is guarded and cleared on unmount. Icon-only header buttons have accessible names. Entry uses `FiboApp().root().mount("root")`. Vite dedupes `react` / `react-dom`.
- **Demo / examples** — demo, SSR fixtures, and the animation example guard `document` at module scope. Playwright `baseURL` binds 127.0.0.1. Monetron pressables are named and keyboard-reachable; e2e paths stay in-repo.
- **Docs** — `List().empty()`, nested `Outlet`, and `Form` from `fiboui/interactive`. Shop demo is [fiboui.vercel.app/shop](https://fiboui.vercel.app/shop).
- **SVG** — icon filters no longer emit `drop-shadow(… inset)` (invalid; the browser ignored it).
- **Avatar** — status pip sits on the outer host (`overflow: visible`); the face still clips.
- **VirtualColumn** — `measureItems` height cache follows the row key, not the index.
- **`url()`** — `javascript:` / `data:` / `vbscript:` / `file:` fail; only `http:` / `https:` pass.
- **Collapse** — `.id()` / extra props reach the outer host. String title inherits host `.color()`.
- **Plugins / SSR** — plugin routes, stores, and services reset per SSR request. RSC `StateWrapper` / `ProviderWrapper` pass `stateMap` / `providers`. StyleManager re-attaches a detached sheet; `reset()` removes the node. Concurrent SSR is request-local via `PluginManager.run()` / `StyleManager.run()` (ALS). RSC `Presence.show()` no longer throws.
- **`fiboui/interactive` dist** — `vite build` writes `Form` and the validation helpers.
- **`Icons.Verify`** — `aria-hidden={false}` so a labeled badge stays visible to AT.

## [2.6.4] - 2026-10-16

### Fixed

- **Reset field** — a `resetStyle()` field hugs its text, so `borderBottom` sits on the letters instead of the bottom of the parent. The input fills the field, and its height follows `.lineHeight()`.
- **Form row** — `.flexDirection('row')` centers the controls on the line.

## [2.6.3] - 2026-10-16

### Changed

- **`.resetStyle()`** — unsets every CSS property on the component and its contents, including flex, width, gap, and type. Chain any style after it to put back only what you want.

## [2.6.2] - 2026-10-16

### Added

- **`.resetStyle()`** — on every builder. Drops padding, border, fill, radius, shadow, fixed height, and type size. Layout stays. Chain `.style()`, `.px()`, `.border()`, or `.bg()` after it.

## [2.6.1] - 2026-10-16

### Added

- **Layout on every builder** — `flexDirection`, `alignItems`, `alignSelf`, `flexWrap`, `justifyContent`, `flex`, `grid`, `inlineFlex`, `inlineGrid`, `block`, `inlineBlock`, `hidden`, `center`, `centerX`, `centerY`, `spaceBetween`, `spaceAround`, `spaceEvenly`, `fill`, `fillWidth`, `fillHeight`, and a numeric `gap` write inline style. They work on `Form` and the other builders directly.
- **Chain methods** — `borderBottom`, `fontWeight`, `maxHeight`, `pointerEvents`, `textTransform`, and `zIndex`.

### Fixed

- **Spacer** — a bare `Spacer()` grows (`flex: 1 1 0%`, stretched). `.height()` and `.width()` stay fixed. `.flex(n)` sets the grow factor and does not turn the spacer into a flex container.

## [2.6.0] - 2026-10-16

### Added

- **`listSignal.view(query, keys?)`** — filters what `.value` shows and keeps the full list in memory. `view('')` shows every item again. `add` / `update` / `remove` always write the full list.

### Fixed

- **TextField** — the error message sits under the 56px field instead of being painted over by the next control.
- **Button** — `.type('submit' | 'reset' | 'button')` sets the HTML button type.

## [2.5.0] - 2026-10-16

### Added

- **Form** — native submit, `beforeSubmit` / `onSubmit` / `afterSubmit`, and `FormControl.reset` / `set`.
- **Validation** — `required`, `minLength`, `maxLength`, `email`, `pattern`, `min`, `max`, `rule`. `Form().validation().errorMode('field' | 'below' | 'manual')`. `TextField().rules()`.
- **`listSignal`** — `add` / `insert` / `set` / `update` / `remove` / `find` / `search`, automatic `_id`, and `$length` for live `Text`.
- **List** — `.items(listSignal)` plus `.itemStyle` / `.itemHover` / `.itemActive` / `.itemFocus` (CSS fluent proxy, logical padding and margin).
- **Button** — `.submit()`, `.reset()`, `.htmlType()`. `.type()` remains the React element type.
- **TextField** — uncontrolled by default. `.controlled(true)` opts into React state. `.onCommit` on blur. `.name()` for `FormData`.

### Fixed

- **Logical CSS** — `paddingHorizontal` and the other axis helpers on builders and on hover / focus / active. `boxShadow(0)` becomes `none` on the fluent proxy.
- **`justifyContent('between')`** — also accepts `space-between` and `spaceBetween`.
- **Text templates** — `` Text(`Total ${todos.$length}`) `` auto-binds the signals embedded in the string. Extra `.bindSignal` still registers more.
- **`.type()`** — builder methods named `type` (TextField, Text, InputCard) run again; the React element stamp no longer swallows them.
- **`shadow(0)`** — registers `box-shadow: none` instead of the `md` preset.
- **Form** — `noValidate` by default, disabled fields are skipped, `/g` patterns don't alternate, errors set `aria-invalid` and clear while typing.
- **Textarea, Checkbox, Switch, RadioGroup** — uncontrolled by default, with `.name()` so `FormData` sees them. `.controlled(true)` opts back into parent state.
- **Select and Combobox** — `.name()` writes a hidden input for submit.
- **List pseudo styles** — one stylesheet per list, focus uses `:focus-within`.
- **Button ripple** — captures the button before the dynamic import.
- **Editor** — closing labels on every multi-line fluent chain, and Enter auto-indent (`extensions/vscode-fiboui`).

## [2.4.4] - 2026-10-15

### Changed

- **Docs / package metadata** — polished README with live demos; `homepage` → [fiboui.vercel.app](https://fiboui.vercel.app); store demo link [fiboui-store.vercel.app](https://fiboui-store.vercel.app).

## [2.4.3] - 2026-10-15

### Fixed

- **Transition comma-strings** — `.transition('transform, opacity', 240)` now splits properties before formatting (same snap bug as 2.4.2 array path).
- **`groupFocus()`** — stamps `fibo-fx-on-group-focus-within` (sheet never had `-group-focus`).
- **Reveal** — `scrollTimeline('view')` no longer forces `.fibo-inview` on mount; IO always drives visibility. `--fibo-dur` / `--fibo-ease` / `--fibo-delay` copy to the Reveal wrapper.
- **`.animate()` + `.hover()`** — auto interaction transitions still apply when a motion class is present.
- **`.effect()`** — no longer stamps resting `translate3d(0,0,0)` (broke bob/hang/buzz).
- **FX keyframes** — bob/hang/buzz/icon-* start at identity so loops do not jump.
- **Theme** — `themeToCssVars` emits M3 container aliases; `.bg('success'|'warning'|'info')` resolve.
- **List `itemHover`** — declarations use `!important`; default rows no longer pin transparent inline bg.
- **Button press** — resting `scale-100` so `active:scale` eases.
- **Signal notify** — depth guard against synchronous update loops.
- **SSR** — `getStyleTag()` resets the StyleManager after snapshot; new `endSsrRequest()`.
- **Subpath `exports`** — removed misleading `types` pointing at the full `index.d.ts` (`fiboui/core` no longer type-claims `Button`).

## [2.4.2] - 2026-10-15

### Fixed

- **Multi-property CSS transitions** — `.hover()` / `.transition([…])` used to emit `transform, opacity, border-color 240ms ease-out`, so only the *last* property got a duration (the rest snapped at 0s). Now each property gets its own `240ms ease-out`.

## [2.4.1] - 2026-10-15

### Fixed

- **Interaction effects smoothness** — `.fibo-fx` no longer sets a resting `transform` (perspective/translateZ). Hover/active transforms were replacing the whole matrix and felt jumpy (e.g. `nudge` on cards). `nudge` now uses `translate3d` + 240ms ease-out.
- **`.hover()` / `.press()` surface easing** — inline `background` / `border` shorthands are promoted to `backgroundColor` / `borderColor` longhands so pseudo longhands can interpolate; hover `translateX/Y` emit `translate3d` and stamp a resting `translate3d(0,0,0)` only when a transform is set; auto interaction transitions default to 240ms `ease-out`.

## [2.4.0] - 2026-10-15

### Added

- **Full interaction effect catalog** (Hover.css–inspired names, **fiboui-owned CSS** — not a vendor of Hover.css; commercial-safe for use inside the toolkit):
  - **2D** — grow, shrink, pulse, pulseGrow/Shrink, push, pop, bounceIn/Out, rotate, growRotate, float, sink, bob, hang, skew*, wobble*, buzz*, forward, backward, nudge
  - **Background** — fade, backPulse, sweep/bounce/radial/rectangle/shutter variants
  - **Icons** — iconBack/Forward/Up/Down/Spin/Drop/Fade/FloatAway/… (motion on the host)
  - **Border** — borderFade, hollow, trim, ripple*, outline*, roundCorners, underline/overline*
  - **Shadow** — shadowGrow/Float/Glow/Radial, boxShadowOutset/Inset, lift, glow
  - **Bubbles** — bubble*/bubbleFloat* (`data-fibo-bubble="Tip"`)
  - **Curls** — curlTopLeft/Right, curlBottomLeft/Right
  - State-agnostic: `.hover(h => h.effect("sweepToRight"))`, `.pressEffect("shrink")`, `.focusEffect("glow")`
  - Shortcuts: `.hoverEffect()` / `.pressEffect()` / `.focusEffect()` / `.activeEffect()` / `.groupHoverEffect()`
  - Kebab + `hvr-*` aliases; exports `INTERACTION_EFFECTS`, `FIBO_INTERACTION_FX_CSS`

## [2.3.0] - 2026-10-15

### Added

- **Fluent theme engine** — `ThemeData`-style API mirrored in CSS vars (Flutter / SwiftUI mental model):
  - Preset **`noir`** (obsidian editorial) + `noirTheme`
  - `.theme("noir" | FiboTheme)` on any builder — class + inline CSS vars on **first paint** (SSR-safe)
  - `extendTheme` / `copyWithTheme`, `resolveTheme`, `themeToCssVars` / `themeToInlineStyle` / `themeClassName`
  - `FiboThemeProvider({ theme: "noir" })` no longer paints via `documentElement` `useEffect`
- **Text** reads `var(--fibo-text-*-*)` from the active theme (fallbacks when no theme)
- **Button** ghost / text / soft / outline use `var(--fibo-*)` instead of gray Tailwind hardcodes

### Changed

- `FiboThemeName` includes `'noir'`
- Theme CSS: `src/styles/themes/noir.css` in `@layer fibo.theme`

## [2.2.4] - 2026-10-15

### Added

- Gaps that did not exist as package exports:
  - `open(url)` — canonical; `openExternal` kept as alias (site name, no break)
  - `goHash(id)` — thin wrapper over `scrollTo(id, { hash: true })` (site name, no break)
  - `writeClipboard(text)`
  - `bindHotkeys([{ key, metaOrCtrl, run, when }])`

### Changed

- **`scrollTo(id, { hash: true })`** — optional hash update; bare ids via `getElementById`.

## [2.2.3] - 2026-10-15

### Added

- **`ScrollController`** + `ScrollView().controller(c)` — programmatic `scrollBy` / `scrollTo` / `scrollByChild` without `document.querySelector` (carousel prev/next).

### Fixed

- **Reveal** — removed forced `width: 100%` / `w-full` so horizontal `ScrollView` slides keep their flex basis (carousel-safe). Still `min-width: 0` for grid/flex shrink.

## [2.2.2] - 2026-10-15

Patch: flex/grid overflow containment.

### Fixed

- **Column / Row** — filled (non-hug) layouts now include `min-w-0` so flex/grid children can shrink below intrinsic content width (wide tables, nowrap text no longer explode the track).
- **Box** — default `min-w-0` for the same reason.
- **Text** — `overflow-wrap: anywhere`, `word-break: break-word`, `max-width: 100%`, and `min-w-0` so long tokens wrap inside cards instead of overflowing.
- **Reveal** — wrapper is `min-w-0 max-w-full w-full` (CSS + classes) so `.reveal()` / `.onScroll()` wrappers do not become an unconstrained flex item around wide content.

## [2.2.1] - 2026-10-15

Patch: SSR / hydration.

### Fixed

- **`.hover()` / `.active()` / `.press()` / `.focusRing()` class names** were `fibo-pseudo-N` from a module counter. Server, client, and HMR disagreed. Classes are now `fibo-ps-<hash>` of each CSS declaration (deduped, order-independent).
- **StyleManager SSR** — `getCss()` / `getStyleTag()` / `<FiboStyles />` emit collected rules after `renderToString`. The client reuses `#fibo-dynamic-styles` (`data-fibo`) so hover CSS does not flash.
- **`.responsive()`** read `window.innerWidth` (server always 1024). It now compiles to CSS `@media` like `.md()` / `.media()`. API unchanged.
- **List keys** — the FiboElement wrapper did not expose `.key()` as a React string key (`Gt` in the minified bundle). `.key(id)` is a string on the element and inner host. `.children([...])` stamps index keys so unkeyed Grid/Column arrays do not share a fluent-function key.
- **`usePrefersReducedMotion` / Presence** used `matchMedia` during render. Now `useSyncExternalStore` with server snapshot `false`.
- **`FiboThemeProvider`** wrote vars only in `useEffect` (FOUC / mismatch). Vars + `fibo-theme-*` class render in the tree; `documentElement` still updates after mount.
- **LinearGradient** ids are hashed from stops/colors/angle, not a sequence.
- **`Router` / `useLocation` / `Sidebar`** no longer read `window.location` during render. Pass `initialPath` / `initialSearch` / `initialHash` for SSR; first client render matches, then window after mount.

### Added

- Docs: [SSR / hydration](./docs/guide/ssr.md). Fixtures: `examples/ssr-fixtures` (Vite SSR + Next.js App Router) with Playwright.

## [2.2.0] - 2026-10-14

Easy CSS media queries (**#8**), security scan (**#4**), and CSS motion / scroll / Presence on the existing builders (**#9**). No `fiboui/motion` subpath.

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
