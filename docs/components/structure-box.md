<script setup>
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderBasic = () =>
  Box()
    .padding('16px')
    .backgroundColor('#3B82F6')
    .color('#FFFFFF')
    .borderRadius('8px')
    .children('Basic Box')


const renderNested = () =>
  Box()
    .display('flex')
    .gap('16px')
    .padding('24px')
    .backgroundColor('#F3F4F6')
    .borderRadius('12px')
    .children([
      Box().padding('16px').backgroundColor('#EF4444').color('#FFFFFF').children('Box 1'),
      Box().padding('16px').backgroundColor('#10B981').color('#FFFFFF').children('Box 2'),
      Box().padding('16px').backgroundColor('#3B82F6').color('#FFFFFF').children('Box 3')
    ])

</script>

# Box

A fundamental layout primitive that renders a `<div>` element with builder-based styling.

`Box` is the most versatile component in FiboUI. It serves as the foundation for layouts, containers, and custom components. Every visual element can be composed using `Box` combined with the builder pattern.

## Live Examples

### Basic Usage

<ReactWrapper :component="renderBasic" />

::: details View Source
```tsx
Box()
  .padding('16px')
  .backgroundColor('#3B82F6')
  .color('#FFFFFF')
  .borderRadius('8px')
  .children('Basic Box')

```
:::

### Nested Layout

<ReactWrapper :component="renderNested" />

::: details View Source
```tsx
Box()
  .display('flex')
  .gap('16px')
  .padding('24px')
  .backgroundColor('#F3F4F6')
  .borderRadius('12px')
  .children([
    Box().padding('16px').backgroundColor('#EF4444').color('#FFFFFF').children('Box 1'),
    Box().padding('16px').backgroundColor('#10B981').color('#FFFFFF').children('Box 2'),
    Box().padding('16px').backgroundColor('#3B82F6').color('#FFFFFF').children('Box 3')
  ])

```
:::

## Constructor

```tsx
Box() → BoxBuilder
```

Creates a new `Box` builder instance. No arguments required.

## Properties

### Core Methods

| Method | Type | Description |
| :--- | :--- | :--- |
| `.children(children)` | `ReactNode \| ReactNode[]` | Sets child elements |
| `.className(className)` | `string` | Adds a CSS class |
| `.classNames(classNames)` | `string[]` | Adds multiple CSS classes |
| `.style(style)` | `CSSProperties` | Merges inline styles |
| `.css(styles)` | `CSSProperties` | Merges CSS-to-Tailwind styles |
| `.props(props)` | `Record<string, any>` | Merges additional props |
| `.id(value)` | `string` | Sets element ID |

### Layout Helpers

| Method | Type | Description |
| :--- | :--- | :--- |
| `.flexDirection(direction)` | `'row' \| 'column'` | Sets flex direction |
| `.alignItems(alignment)` | `'start' \| 'center' \| 'end' \| 'stretch'` | Aligns flex items on cross axis |
| `.justifyContent(justify)` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'`, also `space-between`, `spaceBetween`, and the same forms for around / evenly | Main axis. `alignItems('space-between')` is not valid — that method is the cross axis only. |

### Spacing Helpers

| Method | Type | Description |
| :--- | :--- | :--- |
| `.paddingHorizontal(value)` / `.paddingX` / `.px` | `string \| number` | `padding-left` and `padding-right` (a number gets `px`). Same helpers exist on `.hover()`, `.focus()`, and `.active()`. |
| `.paddingVertical(value)` / `.paddingY` / `.py` | `string \| number` | `padding-top` and `padding-bottom` |
| `.marginHorizontal(value)` / `.marginX` / `.mx` | `string \| number` | `margin-left` and `margin-right` |
| `.marginVertical(value)` / `.marginY` / `.my` | `string \| number` | `margin-top` and `margin-bottom` |

### Dynamic CSS Properties

`Box` supports **any valid CSS property** as a method via Proxy. This means you can call any CSS property directly:

```tsx
Box()
  .padding('16px')              // CSS: padding
  .margin('8px')                // CSS: margin
  .backgroundColor('#000')      // CSS: background-color
  .color('#FFF')                // CSS: color
  .fontSize('16px')             // CSS: font-size
  .display('flex')              // CSS: display
  .gap('12px')                  // CSS: gap
  .borderRadius('8px')          // CSS: border-radius
  .boxShadow('0 4px 6px rgba(0,0,0,0.1)')  // CSS: box-shadow
  .transform('translateY(-2px)')           // CSS: transform

```

**Note**: Use camelCase for CSS properties (e.g., `backgroundColor` not `background-color`).

## Usage Examples

### Flexbox Layout

```tsx
Box()
  .display('flex')
  .flexDirection('column')
  .alignItems('center')
  .gap('16px')
  .children([...])

```

### With Tailwind Classes

```tsx
Box()
  .className('bg-blue-500 text-white p-4 rounded-lg')
  .children('Styled with Tailwind')

```

### Responsive Styles

Prefer CSS `@media` (easy):

```tsx
Box()
  .padding(8)
  .md({ padding: 16 })
  .lg({ padding: 24 })
```

JS viewport (legacy, still works):

```tsx
Box()
  .responsive({
    mobile: { padding: '8px' },
    desktop: { padding: '24px' }
  })
```

## See Also

- [Grid](/components/structure-grid) - CSS Grid layout
- [Text](/components/content-text) - Typography component
- [Container](/components/layout-all) - Centered max-width wrapper
