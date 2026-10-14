<script setup>
import { Box } from '../../src/structure/Box'
import { TextField } from '../../src/interactive/TextField'

const renderBasic = () =>
  Box().flex().col().gap(4).maxW('400px').children([
    TextField()
      .label('Username')
      .placeholder('Enter your username')
      ,
    TextField()
      .label('Email')
      .type('email')
      .placeholder('you@example.com')

  ])

const renderPassword = () =>
  TextField()
    .label('Password')
    .type('password')
    .placeholder('Enter password')
    .maxW('400px')


const renderMasked = () =>
  Box().flex().col().gap(4).maxW('400px').children([
    TextField()
      .label('Phone')
      .mask('(999) 999-9999')
      .placeholder('(555) 123-4567')
      ,
    TextField()
      .label('CPF')
      .mask('999.999.999-99')
      .placeholder('123.456.789-00')

  ])

const renderError = () =>
  TextField()
    .label('Email')
    .type('email')
    .error('Invalid email address')
    .maxW('400px')

</script>

# TextField

A text input component with label, validation, masking, and password toggle support.

`TextField` provides a fully-featured input experience with floating labels, error states, input masking for formats like phone numbers, and built-in password visibility toggle.

## Live Examples

### Basic Inputs

<ReactWrapper :component="renderBasic" />

::: details View Source
```tsx
Box().flex().col().gap(4).maxW('400px').children([
  TextField()
    .label('Username')
    .placeholder('Enter your username')
    ,
  TextField()
    .label('Email')
    .type('email')
    .placeholder('you@example.com')

])
```
:::

### Password Input

<ReactWrapper :component="renderPassword" />

::: details View Source
```tsx
TextField()
  .label('Password')
  .type('password')
  .placeholder('Enter password')

```
:::

### Masked Inputs

<ReactWrapper :component="renderMasked" />

::: details View Source
```tsx
Box().flex().col().gap(4).maxW('400px').children([
  TextField()
    .label('Phone')
    .mask('(999) 999-9999')
    .placeholder('(555) 123-4567')
    ,
  TextField()
    .label('CPF')
    .mask('999.999.999-99')
    .placeholder('123.456.789-00')

])
```
:::

### Error State

<ReactWrapper :component="renderError" />

::: details View Source
```tsx
TextField()
  .label('Email')
  .type('email')
  .error('Invalid email address')

```
:::

## Constructor

```tsx
TextField(value?: string) → TextFieldBuilder
```

Creates a new `TextField` builder instance.

**Parameters:**
- `value` (optional): Initial input value

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string` | Sets the input value |
| `.label(text)` | `string` | Sets the floating label text |
| `.placeholder(text)` | `string` | Sets the placeholder text |

### Input Type

| Method | Type | Description |
| :--- | :--- | :--- |
| `.type(type)` | `'text' \| 'password' \| 'email' \| 'number' \| 'tel'` | Sets the input type |
| `.mask(format)` | `string` | Sets input mask (use `9` for digits) |

### State

| Method | Type | Description |
| :--- | :--- | :--- |
| `.disabled(disabled)` | `boolean` | Disables the input |
| `.error(message)` | `string` | Shows error message below input |

### Events

| Method | Type | Description |
| :--- | :--- | :--- |
| `.onChange(handler)` | `(value: string) => void` | Value change handler |

### Inherited from FiboBuilder

`TextField` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete API reference.

## Masking

The `.mask()` method accepts a format string where `9` represents a digit placeholder:

```tsx
// Phone: (555) 123-4567
TextField().mask('(999) 999-9999')

// CPF: 123.456.789-00
TextField().mask('999.999.999-99')

// Credit Card: 1234 5678 9012 3456
TextField().mask('9999 9999 9999 9999')
```

## Password Toggle

When `type('password')` is set, a visibility toggle button automatically appears in the input, allowing users to show/hide the password.

## See Also

- [Textarea](/components/interactive-all) - Multi-line text input
- [Select](/components/interactive-all) - Dropdown selector
- [Button](/components/interactive-button) - Action button
