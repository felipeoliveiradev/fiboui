# State Management

FiboUI provides a powerful and flexible state management system built directly into the builder pattern. Choose from multiple reactive paradigms to fit your needs.

## Overview

FiboUI offers **5 state management patterns**:

1. **Signals** - Fine-grained reactivity for primitive values
2. **Computed** - Derived state that updates automatically
3. **Observables** - Reactive objects with change detection
4. **Store** - Global state management
5. **Provider/Consumer** - Context-based state sharing

---

## Signals

Signals are reactive primitive values that automatically update components when changed.

### Basic Usage

```typescript
import { signal } from 'fiboui'

// Create a signal
const count = signal(0)

// Use in component
Box()
  .bindSignal(count)
  .children([
    Text(`Count: ${count.value}`),
    Button()
      .text('Increment')
      .onClick(() => count.value++)

  ])

```

Signals live in memory on the client. Do not read or write them during SSR to persist UI — wrap reactive trees in Client Components (`'use client'`). Subscriptions are cleaned up on unmount (including React StrictMode double-mount).

There are two store APIs:

- `createStore()` + `useReactiveStore(store)` — reactive object store (also exported historically as `useStore` from `fiboui/core` hooks).
- `@Store()` class decorator + `useStore(StoreClass)` — the public `useStore` from the `fiboui` package root.

### How it Works

```
┌─────────────┐
│ signal(0)   │ ← Create signal
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ count.value = 5     │ ← Update value
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Notify subscribers  │ ← Trigger callbacks
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Component re-render │ ← UI updates
└─────────────────────┘
```

### When to Use

✅ Counter values
✅ Toggle states
✅ Form field values
✅ Any primitive that changes frequently

---

## Computed Signals

Computed signals are derived values that recalculate automatically when dependencies change.

Computed values are lazy: the first `.value` read attaches the internal effect and computes. Read the computed (or bind it) so dependents stay subscribed.

### Basic Usage

```typescript
import { signal, computed } from 'fiboui'

const price = signal(100)
const quantity = signal(2)

// Computed value
const total = computed(() => price.value * quantity.value)

console.log(total.value)  // 200

quantity.value = 3
console.log(total.value)  // 300 ← Updated automatically!
```

### Chaining Computed Values

```typescript
const subtotal = computed(() => price.value * quantity.value)
const tax = computed(() => subtotal.value * 0.1)
const total = computed(() => subtotal.value + tax.value)

// All update automatically when price or quantity changes
```

### Shopping Cart Example

```typescript
const cart = signal([
  { name: 'iPhone', price: 999, quantity: 1 },
  { name: 'MacBook', price: 2499, quantity: 1 }
])

const cartTotal = computed(() => {
  return cart.value.reduce((sum, item) =>
    sum + (item.price * item.quantity), 0
  )
})

Box()
  .bindSignal(cartTotal)
  .children([
    Text(`Total: $${cartTotal.value}`)
  ])

```

### Performance Benefits

```typescript
// ❌ Function - Recalculates every time
const getTotal = () => cart.value.reduce(...)

// ✅ Computed - Caches result
const total = computed(() => cart.value.reduce(...))

// Called 100 times = only 1 calculation
for (let i = 0; i < 100; i++) {
  console.log(total.value)  // Uses cached value
}
```

### When to Use

✅ Filtered/sorted lists
✅ Form validation
✅ Calculated totals
✅ Formatted values
✅ Any expensive computation

---

## Observables

Observables are reactive objects that notify listeners when changed.

### Basic Usage

```typescript
import { observable } from 'fiboui'

const user = observable({
  name: 'John',
  email: 'john@example.com',
  age: 25
})

Box()
  .observe(user)
  .children([
    Text(`Name: ${user.get().name}`),
    Button()
      .text('Update')
      .onClick(() => user.set({ ...user.get(), name: 'Jane' }))

  ])

```

### Multiple Observables

```typescript
const filters = observable({ search: '', category: 'all' })
const products = observable([...])

// Component only re-renders when filters change
Box()
  .observe(filters)
  .children([
    TextField()
      .value(filters.get().search)
      .onChange((e) => {
        filters.set({ ...filters.get(), search: e.target.value })
      })

  ])


// Component only re-renders when products change
Box()
  .observe(products)
  .children(
    products.get().map(p => ProductCard(p))
  )

```

### When to Use

✅ Form state
✅ Filter/search state
✅ Complex objects
✅ Isolated component state

---

## Global Store

Store provides centralized state management for your entire application.

### Creating a Store

```typescript
import { createStore } from 'fiboui'

interface AppState {
  user: { name: string; isLoggedIn: boolean }
  cart: CartItem[]
  theme: 'light' | 'dark'
}

const store = createStore<AppState>({
  user: { name: 'Guest', isLoggedIn: false },
  cart: [],
  theme: 'light'
})
```

### Using the Store

```typescript
// Get state
const state = store.getState()

// Update state
store.setState({ theme: 'dark' })

// Update with function
store.setState(state => ({
  cart: [...state.cart, newItem]
}))

// Subscribe to changes
const unsubscribe = store.subscribe(state => {
  console.log('State changed:', state)
})
```

### In Components

```typescript
function Header() {
  const state = store.getState()

  return Box()
    .observer()  // Re-renders when store changes
    .children([
      Text(state.user.name),
      Text(`Cart: ${state.cart.length}`)
    ])

}
```

### Actions Pattern

```typescript
const actions = {
  login(email: string, name: string) {
    store.setState({
      user: { name, isLoggedIn: true }
    })
  },

  logout() {
    store.setState({
      user: { name: 'Guest', isLoggedIn: false },
      cart: []
    })
  },

  addToCart(item: CartItem) {
    const state = store.getState()
    store.setState({
      cart: [...state.cart, item]
    })
  }
}
```

### When to Use

✅ User authentication
✅ Shopping cart
✅ App-wide settings
✅ Shared data across components

---

## Provider/Consumer

Provider pattern for sharing values down the component tree.

### Basic Usage

```typescript
const theme = {
  primary: '#3B82F6',
  secondary: '#10B981'
}

// Provider
Box()
  .provide('theme', theme)
  .children([
    ChildComponent()
  ])


// Consumer
function ChildComponent() {
  return Box()
    .consume('theme')
    .backgroundColor((theme) => theme.primary)

}
```

### Dynamic Theme Example

```typescript
const currentTheme = signal(lightTheme)

function App() {
  return Box()
    .provide('theme', currentTheme.value)
    .bindSignal(currentTheme)
    .children([
      Header(),
      Content(),
      Footer()
    ])

}

function Header() {
  return Box()
    .consume('theme')
    .backgroundColor((theme) => theme.background)
    .children([
      Button()
        .text('Toggle Theme')
        .onClick(() => {
          currentTheme.value =
            currentTheme.value === lightTheme ? darkTheme : lightTheme
        })

    ])

}
```

### When to Use

✅ Theme configuration
✅ Localization (i18n)
✅ Feature flags
✅ User permissions

---

## Comparison Table

| Pattern | Scope | Reactivity | Performance | Use Case |
|---------|-------|------------|-------------|----------|
| **Signal** | Local/Global | Fine-grained | ⚡ Excellent | Primitive values |
| **Computed** | Derived | Automatic | ⚡ Excellent | Calculated values |
| **Observable** | Local/Global | Coarse-grained | ⚡ Good | Complex objects |
| **Store** | Global | Broadcast | ⚡ Good | Shared state |
| **Provider** | Hierarchical | Context | ⚡ Medium | Configuration |

---

## Best Practices

### 1. Choose the Right Tool

```typescript
// ✅ Signal for primitives
const isOpen = signal(false)

// ✅ Computed for derived values
const filteredItems = computed(() => items.value.filter(...))

// ✅ Observable for objects
const form = observable({ name: '', email: '' })

// ✅ Store for global state
const appStore = createStore({ user, cart, settings })

// ✅ Provider for config
Box().provide('theme', theme)
```

### 2. Minimize Re-renders

```typescript
// ❌ Bad - Re-renders for any store change
Box().observer()

// ✅ Good - Only re-renders when specific observable changes
Box().observe(userObservable)
```

### 3. Use Computed for Expensive Operations

```typescript
// ❌ Bad - Recalculates every render
const filtered = items.value.filter(...)

// ✅ Good - Caches result
const filtered = computed(() => items.value.filter(...))
```

### 4. Keep State Close to Usage

```typescript
// ✅ Local state for component-specific data
Box().state('isHovered', false)

// ✅ Global store for shared data
const appStore = createStore({ user, cart })
```

---

## Practical Example: E-commerce

This complete example demonstrates how to combine all state management patterns in a real-world scenario. It uses a **Global Store** for products and cart items, **Signals** for immediate UI updates (like the cart badge), and **Computed Signals** for calculating totals.

### The E-commerce Application

```tsx
/**
 * 🛒 E-COMMERCE EXAMPLE
 * Demonstrates: Store, Signals, Computed and observer()
 */

import { Scaffold, Box, Text, Button, Badge, Row, Column } from 'fiboui';
import { signal, computed, createStore } from 'fiboui';

// 1. Data Types
interface Product { id: string; name: string; price: number; image: string; }
interface CartItem extends Product { quantity: number; }
interface AppState { cart: CartItem[]; products: Product[]; }

// 2. Global State (Store)
const appStore = createStore<AppState>({
  cart: [],
  products: [
    { id: '1', name: 'MacBook Pro', price: 2499, image: '💻' },
    { id: '2', name: 'iPhone 15', price: 999, image: '📱' },
    { id: '3', name: 'AirPods Pro', price: 249, image: '🎧' }
  ],
});

// 3. Reactive Values (Signals)
const cartItemCount = signal(0);
const cartTotal = computed(() => {
  const cart = appStore.getState().cart;
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// 4. Actions
const actions = {
  addToCart(product: Product) {
    const state = appStore.getState();
    const existingItem = state.cart.find(item => item.id === product.id);

    if (existingItem) {
      appStore.setState({
        cart: state.cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      appStore.setState({ cart: [...state.cart, { ...product, quantity: 1 }] });
    }

    // Update the signal for immediate UI feedback
    cartItemCount.value = appStore.getState().cart.reduce((sum, item) => sum + item.quantity, 0);
  }
};

// 5. Components
function AppHeader() {
  return Box()
    .bindSignal(cartItemCount) // Re-renders only when count changes
    .bindSignal(cartTotal)     // Re-renders only when total changes
    .children([
      Text('🛒 FiboShop'),
      Row().children([
        Text(`Total: $${cartTotal.value.toFixed(2)}`),
        Badge().text(cartItemCount.value.toString())
      ])
    ])
    ;
}

function CartContent() {
  return Box()
    .observer() // Re-renders whenever the appStore updates
    .children([
      Text('My Cart'),
      ...appStore.getState().cart.map(item => (
        Text(`${item.name} x ${item.quantity}`)
      ))
    ])
    ;
}

// 6. Main Application
export function EcommerceApp() {
  return Scaffold()
    .children([
      AppHeader(),
      Box()
        .display('flex')
        .children([
          ProductSidebar(), // Sidebar updates the store
          CartContent(),    // Content observes the store
        ])
        ,
    ])
    ;
}
```

### Data Flow Diagram

```mermaid
graph TD
    User((User)) -->|Click Add| Button[Product Button]
    Button -->|Call| Action[actions.addToCart]
    Action -->|Update| Store[(Global Store)]
    Action -->|Update| Signal((cartItemCount Signal))

    Store -->|Notify| Observer[CartContent Component]
    Signal -->|Notify| Binder[AppHeader Badge]

    Observer -->|Re-render| UI1[Cart List Updated]
    Binder -->|Re-render| UI2[Badge Count Updated]
```

> [!TIP]
> You can find the full source code for this example in [exemplo-completo.tsx](file:/

---

## API Reference

### signal()

```typescript
function signal<T>(initialValue: T): Signal<T>
```

Creates a reactive signal.

**Methods:**
- `.value` - Get/set the value
- `.subscribe(callback)` - Subscribe to changes

### computed()

```typescript
function computed<T>(fn: () => T): ComputedSignal<T>
```

Creates a computed signal that recalculates automatically.

**Methods:**
- `.value` - Get the computed value (read-only)
- `.subscribe(callback)` - Subscribe to changes

### observable()

```typescript
function observable<T>(initialValue: T): Observable<T>
```

Creates an observable object.

**Methods:**
- `.get()` - Get current value
- `.set(value)` - Set new value
- `.subscribe(listener)` - Subscribe to changes

### createStore()

```typescript
function createStore<T>(initialState: T): Store<T>
```

Creates a global store.

**Methods:**
- `.getState()` - Get current state
- `.setState(updater)` - Update state
- `.subscribe(listener)` - Subscribe to changes

### listSignal()

```typescript
function listSignal<T>(initial?: T[]): ListSignal<T>
```

`collection` is the same function. Each item gets an `_id` (`crypto.randomUUID`) unless one is already set.

**Methods:** `add`, `insert`, `set`, `update`, `remove` / `delete`, `find`, `search`, `clear`, `replace`, `filter`, `map`, `move`.

`update` / `remove` / `find` match `_id`, then a domain `id`, then a predicate. `search` and `filter` return a plain array. Pass that array to `List` and it will not stay subscribed — pass the `listSignal` itself.

```tsx
const todos = listSignal<{ title: string }>([])
todos.add({ title: 'Ship it' })

List().items(todos).renderItem((todo) => ListTile().title(todo.title))
Text(`Total todos: ${todos.$length}`)
```

`$length` is an interpolation token, not a number. `` `${todos.length}` `` freezes. `Text` auto-binds the signals whose markers appear in its string. `.bindSignal(other)` adds another. Nothing subscribes to every signal in the tree.

In-place edits (`todos.value[0].title = 'x'`) do not notify. Assign through `update` / `set`.

### Builder Methods

```typescript
// Bind one signal. Only signals you pass are subscribed.
.bindSignal(signal)

// Observe an observable
.observe(observable)

// Mark as observer (observes all changes)
.observer()

// Provide a value
.provide(key, value)

// Consume a value
.consume(key)

// Local state
.state(key, initialValue)
.getState(key)
.setState(key, value)
```
