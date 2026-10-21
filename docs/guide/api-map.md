# API map — one job per name

Avoid twin APIs. Prefer the **canonical** column; the others are aliases, readers, or different jobs.

## Safe area

| Want | Use | Not |
|---|---|---|
| Pad content for notch/home indicator | `SafeArea` / `.ignoresSafeArea()` | — |
| Auto pad a `Container` | `Container` (already merges `env(...)`) | Extra SafeArea wrapper |
| Scaffold chrome pad | Scaffold default CSS vars | Duplicate SafeArea around body |
| **Reserve a tool bar** on an edge | **`.safeAreaInset(edge, content)`** | SafeArea (padding only) |
| Read inset numbers | `GeometryProxy.safeAreaInsets` | — |
| Soft keyboard | `KeyboardInset` | safe-area env |

## Motion

| Want | Use | Not |
|---|---|---|
| CSS enter / hover presets | `.animate(preset)` + MOTION | — |
| Scoped state write with VT | **`withAnimation(() => …)`** / `withTransaction` | New animation system |
| Enter/exit mount | `Presence` | withAnimation alone |
| Scroll into view | `.reveal()` (`.onScroll` = alias) | Presence |
| Cross-view morph | `matchedGeometryEffect` + `startViewTransition` | Presence |
| Numeric prop springs | `.animation(config)` / hooks (legacy/advanced) | Prefer `.animate` for UI |

## Navigation title / chrome

| Want | Use | Not |
|---|---|---|
| Page title in Scaffold | **`Scaffold().navigationTitle('…')`** → existing `Header` | New bar component |
| Custom header | `.headerBar(Header().title(…).…)` / `.appBar(…)` | Second title API |
| AppBar / Toolbar / SliverAppBar | Those builders for their layouts | Don’t mix with Header on same scaffold |
| Routing | `Router` / `Outlet` | Don’t invent `NavigationStack` unless push/pop product needs it |

## Stacks / size

| Want | Use |
|---|---|
| Horizontal / vertical | `Row` / `Column` (**no** HStack/VStack) |
| Virtualized | `VirtualRow` / `VirtualColumn` / `List` (`LazyHStack` / `LazyVStack` aliases) |
| Inline map | `ForEach` / `Row.forEach` / `Column.forEach` |
| Identity group | `Group` (Fragment) |
| Glass | `.resetStyle().material(Material.ultraThin)` / `.backdropBlur(n)` |
| Fill parent | `Size.infinity` + `.frame({ maxWidth/Height })` |
| Deprecated synonym | `infinity` → use `Size.infinity` |

## Preference / environment

| Want | Use |
|---|---|
| Child → ancestor reduce | `PreferenceKey` + `.preference` / `.onPreferenceChange` |
| Theme / DI | `FiboThemeProvider` / Scaffold `.provider` |
| Signal → text | `ValueBinder` / FineGrain |

## Scroll

| Want | Use |
|---|---|
| Inside a ScrollView | `ScrollViewReader` + `.scrollTarget` |
| Document / hash | `scrollTo` / `goHash` |
| Bound controller | `ScrollController` |

## Intentional twins (keep)

- `GeometryReader` ≡ `LayoutBuilder`
- `MagnificationGesture` ≡ `MagnifyGesture`
- `.padding(EdgeSet, n)` ≡ `.paddingEdges(…)`
- `.appBar` ≡ `.headerBar` on Scaffold
