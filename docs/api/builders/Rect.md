# Rect

Rect fluent builder. Returns a React element — do not call `.build()`.

- **Factory:** `Rect()`
- **Source:** `src/graphics/shapes/Rect.ts`
- **Renders as:** React element (no `.build()`)

## Example

```tsx snippet
import { Rect } from 'fiboui';

export default function Example() {
  return Rect();
}
```

## Component methods

| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `position` | `position(x: number, y: number): this` | — | — |
| `x` | `x(value: number): this` | — | — |
| `y` | `y(value: number): this` | — | — |
| `left` | `left(value: number): this` | — | — |
| `top` | `top(value: number): this` | — | — |
| `right` | `right(value: number): this` | — | — |
| `bottom` | `bottom(value: number): this` | — | — |
| `centerX` | `centerX(value: number): this` | — | — |
| `centerY` | `centerY(value: number): this` | — | — |
| `center` | `center(cx: number, cy: number): this` | — | — |
| `size` | `size(width: number, height: number): this` | — | — |
| `width` | `width(value: number): this` | — | — |
| `height` | `height(value: number): this` | — | — |
| `cornerRadius` | `cornerRadius(radius: number): this` | — | — |
| `cornerRadii` | `cornerRadii(rx: number, ry: number): this` | — | — |
| `cornerRadiusTopLeft` | `cornerRadiusTopLeft(radius: number): this` | — | — |
| `cornerRadiusTopRight` | `cornerRadiusTopRight(radius: number): this` | — | — |
| `cornerRadiusBottomLeft` | `cornerRadiusBottomLeft(radius: number): this` | — | — |
| `cornerRadiusBottomRight` | `cornerRadiusBottomRight(radius: number): this` | — | — |
| `cornerRadiusTop` | `cornerRadiusTop(radius: number): this` | — | — |
| `cornerRadiusBottom` | `cornerRadiusBottom(radius: number): this` | — | — |
| `cornerRadiusLeft` | `cornerRadiusLeft(radius: number): this` | — | — |
| `cornerRadiusRight` | `cornerRadiusRight(radius: number): this` | — | — |
| `rotateSelf` | `rotateSelf(degrees: number): this` | — | — |
| `build` | `build(): ReactElement` | — | — |

## Inherited methods

These come from ShapeBuilder. Full table: [Shared builder methods](/api/shared-methods).

::: details 60 inherited methods
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
:::

