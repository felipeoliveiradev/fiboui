# Hooks

React hooks exported from `fiboui`. `useSignal` / `useReactiveStore` / `useObservable` use `useSyncExternalStore`.

Motion hooks (`useSpring`, `useTransition`, `useMountTransition`) interpolate **numbers** with `requestAnimationFrame`. Prefer CSS `.animate()` / `.hover()` for UI motion.

| Name | Kind | Source | Type |
| --- | --- | --- | --- |
| [`useSignal`](#usesignal) | value | `src/core/hooks.ts` | `<T>(signal: Signal<T> \| ComputedSignal<T>) => T` |
| [`useReactiveStore`](#usereactivestore) | value | `src/core/hooks.ts` | `<T>(store: Store<T>) => T` |
| [`useObservable`](#useobservable) | value | `src/core/hooks.ts` | `<T>(obs: Observable<T>) => T` |
| [`useBuilderState`](#usebuilderstate) | value | `src/core/StateWrapper.tsx` | `<T = unknown>(key: string) => [T, (value: T) => void]` |
| [`useProvider`](#useprovider) | value | `src/core/StateWrapper.tsx` | `<T>(key: string) => T` |
| [`useTransition`](#usetransition) | value | `src/core/animationHooks.ts` | `(targetValue: number, config?: TransitionConfig) => number` |
| [`useSpring`](#usespring) | value | `src/core/animationHooks.ts` | `(targetValue: number, config?: SpringConfig) => number` |
| [`useStagger`](#usestagger) | value | `src/core/animationHooks.ts` | `(count: number, delayBetween?: number) => number[]` |
| [`useMountTransition`](#usemounttransition) | value | `src/core/animationHooks.ts` | `(isVisible: boolean, duration?: number) => { shouldRender: boolean; stage: "entering" \| "entered" \| "exiting" \| "exited"; }` |
| [`usePrefersReducedMotion`](#useprefersreducedmotion) | value | `src/core/animationHooks.ts` | `() => boolean` |
| [`useScrollProgress`](#usescrollprogress) | value | `src/core/animationHooks.ts` | `() => number` |
| [`useViewportWidth`](#useviewportwidth) | value | `src/core/ResponsiveWrapper.tsx` | `() => number` |
| [`useFiboTheme`](#usefibotheme) | value | `src/theme/provider.tsx` | `() => FiboThemeContextValue` |
| [`useRouter`](#userouter) | value | `src/navigation/RouterContext.ts` | `() => RouterContextValue` |
| [`useNavigate`](#usenavigate) | value | `src/navigation/RouterContext.ts` | `() => (path: string, options?: NavigateOptions) => void` |
| [`useParams`](#useparams) | value | `src/navigation/RouterContext.ts` | `<T extends Record<string, string> = Record<string, string>>() => T` |
| [`useLocation`](#uselocation) | value | `src/navigation/RouterContext.ts` | `() => { pathname: string; search: string; hash: string; }` |
| [`useQuery`](#usequery) | value | `src/navigation/RouterContext.ts` | `() => URLSearchParams` |
| [`useStore`](#usestore) | value | `src/state/Store.ts` | `<T>(StoreClass: new () => T) => T` |

### useSignal

Public export `useSignal`.

- **Source:** `src/core/hooks.ts`
- **Type:** `<T>(signal: Signal<T> | ComputedSignal<T>) => T`

```tsx snippet
import { useSignal, signal, Text } from 'fiboui';

const count = signal(0);

export default function Example() {
  const value = useSignal(count);
  return Text(String(value));
}
```

### useReactiveStore

Subscribe to a `createStore()` instance. Distinct from the class-decorator `useStore`.

- **Source:** `src/core/hooks.ts`
- **Type:** `<T>(store: Store<T>) => T`

```tsx snippet
import { createStore, useReactiveStore, Text } from 'fiboui';

const store = createStore({ ready: true });

export default function Example() {
  const state = useReactiveStore(store);
  return Text(state.ready ? 'ready' : 'no');
}
```

### useObservable

Public export `useObservable`.

- **Source:** `src/core/hooks.ts`
- **Type:** `<T>(obs: Observable<T>) => T`


### useBuilderState

Public export `useBuilderState`.

- **Source:** `src/core/StateWrapper.tsx`
- **Type:** `<T = unknown>(key: string) => [T, (value: T) => void]`


### useProvider

Public export `useProvider`.

- **Source:** `src/core/StateWrapper.tsx`
- **Type:** `<T>(key: string) => T`


### useTransition

Public export `useTransition`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `(targetValue: number, config?: TransitionConfig) => number`


### useSpring

Public export `useSpring`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `(targetValue: number, config?: SpringConfig) => number`


### useStagger

Public export `useStagger`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `(count: number, delayBetween?: number) => number[]`

```tsx snippet
import { useStagger, Text } from 'fiboui';

export default function Example() {
  const delays = useStagger(3, 50);
  return Text(delays.join(','));
}
```

### useMountTransition

Public export `useMountTransition`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `(isVisible: boolean, duration?: number) => { shouldRender: boolean; stage: "entering" | "entered" | "exiting" | "exited"; }`


### usePrefersReducedMotion

Public export `usePrefersReducedMotion`.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `() => boolean`

```tsx snippet
import { usePrefersReducedMotion, Text } from 'fiboui';

export default function Example() {
  const reduce = usePrefersReducedMotion();
  return Text(reduce ? 'reduce' : 'motion');
}
```

### useScrollProgress

Scroll position 0–1. Uses `scroll` / `resize` listeners — not rAF.

- **Source:** `src/core/animationHooks.ts`
- **Type:** `() => number`

```tsx snippet
import { useScrollProgress, Text } from 'fiboui';

export default function Example() {
  const p = useScrollProgress();
  return Text(String(p >= 0));
}
```

### useViewportWidth

Current viewport width; SSR snapshot is 1024 (desktop).

- **Source:** `src/core/ResponsiveWrapper.tsx`
- **Type:** `() => number`

```tsx snippet
import { useViewportWidth, Text } from 'fiboui';

export default function Example() {
  const w = useViewportWidth();
  return Text(String(w >= 0));
}
```

### useFiboTheme

Public export `useFiboTheme`.

- **Source:** `src/theme/provider.tsx`
- **Type:** `() => FiboThemeContextValue`


### useRouter

Public export `useRouter`.

- **Source:** `src/navigation/RouterContext.ts`
- **Type:** `() => RouterContextValue`


### useNavigate

Public export `useNavigate`.

- **Source:** `src/navigation/RouterContext.ts`
- **Type:** `() => (path: string, options?: NavigateOptions) => void`


### useParams

Public export `useParams`.

- **Source:** `src/navigation/RouterContext.ts`
- **Type:** `<T extends Record<string, string> = Record<string, string>>() => T`


### useLocation

Public export `useLocation`.

- **Source:** `src/navigation/RouterContext.ts`
- **Type:** `() => { pathname: string; search: string; hash: string; }`


### useQuery

Public export `useQuery`.

- **Source:** `src/navigation/RouterContext.ts`
- **Type:** `() => URLSearchParams`


### useStore

Public export `useStore`.

- **Source:** `src/state/Store.ts`
- **Type:** `<T>(StoreClass: new () => T) => T`


