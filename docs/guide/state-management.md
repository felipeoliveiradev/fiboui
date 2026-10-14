# Signals, stores, and observers

FiboUI ships a small reactive layer. Use it when a builder tree must re-assemble. Prefer `Text(() => …)` / `bindText` for label-only updates.

## `signal` / `computed`

```ts snippet
import { Box, Button, Text, computed, signal } from 'fiboui';

export default function Example() {
  const count = signal(0);
  const label = computed(() => `Count: ${count.value}`);
  return Box()
    .bindSignal(count)
    .children(() => [
      Text(() => label.value),
      Button('+').onPress(() => {
        count.value += 1;
      }),
    ]);
}
```

`Signal.value` get/set notifies subscribers. `computed(fn)` caches until a dependency changes.

## `createStore`

```ts snippet
import { Button, Column, Text, createStore } from 'fiboui';

export default function Example() {
  const store = createStore({ n: 0 });
  return Column()
    .observer()
    .children(() => [
      Text(String(store.getState().n)),
      Button('Inc').onPress(() => store.setState((s) => ({ n: s.n + 1 }))),
    ]);
}
```

`setState` accepts a partial or `(state) => partial`. Same-value updates are skipped.

## `observable`

```ts snippet
import { Button, Column, Text, observable } from 'fiboui';

export default function Example() {
  const n = observable(0);
  return Column()
    .observe(n)
    .children(() => [
      Text(String(n.get())),
      Button('+').onPress(() => n.set(n.get() + 1)),
    ]);
}
```

## Binding a builder

| Method | Behavior |
| --- | --- |
| `.bindSignal(sig)` | Re-assemble when that signal notifies |
| `.observe(obs)` | Re-assemble when that observable notifies |
| `.observer()` | Re-assemble when the builder’s internal tracker fires (used by function children / function `Text` labels on some hosts) |
| `.state(key, init)` / `.setState` / `.getState` | Builder-local map (not `createStore`) |
| `.provide` / `.consume` | Builder provider map |

## Hooks

```ts snippet
import { Text, signal, useSignal } from 'fiboui';

const count = signal(1);

export default function Example() {
  const value = useSignal(count);
  return Text(String(value));
}
```

- `useSignal(signal | computed)` — `useSyncExternalStore`
- `useReactiveStore(store)` — subscribe to `createStore()`
- `useObservable(obs)`
- Core `useStore` is a **deprecated alias** of `useReactiveStore` (collides with the class-decorator `useStore`)

## `Observer` / `bindText`

```ts snippet
import { createElement } from 'react';
import { Observer, Text, bindText, signal } from 'fiboui';

const name = signal('Ada');

export default function Example() {
  return createElement(Observer, {
    children: () => Text(name.value),
  });
}

export function Bound() {
  return bindText(name);
}
```

`Text(() => name.value)` and `bindText(name)` write `textContent` without remounting the element.

## Class `Store` decorator

`Store`, `useStore(Class)`, `getStore`, `clearStores`, `isStore`, plus `persist` / `storageAdapters` live in the `./state` module re-export. That is a **different** API from `createStore`. Use `useReactiveStore` for the functional store.

## Scopes

```ts snippet
import { createElement } from 'react';
import { Column, ReactivityRoot, Text, createReactivityRoot, runInScope } from 'fiboui';

export default function Example() {
  const scope = createReactivityRoot();
  const label = runInScope(scope, () => 'scoped');
  return createElement(ReactivityRoot, {
    scope,
    children: Column().children([Text(label)]),
  });
}
```

`mount()` already wraps a `ReactivityRoot`.
