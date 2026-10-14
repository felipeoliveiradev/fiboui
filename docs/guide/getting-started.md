# Getting started

FiboUI is a React UI library. You compose screens with a **fluent builder API**. Each builder (`Column()`, `Button('Save')`, `Text('Hi')`) **is a React element** — return it, nest it, or pass it as a child. Do not call `.build()`.

This page matches **fiboui 2.2.0**. Package is **ESM-only**. CSS is a separate import.

## Install

```bash
npm install fiboui
```

Peer range: React and React DOM `>=18`. The library is used with React 18 and 19 in this repository’s tests.

Import the stylesheet **once**. The JS entry does not load CSS.

```ts snippet
import 'fiboui/style.css';
import { Text } from 'fiboui';

export default function Example() {
  return Text('Styles loaded');
}
```

`require('fiboui')` is unsupported. There is no CJS/UMD bundle. Subpaths exist (`fiboui/core`, `fiboui/layout`, `fiboui/content`, `fiboui/interactive`, `fiboui/structure`, `fiboui/navigation`, `fiboui/theme`, `fiboui/style.css`).

Do not import `fiboui/src/...` — the published pack is `dist/` only.

## Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install fiboui
```

`src/main.tsx`:

```ts snippet
import 'fiboui/style.css';
import { Button, Column, Text, mount } from 'fiboui';

function App() {
  return Column()
    .gap(12)
    .padding(24)
    .crossAxisAlignment('start')
    .children([
      Text('Hello FiboUI').variant('h1'),
      Button('Click Me').onPress(() => undefined),
    ]);
}

export default App;

export function bootstrap(el: HTMLElement) {
  mount(el, App, { strict: false });
}
```

`mount(target, app)` wraps the tree in `ReactivityRoot` and React `StrictMode` (pass `{ strict: false }` to skip StrictMode). `target` is a CSS selector or an `Element`.

`FiboApp` is the plugin-oriented bootstrapper:

```ts snippet
import { Column, Text, FiboApp } from 'fiboui';

function Root() {
  return Column().children([Text('App')]);
}

export default Root;

export function start() {
  FiboApp().root(Root).mount('root');
}
```

`FiboApp().mount(elementId)` looks up `document.getElementById` — the argument is an **id**, not a `#selector`.

## Next.js App Router

Builders use client APIs (signals, `createRoot` for `mount`, theme `documentElement` writes). Any file that **calls** a builder needs the client boundary:

```ts snippet
import 'fiboui/style.css';
import { Column, Text } from 'fiboui';

export default function Page() {
  return Column()
    .padding(24)
    .children([Text('Client page').variant('h1')]);
}
```

Put `'use client'` at the top of that module in the App Router. Import `fiboui/style.css` from `app/layout.tsx` (or the client page). Do not call `mount()` inside Next — the framework already hydrates the tree.

Server Components can import **types** from `fiboui`. They must not construct builders.

## CRA-less setups

Create React App is not required and is not documented as a target. Use Vite, Next.js, or any bundler that understands ESM `package.json` `exports` and CSS imports.

Minimal HTML + Vite:

```html
<div id="root"></div>
<script type="module" src="/src/main.ts"></script>
```

```ts snippet
import 'fiboui/style.css';
import { Text, mount } from 'fiboui';

export default function App() {
  return Text('Hi').variant('h1');
}

export function bootstrap(el: HTMLElement) {
  mount(el, App, { strict: false });
}
```

## Mental model

```ts snippet
import { Box, Button, Text } from 'fiboui';

export default function Example() {
  return Box()
    .padding(16)
    .backgroundColor('#F3EDF7')
    .children([
      Text('Title').variant('h1').weight('bold'),
      Button('Go').onPress(() => undefined),
    ]);
}
```

Compare that with nested JSX of the same layout (illustration only — not a FiboUI call site):

```jsx
<div className="p-4" style={{ backgroundColor: '#F3EDF7' }}>
  <h1>Title</h1>
  <button type="button">Go</button>
</div>
```

Continue with [Mental model](./mental-model.md), [Migration](./migration.md), [Responsive](./responsive.md), [Animation](./animation.md).
