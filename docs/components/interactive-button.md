<script setup>
import { Box } from '../../src/structure/Box'
import { Button } from '../../src/interactive/Button'

const renderVariants = () =>
  Box().flex().gap(4).flexWrap('wrap').children([
    Button('Primary').variant('primary'),
    Button('Secondary').variant('secondary'),
    Button('Outline').variant('outline'),
    Button('Ghost').variant('ghost'),
    Button('Soft').variant('soft')
  ])

const renderSizes = () =>
  Box().flex().gap(4).alignItems('center').children([
    Button('Small').size('sm'),
    Button('Medium').size('md'),
    Button('Large').size('lg')
  ])

const renderStates = () =>
  Box().flex().gap(4).flexWrap('wrap').children([
    Button('Default'),
    Button('Disabled').disabled(true),
    Button('Loading').loading(true)
  ])
</script>

# Button

An interactive button component with multiple variants, sizes, and states.

`Button` is a fundamental interactive element that handles user clicks and actions. It supports various visual styles, loading states, and can be disabled when needed.

## Live Examples

### Variants

<ReactWrapper :component="renderVariants" />

::: details View Source
```tsx
Box().flex().gap(4).flexWrap('wrap').children([
  Button('Primary').variant('primary'),
  Button('Secondary').variant('secondary'),
  Button('Outline').variant('outline'),
  Button('Ghost').variant('ghost'),
  Button('Soft').variant('soft')
])
```
:::

### Sizes

<ReactWrapper :component="renderSizes" />

::: details View Source
```tsx
Box().flex().gap(4).alignItems('center').children([
  Button('Small').size('sm'),
  Button('Medium').size('md'),
  Button('Large').size('lg')
])
```
:::

### States

<ReactWrapper :component="renderStates" />

::: details View Source
```tsx
Box().flex().gap(4).flexWrap('wrap').children([
  Button('Default'),
  Button('Disabled').disabled(true),
  Button('Loading').loading(true)
])
```
:::

## Constructor

```tsx
Button(label?: string) → ButtonBuilder
```

Creates a new `Button` builder instance.

**Parameters:**
- `label` (optional): The button text content

## Properties

### Appearance

| Method | Type | Description |
| :--- | :--- | :--- |
| `.variant(variant)` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'soft'` | Sets the button visual style |
| `.size(size)` | `'sm' \| 'md' \| 'lg'` | Sets the button size |
| `.pill()` | `boolean` | Makes the button fully rounded |

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.text(text)` | `string` | Sets the button text |
| `.icon(icon)` | `ReactNode` | Sets a leading icon |
| `.iconRight(icon)` | `ReactNode` | Sets a trailing icon |

### State

| Method | Type | Description |
| :--- | :--- | :--- |
| `.disabled(disabled)` | `boolean` | Disables the button |
| `.loading(loading)` | `boolean` | Shows loading spinner |

### Events

| Method | Type | Description |
| :--- | :--- | :--- |
| `.onPress(handler)` | `() => void` | Press / click handler (preferred) |
| `.onClick(handler)` | `(event: MouseEvent) => void` | Raw DOM click handler |
| `.onHover(handler)` | `() => void` | `mouseenter` handler (does not receive the event) |

### Inherited from FiboBuilder

`Button` inherits all layout and styling methods from `FiboBuilder`:

- Layout: `.flex()`, `.flexDirection()`, `.alignItems()`, `.justifyContent()`
- Spacing: `.p()`, `.m()`, `.px()`, `.py()`, `.mx()`, `.my()`
- Sizing: `.w()`, `.h()`, `.minW()`, `.maxW()`
- Colors: `.bg()`, `.color()`, `.opacity()`
- Advanced: `.className()`, `.style()`, `.css()`, `.props()`

See [Box](/components/structure-box) for complete builder API reference.

## Usage Examples

### With Icons

```tsx
Button('Save')
  .icon(<SaveIcon />)
  .variant('primary')
  .onClick(() => console.log('Saved!'))

```

### Loading State

```tsx
Button('Submit')
  .loading(isLoading)
  .disabled(isLoading)
  .onClick(handleSubmit)

```

### Hover handler

`.onHover` is a **callback**, not the CSS hover style. Use builder `.hover()` for visual hover.

```tsx
Button('Notify')
  .onHover(() => console.log('entered'))
  .hover((h) => h.scale(1.03))
  .onPress(submit)
```

### Custom Styling

```tsx
Button('Custom')
  .variant('ghost')
  .p(6)
  .fontSize('18px')
  .fontWeight('bold')

```

## See Also

- [TextField](/components/interactive-inputs) - Text input component
- [Select](/components/interactive-all) - Dropdown selector
- [Checkbox](/components/interactive-all) - Checkbox input
