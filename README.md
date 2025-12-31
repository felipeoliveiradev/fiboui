# 🏗️ FiboUI v1.0.0

**A Flutter & SwiftUI-inspired React UI framework featuring a powerful Assembly Pattern and high-fidelity reactivity.**

FiboUI brings the expressive, chainable syntax of modern mobile frameworks to React. Build complex, beautiful, and highly-performant UIs with **zero boilerplate** and **maximum readability**.

---

## ✨ Features

- 🏗️ **The Assembly Pattern** - Components return builders for endless chaining.
- ⚡ **Zero-Build Children** - Pass builders directly to `.children()`; they build implicitly.
- 🔬 **Fine-Grained Reactivity** - Native support for Signals, Computed, and Observables.
- 🎭 **Dynamic Multi-Theme** - Material, Cupertino, and Web themes with instant global switching.
- 🎨 **Premium Aesthetics** - Built-in glassmorphism, micro-animations, and sleek dark modes.
- 🔷 **100% Type-Safe** - Built with TypeScript for the best developer experience.

---

## 🚀 Installation

```bash
npm install fiboui
```

Import the styles in your main entry file:

```tsx
import 'fiboui/dist/style.css';
```

---

## 🏗️ The Assembly Pattern

### 1. Components as Builders
Components return builder instances, allowing customization before rendering.

```tsx
StakentCard()
  .className("p-8 hover:border-indigo-500/50")
  .style({ backgroundColor: '#111' })
  .children([ ... ])
  .build()
```

### 2. Implicit Construction
Builders in `.children()` are automatically finalized.

```tsx
Column().children([
  Text("Title").variant("h1"), 
  Button("Action").onClick(handlePress)
]).build()
```

---

## ⚡ Reactivity & State

### Signals (Primitives)
```tsx
const count = signal(0);

Box()
  .bindSignal(count)
  .children([
    Text(`Count: ${count.value}`),
    Button("+").onPress(() => count.value++)
  ])
  .build()
```

### Global Store
```tsx
const store = createStore({ theme: 'dark', user: 'John' });

Box().observer().children([
  Text(store.getState().user)
])
```

---

## 📱 Scaffold & Layout Shells

The `Scaffold` and `DashboardLayout` components provide professional-grade app structures.

```tsx
import { Scaffold, Sidebar, Header, Text, StakentButton } from 'fiboui';

Scaffold()
  .header(
    Header().height(80).className("px-6 bg-white shadow-sm").children([
      Text("App Title").variant("h2"),
      StakentButton({ text: "Profile", variant: "outline" })
    ])
  )
  .sidebar(
    Sidebar().width(240).children([
       StakentSidebarItem({ label: "Home", active: true, icon: "home" }),
       StakentSidebarItem({ label: "Settings", icon: "settings" })
    ])
  )
  .fab(
    Button("+").variant("fab").onPress(() => console.log("Added!"))
  )
  .children([
    Text("Welcome to the main content area.")
  ])
  .build()
```

---

## 🛒 Full Example: E-commerce Store

Combine **Signals**, **Store**, and **Builders** for a complete reactive application.

```tsx
import { signal, computed, createStore, Scaffold, Box, Text, Button, Badge, Row } from 'fiboui';

// 1. Global Store
const appStore = createStore({
  cart: [],
  products: [
    { id: '1', name: 'MacBook Pro', price: 2499, image: '💻' },
    { id: '2', name: 'iPhone 15', price: 999, image: '📱' }
  ]
});

// 2. Reactive Computed Values
const cartTotal = computed(() => {
  const cart = appStore.getState().cart;
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// 3. UI Component
export function EcommerceApp() {
  return Scaffold()
    .header(
      Header().children([
        Text('🛒 FiboShop').variant("h2"),
        Row().children([
          Text(`Total: $${cartTotal.value.toFixed(2)}`).bindSignal(cartTotal),
          Badge().text(appStore.getState().cart.length.toString()).observer()
        ])
      ])
    )
    .children([
      Grid().columns(2).gap("md").children(
        appStore.getState().products.map(product => 
          Card().children([
            Text(product.image).fontSize(40),
            Text(product.name).fontWeight("bold"),
            Button(`Add $${product.price}`).onPress(() => {
              // Update Store & Watch UI React!
              appStore.setState(s => ({ cart: [...s.cart, { ...product, quantity: 1 }] }));
            })
          ])
        )
      )
    ])
    .build();
}
```

---

## 📄 License

MIT © 2025 FiboUI
