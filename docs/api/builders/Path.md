# Path

Path fluent builder. Returns a React element — do not call `.build()`.

- **Factory:** `Path()`
- **Source:** `src/graphics/shapes/Path.ts`
- **Renders as:** React element (no `.build()`)

## Example

```tsx snippet
import { Path } from 'fiboui';

export default function Example() {
  return Path();
}
```

## Component methods

| Method | Signature | Defaults | Description |
| --- | --- | --- | --- |
| `d` | `d(pathData: string): this` | — | — |
| `moveTo` | `moveTo(x: number, y: number): this` | — | — |
| `lineTo` | `lineTo(x: number, y: number): this` | — | — |
| `horizontalLineTo` | `horizontalLineTo(x: number): this` | — | — |
| `verticalLineTo` | `verticalLineTo(y: number): this` | — | — |
| `curveTo` | `curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this` | — | — |
| `smoothCurveTo` | `smoothCurveTo(x2: number, y2: number, x: number, y: number): this` | — | — |
| `quadraticCurveTo` | `quadraticCurveTo(x1: number, y1: number, x: number, y: number): this` | — | — |
| `smoothQuadraticCurveTo` | `smoothQuadraticCurveTo(x: number, y: number): this` | — | — |
| `arc` | `arc(rx: number, ry: number, rotation: number, largeArc: 0 \| 1, sweep: 0 \| 1, x: number, y: number): this` | — | — |
| `close` | `close(): this` | — | — |
| `startAt` | `startAt(x: number, y: number): this` | — | — |
| `lineUntil` | `lineUntil(x: number, y: number): this` | — | — |
| `curveUntil` | `curveUntil(endX: number, endY: number, pullX: number, pullY: number): this` | — | — |
| `pull` | `pull(x: number, y: number): this` | — | — |
| `to` | `to(x: number, y: number): this` | — | — |
| `done` | `done(): this` | — | — |
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

