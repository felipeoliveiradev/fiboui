# Combobox

Combobox fluent builder. Returns a React element — do not call `.build()`.

- **Factory:** `Combobox()`
- **Source:** `src/interactive/Combobox/index.ts`
- **Renders as:** React element (no `.build()`)

## Example

```tsx snippet
import { Combobox } from 'fiboui';

export default function Example() {
  return Combobox().options([{ label: 'A', value: 'a' }]).onChange(() => undefined);
}
```

## Component methods

| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `value` | `value(val: string \| string[]): this` | — | — |
| `label` | `label(val: string): this` | — | — |
| `placeholder` | `placeholder(val: string): this` | — | — |
| `options` | `options(opts: Option[]): this` | — | — |
| `multiple` | `multiple(val: boolean = true): this` | val = true | — |
| `disabled` | `disabled(val: boolean = true): this` | val = true | — |
| `error` | `error(val: string): this` | — | — |
| `onChange` | `onChange(handler: (value: string \| string[]) => void): this` | — | — |
| `onAdd` | `onAdd(handler: (newLabel: string) => void): this` | — | — |
| `build` | `build(): ReactElement` | — | — |

## Inherited methods

These come from FiboBuilder. Full table: [Shared builder methods](/api/shared-methods).

::: details 118 inherited methods
| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `hug` | `hug(): this` | — | — |
| `id` | `id(value: string): this` | — | — |
| `anchor` | `anchor(value: string): this` | — | Scroll target. Same as `.id()`, plus `scroll-margin-top` so the section is not hidden under a sticky header. Pair with `scrollTo('#name')`. |
| `scrollMargin` | `scrollMargin(value: number \| string): this` | — | Explicit `scroll-margin-top` on this node (overrides the sticky CSS variable that `.anchor()` applies). |
| `key` | `key(value: string \| number): this` | — | React list key. After this is called, React reads the key as a string. Builders are valid elements — you do not need `.build()`. |
| `paddingHorizontal` | `paddingHorizontal(value: string \| number): this` | — | — |
| `paddingVertical` | `paddingVertical(value: string \| number): this` | — | — |
| `marginHorizontal` | `marginHorizontal(value: string \| number): this` | — | — |
| `marginVertical` | `marginVertical(value: string \| number): this` | — | — |
| `flexDirection` | `flexDirection(direction: 'row' \| 'column'): this` | — | — |
| `alignItems` | `alignItems(alignment: 'start' \| 'center' \| 'end' \| 'stretch'): this` | — | — |
| `justifyContent` | `justifyContent(justify: 'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'): this` | — | — |
| `flex` | `flex(value?: number \| string): this` | — | — |
| `grid` | `grid(): this` | — | — |
| `inlineFlex` | `inlineFlex(): this` | — | — |
| `inlineGrid` | `inlineGrid(): this` | — | — |
| `block` | `block(): this` | — | — |
| `inlineBlock` | `inlineBlock(): this` | — | — |
| `hidden` | `hidden(): this` | — | — |
| `center` | `center(): this` | — | — |
| `centerX` | `centerX(): this` | — | — |
| `centerY` | `centerY(): this` | — | — |
| `spaceBetween` | `spaceBetween(): this` | — | — |
| `spaceAround` | `spaceAround(): this` | — | — |
| `spaceEvenly` | `spaceEvenly(): this` | — | — |
| `fill` | `fill(): this` | — | — |
| `fillWidth` | `fillWidth(): this` | — | — |
| `fillHeight` | `fillHeight(): this` | — | — |
| `square` | `square(size: number \| string): this` | — | — |
| `circle` | `circle(): this` | — | — |
| `opacity` | `opacity(value: number): this` | — | — |
| `p` | `p(value: number \| string): this` | — | — |
| `px` | `px(value: number \| string): this` | — | — |
| `py` | `py(value: number \| string): this` | — | — |
| `paddingX` | `paddingX(value: number \| string): this` | — | — |
| `paddingY` | `paddingY(value: number \| string): this` | — | — |
| `m` | `m(value: number \| string): this` | — | — |
| `mx` | `mx(value: number \| string): this` | — | — |
| `my` | `my(value: number \| string): this` | — | — |
| `marginX` | `marginX(value: number \| string): this` | — | — |
| `marginY` | `marginY(value: number \| string): this` | — | — |
| `bg` | `bg(color: string \| import('../theme/colorEnums').Colors): this` | — | — |
| `text` | `text(color: string \| import('../theme/colorEnums').Colors): this` | — | — |
| `color` | `color(value: string \| import('../theme/colorEnums').Colors): this` | — | — |
| `shadow` | `shadow(config?: import('./shadowTypes').ShadowConfig): this` | — | — |
| `responsive` | `responsive(styles: ResponsiveStyles): this` | — | — |
| `media` | `media(query: BreakpointKey \| string, styles: CSSProperties): this` | — | CSS `@media` (min-width or a raw query). Compiles to a class — no resize JS. |
| `sm` | `sm(styles: CSSProperties): this` | — | — |
| `md` | `md(styles: CSSProperties): this` | — | — |
| `lg` | `lg(styles: CSSProperties): this` | — | — |
| `xl` | `xl(styles: CSSProperties): this` | — | — |
| `rounded` | `rounded(value: string \| number): this` | — | — |
| `borderRadius` | `borderRadius(value: string \| number): this` | — | — |
| `borderColor` | `borderColor(value: string): this` | — | — |
| `width` | `width(value: string \| number): this` | — | — |
| `height` | `height(value: string \| number): this` | — | — |
| `gap` | `gap(value: string \| number): this` | — | — |
| `clean` | `clean(): this` | — | — |
| `borderInput` | `borderInput(color: string = 'gray-300', focusColor: string = 'blue-500'): this` | color = 'gray-300', focusColor = 'blue-500' | — |
| `weight` | `weight(value: string \| number): this` | — | — |
| `onClick` | `onClick(handler: (event: React.MouseEvent<any>) => void): this` | — | — |
| `state` | `state(key: string, initialValue: T): this` | — | — |
| `getState` | `getState(key: string): T \| undefined` | — | — |
| `setState` | `setState(key: string, value: T): this` | — | — |
| `provide` | `provide(key: string, value: T): this` | — | — |
| `consume` | `consume(key: string): T \| undefined` | — | — |
| `observer` | `observer(options?: string \| number \| { key?: string \| number }): this` | — | — |
| `observe` | `observe(observable: Observable<T>): this` | — | — |
| `bindSignal` | `bindSignal(signal: BindableSignal<T>): this` | — | — |
| `translateX` | `translateX(value: Signal<number> \| number): this` | — | — |
| `translateY` | `translateY(value: Signal<number> \| number): this` | — | — |
| `scale` | `scale(value: Signal<number> \| number): this` | — | — |
| `rotate` | `rotate(degrees: Signal<number> \| number): this` | — | — |
| `gesture` | `gesture(gesture: GestureBuilder): this` | — | — |
| `animation` | `animation(config: Partial<AnimationOptions>): this` | — | — |
| `className` | `className(className: string): this` | — | — |
| `classNames` | `classNames(classNames: string[]): this` | — | — |
| `css` | `css(styles: CSSProperties): this` | — | — |
| `style` | `style(style: CSSProperties): this` | — | — |
| `props` | `props(props: Record<string, any>): this` | — | — |
| `transition` | `transition(value: string): this \\| transition(properties: string \| string[], duration: number, easing?: string, delay?: number): this \\| transition(valueOrProperties: string \| string[], duration?: number, easing?: string, delay?: number): this` | — | Apply CSS transition Overload 1: String syntax Example: .transition('all 0.2s ease-in-out') Overload 2: Shorthand with parameters Example: .transition('all', 200, 'ease-out') Example: .transition('all', 200, 'ease-out', 50) |
| `duration` | `duration(ms: number): this` | — | Set transition duration in milliseconds Example: .duration(200) → 200ms |
| `easing` | `easing(value: 'linear' \| 'ease' \| 'ease-in' \| 'ease-out' \| 'ease-in-out' \| 'spring' \| string): this` | — | Set transition easing function Example: .easing('ease-in-out') |
| `ease` | `ease(value: string): this` | — | Alias of `.easing()`. `'spring'` becomes CSS `linear()`. |
| `delay` | `delay(ms: number): this` | — | Set transition delay in milliseconds Example: .delay(100) → 100ms delay |
| `properties` | `properties(props: string[]): this` | — | Set which properties to transition Example: .properties(['color', 'transform']) |
| `animate` | `animate(preset: MotionPreset \| string, options?: {       duration?: number;       ease?: string;       delay?: number;       from?: number \| string;       stiffness?: number;       damping?: number;       mass?: number;     }): this \\| animate(custom: CustomMotion): this \\| animate(presetOrCustom: MotionPreset \| string \| CustomMotion, options?: {       duration?: number;       ease?: string;       delay?: number;       from?: number \| string;       stiffness?: number;       damping?: number;       mass?: number;     }): this` | — | CSS enter/exit preset. Compiles to `@keyframes` — no rAF. |
| `spring` | `spring(options?: SpringOptions): this` | — | CSS `linear()` spring. Works on `.animate()` and `.transition()` / `.hover()`. |
| `reducedMotion` | `reducedMotion(mode: 'reduce' \| 'never' = 'reduce'): this` | mode = 'reduce' | — |
| `press` | `press(callback?: (builder: PseudoStateBuilder) => void \| PseudoStateBuilder): this` | — | — |
| `focusVisible` | `focusVisible(): PseudoStateBuilder \\| focusVisible(callback: PseudoStateFn): this \\| focusVisible(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `stagger` | `stagger(ms: number): this` | — | — |
| `reveal` | `reveal(preset: string \| { preset?: string; once?: boolean; rootMargin?: string; threshold?: number } = 'fadeUp'): this` | preset = 'fadeUp' | Scroll-reveal: IntersectionObserver toggles `.fibo-inview`. |
| `onScroll` | `onScroll(preset: string = 'fadeIn'): this` | preset = 'fadeIn' | Alias of `.reveal()` for scroll-triggered presets. |
| `scrollTimeline` | `scrollTimeline(kind: 'view' \| 'scroll' = 'view'): this` | kind = 'view' | CSS `animation-timeline: view()` / `scroll()`; IntersectionObserver reveal is the fallback. |
| `scrollProgress` | `scrollProgress(): this` | — | — |
| `smoothScroll` | `smoothScroll(): this` | — | — |
| `scrollSnap` | `scrollSnap(axis: 'x' \| 'y' \| 'both' = 'y'): this` | axis = 'y' | — |
| `scrollSnapAlign` | `scrollSnapAlign(align: 'start' \| 'center' \| 'end' = 'start'): this` | align = 'start' | — |
| `sticky` | `sticky(top: number \| string \| boolean = 0): this` | top = 0 | — |
| `viewTransition` | `viewTransition(name: string): this` | — | — |
| `focusRing` | `focusRing(color = 'var(--fibo-primary)'): this` | color = 'var(--fibo-primary)' | Default `:focus-visible` ring. Pass a callback to customize. |
| `theme` | `theme(themeConfig: ThemeConfig): this` | — | — |
| `hover` | `hover(): PseudoStateBuilder \\| hover(callback: PseudoStateFn): this \\| hover(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `focus` | `focus(): PseudoStateBuilder \\| focus(callback: PseudoStateFn): this \\| focus(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `active` | `active(): PseudoStateBuilder \\| active(callback: PseudoStateFn): this \\| active(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `visited` | `visited(): PseudoStateBuilder \\| visited(callback: PseudoStateFn): this \\| visited(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `disabledState` | `disabledState(): PseudoStateBuilder \\| disabledState(callback: PseudoStateFn): this \\| disabledState(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `focusWithin` | `focusWithin(): PseudoStateBuilder \\| focusWithin(callback: PseudoStateFn): this \\| focusWithin(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `firstChild` | `firstChild(): PseudoStateBuilder \\| firstChild(callback: PseudoStateFn): this \\| firstChild(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `lastChild` | `lastChild(): PseudoStateBuilder \\| lastChild(callback: PseudoStateFn): this \\| lastChild(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `groupHover` | `groupHover(): PseudoStateBuilder \\| groupHover(callback: PseudoStateFn): this \\| groupHover(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `groupFocus` | `groupFocus(): PseudoStateBuilder \\| groupFocus(callback: PseudoStateFn): this \\| groupFocus(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `groupActive` | `groupActive(): PseudoStateBuilder \\| groupActive(callback: PseudoStateFn): this \\| groupActive(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `groupFocusWithin` | `groupFocusWithin(): PseudoStateBuilder \\| groupFocusWithin(callback: PseudoStateFn): this \\| groupFocusWithin(callback?: PseudoStateFn): this \| PseudoStateBuilder` | — | — |
| `group` | `group(): this` | — | — |
| `children` | `children(children: FiboChildren): this` | — | — |
| `build` | `build(): ReactElement` | — | — |
:::

