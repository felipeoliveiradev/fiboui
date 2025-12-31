# Scaffold

The root component for FiboUI applications, providing global configuration and structure.

`Scaffold` is inspired by Flutter's MaterialApp and Scaffold pattern. It serves as the entry point of your application, managing providers, theme, locale, and the overall app structure.

## Basic Usage

```typescript
import { Scaffold } from 'fiboui'

Scaffold()
  .theme(myTheme)
  .locale('pt-BR')
  .children([
    Header(),
    MainContent(),
    Footer()
  ])
  .build()
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
| `.theme(theme)` | `any` | Set global theme |
| `.locale(locale)` | `string` | Set application locale |
| `.provider(key, value)` | `string, any` | Add single provider |
| `.providers(providers)` | `Record<string, any>` | Add multiple providers |
| `.children(children)` | `ReactNode \| ReactNode[]` | App content |

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
      Header(),
      Box()
        .flex('1')
        .padding('24px')
        .children(
          Text('Welcome!').variant('h1').build()
        )
        .build(),
      Footer()
    ])
    .build()
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
  .build()
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
    .children([
      // Header
      Header()
        .height(80)
        .children(
          Row()
            .mainAxisAlignment('spaceBetween')
            .children([
              Text('🛒 Shop').variant('h2').build(),
              CartBadge()
            ])
            .build()
        )
        .build(),

      // Main content
      Box()
        .flex('1')
        .children(ProductGrid())
        .build(),

      // Footer
      Footer()
    ])
    .build()
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
          .build(),

        // Main area
        Box()
          .flex('1')
          .display('flex')
          .flexDirection('column')
          .children([
            DashboardHeader(),
            DashboardContent()
          ])
          .build()
      ])
      .build()
  ])
  .build()
```

## Accessing Providers

Child components can access providers using `.consume()`:

```typescript
// In Scaffold
Scaffold()
  .provider('theme', myTheme)
  .provider('user', userStore)
  .children([App()])

// In child component
function ThemedBox() {
  return Box()
    .consume('theme')
    .backgroundColor((theme) => theme.primary)
    .children(
      Text('Themed!').build()
    )
    .build()
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
            .build()
        )
        .build(),
      Content()
    ])
    .build()
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
    .build(),
  document.getElementById('root')
)

// ❌ Bad - Scaffold nested
function App() {
  return Box().children([
    Scaffold().children([...]).build()  // Don't nest Scaffold
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
  Scaffold().theme(theme1).build(),
  Scaffold().theme(theme2).build()  
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
