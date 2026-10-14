# Shared builder methods

Every `createBuilder` factory (Button, Column, Box, …) inherits these methods from the internal `FiboBuilder` class. `FiboBuilder` and `createBuilder` are **not** public exports — this page documents the methods you call on every builder.

CSS property names are also callable: `.backgroundColor('#fff')`, `.maxWidth(960)`, `.flexWrap('wrap')`. They compile through StyleManager.

.builders are React elements. `.build()` still assembles the host tree but is **deprecated**.

## Methods

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

## Shape builders

`Circle`, `Rect`, and `Path` inherit SVG helpers from an internal `ShapeBuilder` instead of (or in addition to) layout helpers.

| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `className` | `className(value: string): this` | — | — |
| `style` | `style(value: React.CSSProperties): this` | — | — |
| `fill` | `fill(color: string \| any): this` | — | — |
| `fillColor` | `fillColor(color: string): this` | — | — |
| `fillRGB` | `fillRGB(r: number, g: number, b: number): this` | — | — |
| `fillRGBA` | `fillRGBA(r: number, g: number, b: number, a: number): this` | — | — |
| `fillHex` | `fillHex(hex: string): this` | — | — |
| `fillOpacity` | `fillOpacity(value: number): this` | — | — |
| `stroke` | `stroke(color: string): this` | — | — |
| `strokeColor` | `strokeColor(color: string): this` | — | — |
| `strokeRGB` | `strokeRGB(r: number, g: number, b: number): this` | — | — |
| `strokeRGBA` | `strokeRGBA(r: number, g: number, b: number, a: number): this` | — | — |
| `strokeHex` | `strokeHex(hex: string): this` | — | — |
| `strokeWidth` | `strokeWidth(width: number): this` | — | — |
| `strokeW` | `strokeW(width: number): this` | — | — |
| `strokeOpacity` | `strokeOpacity(value: number): this` | — | — |
| `strokeDasharray` | `strokeDasharray(pattern: string): this` | — | — |
| `strokeLinecap` | `strokeLinecap(value: 'butt' \| 'round' \| 'square'): this` | — | — |
| `strokeLinejoin` | `strokeLinejoin(value: 'miter' \| 'round' \| 'bevel'): this` | — | — |
| `dashed` | `dashed(dashLength: number = 5, gapLength: number = 5): this` | dashLength = 5, gapLength = 5 | — |
| `dotted` | `dotted(dotSize: number = 2, gapSize: number = 2): this` | dotSize = 2, gapSize = 2 | — |
| `opacity` | `opacity(value: number): this` | — | — |
| `alpha` | `alpha(value: number): this` | — | — |
| `transparent` | `transparent(percent: number): this` | — | — |
| `opaque` | `opaque(): this` | — | — |
| `transform` | `transform(value: string): this` | — | — |
| `rotate` | `rotate(degrees: number, cx?: number, cy?: number): this` | — | — |
| `scale` | `scale(sx: number, sy?: number): this` | — | — |
| `scaleX` | `scaleX(sx: number): this` | — | — |
| `scaleY` | `scaleY(sy: number): this` | — | — |
| `scaleUniform` | `scaleUniform(s: number): this` | — | — |
| `translate` | `translate(tx: number, ty: number): this` | — | — |
| `translateX` | `translateX(tx: number): this` | — | — |
| `translateY` | `translateY(ty: number): this` | — | — |
| `skewX` | `skewX(degrees: number): this` | — | — |
| `skewY` | `skewY(degrees: number): this` | — | — |
| `rotateX` | `rotateX(degrees: number): this` | — | — |
| `rotateY` | `rotateY(degrees: number): this` | — | — |
| `rotateZ` | `rotateZ(degrees: number): this` | — | — |
| `rotate3d` | `rotate3d(x: number, y: number, z: number, degrees: number): this` | — | — |
| `perspective` | `perspective(value: number): this` | — | — |
| `filter` | `filter(value: string): this` | — | — |
| `blur` | `blur(amount: number): this` | — | — |
| `blurPx` | `blurPx(px: number): this` | — | — |
| `dropShadow` | `dropShadow(dx: number, dy: number, blur: number, color: string): this` | — | — |
| `shadow` | `shadow(dx: number, dy: number, blur: number, color: string): this` | — | — |
| `glow` | `glow(color: string, blur: number = 10): this` | blur = 10 | — |
| `brightness` | `brightness(value: number): this` | — | — |
| `contrast` | `contrast(value: number): this` | — | — |
| `grayscale` | `grayscale(value: number = 1): this` | value = 1 | — |
| `sepia` | `sepia(value: number = 1): this` | value = 1 | — |
| `saturate` | `saturate(value: number): this` | — | — |
| `hueRotate` | `hueRotate(degrees: number): this` | — | — |
| `invert` | `invert(value: number = 1): this` | value = 1 | — |
| `clipPath` | `clipPath(value: string): this` | — | — |
| `children` | `children(elements: React.ReactNode[]): this` | — | — |
| `child` | `child(element: React.ReactNode): this` | — | — |
| `over` | `over(elements: React.ReactNode[]): this` | — | — |
| `below` | `below(elements: React.ReactNode[]): this` | — | — |
| `build` | `build(): ReactElement` | — | — |
