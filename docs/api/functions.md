# Functions & runtime

Generated from `src/index.ts`. Builders live under [API builders](/api/). Hooks: [Hooks](/api/hooks).

| Name | Kind | Source | Type |
| --- | --- | --- | --- |
| [`signal`](#signal) | function | `src/core/state.ts` | `<T>(initialValue: T) => Signal<T>` |
| [`computed`](#computed) | function | `src/core/state.ts` | `<T>(fn: () => T) => ComputedSignal<T>` |
| [`observable`](#observable) | function | `src/core/state.ts` | `<T>(initialValue: T) => Observable<T>` |
| [`createStore`](#createstore) | function | `src/core/state.ts` | `<T>(initialState: T) => Store<T>` |
| [`Signal`](#signal) | class | `src/core/state.ts` | `typeof Signal` |
| [`ComputedSignal`](#computedsignal) | class | `src/core/state.ts` | `typeof ComputedSignal` |
| [`Observable`](#observable) | class | `src/core/state.ts` | `typeof Observable` |
| [`createReactivityRoot`](#createreactivityroot) | function | `src/core/state.ts` | `() => ReactivityScope` |
| [`runInScope`](#runinscope) | function | `src/core/state.ts` | `<T>(scope: ReactivityScope, fn: () => T) => T` |
| [`getCurrentScope`](#getcurrentscope) | function | `src/core/state.ts` | `() => ReactivityScope` |
| [`ReactivityScope`](#reactivityscope) | function | `src/core/state.ts` | `typeof ReactivityScope` |
| [`Observer`](#observer) | value | `src/core/StateWrapper.tsx` | `({ children }: { children: () => ReactNode; }) => Element` |
| [`ProviderWrapper`](#providerwrapper) | value | `src/core/StateWrapper.tsx` | `({ providers, children }: ProviderWrapperProps) => Element` |
| [`ReactivityRoot`](#reactivityroot) | value | `src/core/ReactivityRoot.tsx` | `({ children, scope }: ReactivityRootProps) => Element` |
| [`FineGrainText`](#finegraintext) | value | `src/core/FineGrain.tsx` | `({ compute, as, className, style, ...rest }: FineGrainTextProps & Record<string, unknown>) => DetailedReactHTMLElement<{ ref: MutableRefObject<HTMLElement>; className: string; styl` |
| [`bindText`](#bindtext) | function | `src/core/FineGrain.tsx` | `(signal: BindableSignal<unknown>, as?: keyof HTMLElementTagNameMap) => FunctionComponentElement<FineGrainTextProps & Record<string, unknown>>` |
| [`applyResponsiveStyles`](#applyresponsivestyles) | function | `src/core/component.ts` | `(baseStyle: CSSProperties, responsive?: ResponsiveStyles, width?: number) => CSSProperties` |
| [`cssCurve`](#csscurve) | function | `src/core/animations.ts` | `(options?: Partial<AnimationOptions>) => string` |
| [`Reveal`](#reveal) | value | `src/core/Reveal.tsx` | `({ preset, once, rootMargin, threshold, forceMotion, preferTimeline, children, }: RevealProps) => DetailedReactHTMLElement<{ ref: MutableRefObject<HTMLDivElement>; className: strin` |
| [`ScrollProgress`](#scrollprogress) | value | `src/core/ScrollProgress.tsx` | `({ children }: ScrollProgressProps) => DetailedReactHTMLElement<{ ref: MutableRefObject<HTMLDivElement>; 'data-fibo-scroll-progress': string; style: { display: "contents"; }; }, HT` |
| [`scrollTo`](#scrollto) | function | `src/core/scroll.ts` | `(target: string \| Element, options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition; }) => void` |
| [`startViewTransition`](#startviewtransition) | function | `src/core/scroll.ts` | `(update: () => void) => void` |
| [`supportsViewTimeline`](#supportsviewtimeline) | function | `src/core/scroll.ts` | `() => boolean` |
| [`supportsScrollTimeline`](#supportsscrolltimeline) | function | `src/core/scroll.ts` | `() => boolean` |
| [`springEase`](#springease) | function | `src/core/easing.ts` | `(options?: SpringOptions) => string` |
| [`resolveCssEase`](#resolvecssease) | function | `src/core/easing.ts` | `(value: string, spring?: SpringOptions) => string` |
| [`normalizePreset`](#normalizepreset) | function | `src/core/motionCss.ts` | `(name: string) => "fadeIn" \| "fadeOut" \| "fade" \| "slideUp" \| "slideDown" \| "slideLeft" \| "slideRight" \| "scaleIn" \| "scaleOut" \| "scale" \| "blurIn" \| "blurOut" \| "blur` |
| [`MotionStyles`](#motionstyles) | value | `src/core/styleManager.ts` | `() => ReactElement<any, string \| JSXElementConstructor<any>>` |
| [`getMotionCss`](#getmotioncss) | function | `src/core/styleManager.ts` | `() => string` |
| [`ensureMotionCss`](#ensuremotioncss) | function | `src/core/styleManager.ts` | `() => void` |
| [`toMediaQuery`](#tomediaquery) | function | `src/core/breakpoints.ts` | `(query: string) => string` |
| [`mount`](#mount) | function | `src/core/mount.ts` | `(target: string \| Element, app: (() => FiboChild) \| FiboChild, options?: { strict?: boolean; }) => Root` |
| [`Fibo`](#fibo) | function | `src/core/mount.ts` | `({ children }: { children: FiboChild; }) => ReactElement<any, string \| JSXElementConstructor<any>>` |
| [`toElement`](#toelement) | function | `src/core/mount.ts` | `(node: FiboChild) => ReactNode` |
| [`PluginManager`](#pluginmanager) | class | `src/core/plugin/PluginManager.ts` | `typeof PluginManager` |
| [`PseudoStateBuilder`](#pseudostatebuilder) | function | `src/core/PseudoStateBuilder.ts` | `typeof PseudoStateBuilder` |
| [`FiboThemeProvider`](#fibothemeprovider) | value | `src/theme/provider.tsx` | `({ theme: initialTheme, children }: FiboThemeProviderProps) => Element` |
| [`Router`](#router) | value | `src/navigation/Router.tsx` | `FC<RouterProps>` |
| [`Link`](#link) | value | `src/navigation/Link.tsx` | `FC<LinkProps>` |
| [`NavLink`](#navlink) | value | `src/navigation/Link.tsx` | `FC<NavLinkProps>` |
| [`Component`](#component) | function | `src/decorators/Component.ts` | `(options?: ComponentOptions) => any` |
| [`Page`](#page) | function | `src/decorators/Page.ts` | `(path: string, options?: { exact?: boolean; meta?: Record<string, any>; }) => any` |
| [`getRegisteredRoutes`](#getregisteredroutes) | function | `src/decorators/Page.ts` | `() => Route[]` |
| [`clearRoutes`](#clearroutes) | function | `src/decorators/Page.ts` | `() => void` |
| [`registerRoute`](#registerroute) | function | `src/decorators/Page.ts` | `(path: string, component: ComponentType, options?: { exact?: boolean; meta?: Record<string, any>; }) => void` |
| [`Store`](#store) | function | `src/state/Store.ts` | `() => ClassDecorator` |
| [`getStore`](#getstore) | function | `src/state/Store.ts` | `<T>(StoreClass: new () => T) => T` |
| [`clearStores`](#clearstores) | function | `src/state/Store.ts` | `() => void` |
| [`isStore`](#isstore) | function | `src/state/Store.ts` | `(target: Function) => boolean` |
| [`persist`](#persist) | function | `src/state/persistence.ts` | `<T>(signal: Signal<T>, options: PersistOptions<T>) => () => void` |
| [`clearPersistedState`](#clearpersistedstate) | function | `src/state/persistence.ts` | `(key: string, storage?: StorageAdapter) => void` |
| [`getPersistedState`](#getpersistedstate) | function | `src/state/persistence.ts` | `<T>(key: string, storage?: StorageAdapter) => T` |

### signal

Public export `signal`.

- **Source:** `src/core/state.ts`
- **Type:** `<T>(initialValue: T) => Signal<T>`

```ts snippet
import { Box, Button, Text, signal } from 'fiboui';

export default function Example() {
  const count = signal(0);
  return Box()
    .bindSignal(count)
    .children(() => [
      Text(() => String(count.value)),
      Button('+').onPress(() => {
        count.value += 1;
      }),
    ]);
}
```

### computed

Public export `computed`.

- **Source:** `src/core/state.ts`
- **Type:** `<T>(fn: () => T) => ComputedSignal<T>`

```ts snippet
import { Text, computed, signal } from 'fiboui';

export default function Example() {
  const n = signal(2);
  const doubled = computed(() => n.value * 2);
  return Text(() => String(doubled.value));
}
```

### observable

Public export `observable`.

- **Source:** `src/core/state.ts`
- **Type:** `<T>(initialValue: T) => Observable<T>`


### createStore

Public export `createStore`.

- **Source:** `src/core/state.ts`
- **Type:** `<T>(initialState: T) => Store<T>`

```ts snippet
import { Button, Text, createStore } from 'fiboui';
import { Column } from 'fiboui';

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

### Signal

Public export `Signal`.

- **Source:** `src/core/state.ts`
- **Type:** `typeof Signal`


### ComputedSignal

Public export `ComputedSignal`.

- **Source:** `src/core/state.ts`
- **Type:** `typeof ComputedSignal`


### Observable

Public export `Observable`.

- **Source:** `src/core/state.ts`
- **Type:** `typeof Observable`


### createReactivityRoot

Public export `createReactivityRoot`.

- **Source:** `src/core/state.ts`
- **Type:** `() => ReactivityScope`


### runInScope

Public export `runInScope`.

- **Source:** `src/core/state.ts`
- **Type:** `<T>(scope: ReactivityScope, fn: () => T) => T`


### getCurrentScope

Public export `getCurrentScope`.

- **Source:** `src/core/state.ts`
- **Type:** `() => ReactivityScope`


### ReactivityScope

Isolated reactive graph for one React root / test / island.

- **Source:** `src/core/state.ts`
- **Type:** `typeof ReactivityScope`


### Observer

Public export `Observer`.

- **Source:** `src/core/StateWrapper.tsx`
- **Type:** `({ children }: { children: () => ReactNode; }) => Element`


### ProviderWrapper

Public export `ProviderWrapper`.

- **Source:** `src/core/StateWrapper.tsx`
- **Type:** `({ providers, children }: ProviderWrapperProps) => Element`


### ReactivityRoot

Isolates `activeEffect` for one React tree / island.

- **Source:** `src/core/ReactivityRoot.tsx`
- **Type:** `({ children, scope }: ReactivityRootProps) => Element`


### FineGrainText

Updates `textContent` in place — the host element is not remounted.

- **Source:** `src/core/FineGrain.tsx`
- **Type:** `({ compute, as, className, style, ...rest }: FineGrainTextProps & Record<string, unknown>) => DetailedReactHTMLElement<{ ref: MutableRefObject<HTMLElement>; className: string; style: CSSProperties; }, HTMLElement>`


### bindText

Bind a signal to a live text node without a React state subscription.

- **Source:** `src/core/FineGrain.tsx`
- **Type:** `(signal: BindableSignal<unknown>, as?: keyof HTMLElementTagNameMap) => FunctionComponentElement<FineGrainTextProps & Record<string, unknown>>`

```ts snippet
import { Column, bindText, signal } from 'fiboui';

export default function Example() {
  const label = signal('Ada');
  return Column().children([bindText(label)]);
}
```

### applyResponsiveStyles

Public export `applyResponsiveStyles`.

- **Source:** `src/core/component.ts`
- **Type:** `(baseStyle: CSSProperties, responsive?: ResponsiveStyles, width?: number) => CSSProperties`


### cssCurve

Public export `cssCurve`.

- **Source:** `src/core/animations.ts`
- **Type:** `(options?: Partial<AnimationOptions>) => string`


### Reveal

IntersectionObserver toggles `.fibo-inview`. Motion is CSS — no rAF.

- **Source:** `src/core/Reveal.tsx`
- **Type:** `({ preset, once, rootMargin, threshold, forceMotion, preferTimeline, children, }: RevealProps) => DetailedReactHTMLElement<{ ref: MutableRefObject<HTMLDivElement>; className: string; 'data-fibo-reveal': string; }, HTMLDivElement>`


### ScrollProgress

Binds `--fibo-progress` from scroll when `animation-timeline: scroll()` is missing. No rAF.

- **Source:** `src/core/ScrollProgress.tsx`
- **Type:** `({ children }: ScrollProgressProps) => DetailedReactHTMLElement<{ ref: MutableRefObject<HTMLDivElement>; 'data-fibo-scroll-progress': string; style: { display: "contents"; }; }, HTMLDivElement>`


### scrollTo

Public export `scrollTo`.

- **Source:** `src/core/scroll.ts`
- **Type:** `(target: string | Element, options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition; }) => void`

```ts snippet
import { Box, Button, scrollTo } from 'fiboui';

export default function Example() {
  return Box().children([
    Box().anchor('here').children('Target'),
    Button('Go').onPress(() => scrollTo('#here')),
  ]);
}
```

### startViewTransition

Public export `startViewTransition`.

- **Source:** `src/core/scroll.ts`
- **Type:** `(update: () => void) => void`


### supportsViewTimeline

Public export `supportsViewTimeline`.

- **Source:** `src/core/scroll.ts`
- **Type:** `() => boolean`


### supportsScrollTimeline

Public export `supportsScrollTimeline`.

- **Source:** `src/core/scroll.ts`
- **Type:** `() => boolean`


### springEase

CSS `linear()` spring sampled once. stiffness/damping/mass change the curve.
The browser interpolates — no rAF on the CSS path.

- **Source:** `src/core/easing.ts`
- **Type:** `(options?: SpringOptions) => string`


### resolveCssEase

Public export `resolveCssEase`.

- **Source:** `src/core/easing.ts`
- **Type:** `(value: string, spring?: SpringOptions) => string`


### normalizePreset

Public export `normalizePreset`.

- **Source:** `src/core/motionCss.ts`
- **Type:** `(name: string) => "fadeIn" | "fadeOut" | "fade" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scaleIn" | "scaleOut" | "scale" | "blurIn" | "blurOut" | "blur" | "pop" | "bounce"`


### MotionStyles

Public export `MotionStyles`.

- **Source:** `src/core/styleManager.ts`
- **Type:** `() => ReactElement<any, string | JSXElementConstructor<any>>`


### getMotionCss

Public export `getMotionCss`.

- **Source:** `src/core/styleManager.ts`
- **Type:** `() => string`


### ensureMotionCss

Public export `ensureMotionCss`.

- **Source:** `src/core/styleManager.ts`
- **Type:** `() => void`


### toMediaQuery

Resolve `md` → `(min-width: 768px)`, or pass through a raw media query.

- **Source:** `src/core/breakpoints.ts`
- **Type:** `(query: string) => string`


### mount

Mount a page that returns a builder — no `.build()` on the root.

```ts
function App() {
  return Column().children([Text('Hi')]);
}
mount('#root', App);
```

- **Source:** `src/core/mount.ts`
- **Type:** `(target: string | Element, app: (() => FiboChild) | FiboChild, options?: { strict?: boolean; }) => Root`

```ts snippet
import { Column, Text, mount } from 'fiboui';

export default function Example() {
  return Column().children([Text('Mounted')]);
}

export function runMount(el: HTMLElement) {
  mount(el, Example, { strict: false });
}
```

### Fibo

Optional wrapper. Builders are already React elements:

```tsx
function App() {
  return Button('Save').onPress(save);
}
```

- **Source:** `src/core/mount.ts`
- **Type:** `({ children }: { children: FiboChild; }) => ReactElement<any, string | JSXElementConstructor<any>>`

```tsx snippet
import { createElement } from 'react';
import { Fibo, Text } from 'fiboui';

export default function Example() {
  return createElement(Fibo, { children: Text('Hi') });
}
```

### toElement

Turn a builder (or already-built node) into a React node.

- **Source:** `src/core/mount.ts`
- **Type:** `(node: FiboChild) => ReactNode`

```ts snippet
import { Text, toElement } from 'fiboui';

export default function Example() {
  return toElement(Text('Hi'));
}
```

### PluginManager

Public export `PluginManager`.

- **Source:** `src/core/plugin/PluginManager.ts`
- **Type:** `typeof PluginManager`


### PseudoStateBuilder

Public export `PseudoStateBuilder`.

- **Source:** `src/core/PseudoStateBuilder.ts`
- **Type:** `typeof PseudoStateBuilder`


### FiboThemeProvider

Public export `FiboThemeProvider`.

- **Source:** `src/theme/provider.tsx`
- **Type:** `({ theme: initialTheme, children }: FiboThemeProviderProps) => Element`


### Router

Public export `Router`.

- **Source:** `src/navigation/Router.tsx`
- **Type:** `FC<RouterProps>`


### Link

Public export `Link`.

- **Source:** `src/navigation/Link.tsx`
- **Type:** `FC<LinkProps>`


### NavLink

Public export `NavLink`.

- **Source:** `src/navigation/Link.tsx`
- **Type:** `FC<NavLinkProps>`


### Component

Public export `Component`.

- **Source:** `src/decorators/Component.ts`
- **Type:** `(options?: ComponentOptions) => any`


### Page

Public export `Page`.

- **Source:** `src/decorators/Page.ts`
- **Type:** `(path: string, options?: { exact?: boolean; meta?: Record<string, any>; }) => any`


### getRegisteredRoutes

Public export `getRegisteredRoutes`.

- **Source:** `src/decorators/Page.ts`
- **Type:** `() => Route[]`


### clearRoutes

Public export `clearRoutes`.

- **Source:** `src/decorators/Page.ts`
- **Type:** `() => void`


### registerRoute

Public export `registerRoute`.

- **Source:** `src/decorators/Page.ts`
- **Type:** `(path: string, component: ComponentType, options?: { exact?: boolean; meta?: Record<string, any>; }) => void`


### Store

Public export `Store`.

- **Source:** `src/state/Store.ts`
- **Type:** `() => ClassDecorator`


### getStore

Public export `getStore`.

- **Source:** `src/state/Store.ts`
- **Type:** `<T>(StoreClass: new () => T) => T`


### clearStores

Public export `clearStores`.

- **Source:** `src/state/Store.ts`
- **Type:** `() => void`


### isStore

Public export `isStore`.

- **Source:** `src/state/Store.ts`
- **Type:** `(target: Function) => boolean`


### persist

Public export `persist`.

- **Source:** `src/state/persistence.ts`
- **Type:** `<T>(signal: Signal<T>, options: PersistOptions<T>) => () => void`


### clearPersistedState

Public export `clearPersistedState`.

- **Source:** `src/state/persistence.ts`
- **Type:** `(key: string, storage?: StorageAdapter) => void`


### getPersistedState

Public export `getPersistedState`.

- **Source:** `src/state/persistence.ts`
- **Type:** `<T>(key: string, storage?: StorageAdapter) => T`


