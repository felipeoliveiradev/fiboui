<script setup>
import { Box } from '../../src/structure/Box'
import { Button } from '../../src/interactive/Button'

const renderVariants = () =>
  Box().flex().gap(4).flexWrap('wrap').children([
    Button('Filled').variant('filled'),
    Button('Outlined').variant('outlined'),
    Button('Ghost').variant('ghost'),
    Button('Soft').variant('soft'),
    Button('Text').variant('text')
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
    Button('Pill').shape('pill')
  ])
</script>

# Button

An interactive button component with multiple variants, sizes, and states.

`Button` is a fundamental interactive element that handles user clicks and actions. It supports various visual styles and can be disabled when needed. There is no built-in spinner state — disable the control while a request is in flight.

## Live Examples

### Variants

<ReactWrapper :component="renderVariants" />

::: details View Source
```tsx
Box().flex().gap(4).flexWrap('wrap').children([
  Button('Filled').variant('filled'),
  Button('Outlined').variant('outlined'),
  Button('Ghost').variant('ghost'),
  Button('Soft').variant('soft'),
  Button('Text').variant('text')
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
  Button('Pill').shape('pill')
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
| `.variant(variant)` | `'elevated' \| 'filled' \| 'outlined' \| 'text' \| 'ghost' \| 'soft' \| 'outline' \| 'solid' \| 'raw'` | Visual style. `'primary'` is an alias of `'filled'`. Default is `'elevated'`. |
| `.size(size)` | `'xs' \| 'sm' \| 'md' \| 'lg'` | Sets the button size |
| `.shape(shape)` | `'default' \| 'pill' \| 'square' \| 'rect' \| 'rounded' \| 'sharp'` | Corner style. `.shape('pill')` is fully rounded. |

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.text(text)` | `string` | Sets the button text |
| `.icon(icon)` | `ReactNode` | Sets a leading icon |

### State

| Method | Type | Description |
| :--- | :--- | :--- |
| `.disabled(disabled)` | `boolean` | Disables the button |

### Events

| Method | Type | Description |
| :--- | :--- | :--- |
| `.onPress(handler)` | `() => void` | Press / click handler (preferred) |
| `.onClick(handler)` | `(event: MouseEvent) => void` | Raw DOM click handler |
| `.onHover(handler)` | `() => void` | `mouseenter` handler (does not receive the event) |
| `.type(type)` | `'button' \| 'submit' \| 'reset'` | HTML `type` on the `<button>`. |
| `.submit()` | — | `type="submit"`. Use this inside [Form](/components/interactive-form). |
| `.reset()` | — | `type="reset"` |
| `.htmlType(type)` | `'button' \| 'submit' \| 'reset'` | Same write as `.type()`. |

### Inherited from FiboBuilder

`Button` inherits all layout and styling methods from `FiboBuilder`:

- Layout: `.flex()`, `.flexDirection()`, `.alignItems()`, `.justifyContent()`
- Spacing: `.p()`, `.m()`, `.px()`, `.py()`, `.mx()`, `.my()`
- Sizing: `.width()`, `.height()`, `.minWidth()`, `.maxWidth()`
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

### Disabled while in-flight

Button has no built-in spinner state. Disable the control (and swap the label if you want a spinner elsewhere):

```tsx
Button(isLoading ? 'Submitting…' : 'Submit')
  .disabled(isLoading)
  .onPress(handleSubmit)
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
