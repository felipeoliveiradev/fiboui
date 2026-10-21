# Scaffold

The root component for FiboUI applications, providing global configuration and structure.

`Scaffold` is inspired by Flutter's MaterialApp and Scaffold pattern. It serves as the entry point of your application, managing providers, theme, locale, and the overall app structure.

## Basic Usage

```typescript
import { Scaffold } from 'fiboui'

Scaffold()
  .theme(myTheme)
  .locale('pt-BR')
  .headerBar(Header())
  .bottomAppBar(BottomAppBar().items([ToolbarItem().principal().children(Text('Tabs'))]))
  .children([
    MainContent(),
  ])

```

## Features

- 🎨 **Global Theme** - Configure theme once, use everywhere
- 🌍 **Locale/i18n** - Set application language
- 📦 **Providers** - Inject global state, services, and configuration
- 🏗️ **Structure** - Provides consistent root layout (min-height: 100vh)

## Constructor

```typescript
Scaffold() → ScaffoldBuilder
```

## Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.theme(theme)` | preset name / `FiboTheme` | CSS vars on this subtree (`FiboBuilder.theme`) |
| `.locale(locale)` | `string` | Set application locale |
| `.provider(key, value)` | `string, any` | Add single provider |
| `.providers(providers)` | `Record<string, any>` | Add multiple providers |
| `.headerBar(node)` / `.appBar(node)` | builder / `{ children, fixed? }` | Top bar (often `AppBar`) |
| `.bottomAppBar(node)` / `.bottomNavigationBar(node)` | builder / `{ children, fixed? }` | Flutter bottom chrome (often `BottomAppBar` + `ToolbarItem` zones, or `TabView` bar) |
| `.sideBarLeft(node)` / `.sideBarRight(node)` | builder / `{ children, fixed? }` | Side bars |
| `.structure(config)` | `ScaffoldStructure` | Positions, widths, visibility |
| `.children(children)` | `ReactNode \| ReactNode[]` | Main content |

## Examples

### Simple App

```typescript
const theme = {
  primary: '#3B82F6',
  background: '#FFFFFF',
  text: '#1F2937'
}

function App() {
  return Scaffold()
    .theme(theme)
    .children([
      Box()
        .flex('1')
        .padding('24px')
        .children(
          Text('Welcome!').variant('h1')
        )
    ])
    .headerBar(Header())
    .bottomAppBar(BottomAppBar().items([ToolbarItem().principal().children(Text('Home'))]))

}
```

### With Providers

```typescript
const userStore = createStore({ user: null, isLoggedIn: false })
const cartStore = createStore({ items: [], total: 0 })

Scaffold()
  .theme(darkTheme)
  .locale('pt-BR')
  .providers({
    user: userStore,
    cart: cartStore,
    analytics: analyticsService
  })
  .children([App()])

```

### E-commerce App

```typescript
const theme = signal(lightTheme)
const store = createStore({
  user: { name: 'Guest' },
  cart: [],
  products: []
})

function EcommerceApp() {
  return Scaffold()
    .theme(theme.value)
    .bindSignal(theme)
    .provider('store', store)
    .headerBar(
      Header()
        .height(80)
        .children(
          Row()
            .mainAxisAlignment('spaceBetween')
            .children([
              Text('🛒 Shop').variant('h2'),
              CartBadge()
            ])
        )
    )
    .bottomAppBar(
      BottomAppBar().items([
        ToolbarItem().principal().children(Text('Shop')),
      ]),
    )
    .children([
      Box()
        .flex('1')
        .children(ProductGrid())
    ])

}
```

### Dashboard Layout

```typescript
Scaffold()
  .theme(darkTheme)
  .providers({
    auth: authStore,
    notifications: notificationStore,
    settings: settingsStore
  })
  .children([
    Box()
      .display('flex')
      .height('100vh')
      .children([
        // Sidebar
        Sidebar()
          .width(260)
          .children(Navigation())
          ,

        // Main area
        Box()
          .flex('1')
          .display('flex')
          .flexDirection('column')
          .children([
            DashboardHeader(),
            DashboardContent()
          ])

      ])

  ])

```

## Accessing Providers

Child components read providers with `useProvider` (React context). `.consume(key)` only reads the **same** builder's `.provider()` map and returns the value — it is not chainable and does not see a parent Scaffold.

```typescript
import { useProvider } from 'fiboui'

Scaffold()
  .provider('theme', myTheme)
  .provider('user', userStore)
  .children([App()])

function ThemedBox() {
  const theme = useProvider<{ primary: string }>('theme')
  return Box()
    .backgroundColor(theme?.primary)
    .children(Text('Themed!'))
}
```

## With Reactive Theme

```typescript
const currentTheme = signal(lightTheme)

function App() {
  return Scaffold()
    .theme(currentTheme.value)
    .bindSignal(currentTheme)  // Re-render when theme changes
    .children([
      Header()
        .children(
          Button()
            .text('Toggle Theme')
            .onClick(() => {
              currentTheme.value =
                currentTheme.value === lightTheme ? darkTheme : lightTheme
            })

        )
        ,
      Content()
    ])

}
```

## Best Practices

### 1. Use Scaffold as Root

```typescript
// ✅ Good - Scaffold at root
ReactDOM.render(
  Scaffold()
    .theme(theme)
    .children([App()])
    ,
  document.getElementById('root')
)

// ❌ Bad - Scaffold nested
function App() {
  return Box().children([
    Scaffold().children([...])  // Don't nest Scaffold
  ])
}
```

### 2. Configure Once

```typescript

Scaffold()
  .theme(theme)
  .locale('pt-BR')
  .providers({ store, auth })
  .children([App()])


Box().children([
  Scaffold().theme(theme1),
  Scaffold().theme(theme2)
])
```

### 3. Keep Providers Minimal

```typescript

Scaffold()
  .providers({
    theme: themeStore,
    user: userStore,
    i18n: i18nService
  })


Scaffold()
  .providers({
    theme, user, cart, products, orders,
    shipping, payments, reviews, ...
  })
```

## See Also

- [State Management](/guide/state-management) - Using providers and stores
- [Box](/components/structure-box) - Layout container
- [Header](/components/layout-advanced) - App header
