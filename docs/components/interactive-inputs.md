<script setup>
import { Box } from '../../src/structure/Box'
import { TextField } from '../../src/interactive/TextField'

const renderBasic = () =>
  Box().flex().flexDirection('column').gap(4).maxWidth('400px').children([
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
    .maxWidth('400px')


const renderMasked = () =>
  Box().flex().flexDirection('column').gap(4).maxWidth('400px').children([
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
    .maxWidth('400px')

</script>

# TextField

A text input component with label, validation, masking, and password toggle support.

`TextField` provides a fully-featured input experience with floating labels, error states, input masking for formats like phone numbers, and built-in password visibility toggle.

## Live Examples

### Basic Inputs

<ReactWrapper :component="renderBasic" />

::: details View Source
```tsx
Box().flex().flexDirection('column').gap(4).maxWidth('400px').children([
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
Box().flex().flexDirection('column').gap(4).maxWidth('400px').children([
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
- `value` (optional): Initial value, written as `defaultValue`. The field is uncontrolled, so typing does not re-render React.

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string \| Signal<string>` | Initial value (`defaultValue`). A signal patches the DOM input and does not call `setState`. |
| `.label(text)` | `string` | Floating label. `$length` / `interp` markers stay live (same as `Text`). |
| `.placeholder(text)` | `string` | Sets the placeholder text |
| `.name(name)` | `string` | Name used by `Form` / `FormData` |
| `.helper(text)` | `string` | `.fibo-field-helper` under the field (`id` `fibo-help-{name}`). Hidden when an error is showing; `aria-describedby` points at the error then. |
| `.clearable(on?)` / `.clear(true)` | `boolean` | `type="button"` Clear control (`aria-label="Clear"`) when there is a value. Hidden when empty or disabled. Alias: `.clear(true)`. |
| `.rules(...rules)` | `FieldRule[]` | Checks collected on submit and on blur. See [Form](/components/interactive-form). |

### Input Type

| Method | Type | Description |
| :--- | :--- | :--- |
| `.type(type)` | `'text' \| 'password' \| 'email' \| 'number' \| 'tel'` | DOM input type. `TextField().type('email')` writes `type="email"`. |
| `.mask(format)` | `string` | Mask written straight onto the input (`9` = digit) |

### State

| Method | Type | Description |
| :--- | :--- | :--- |
| `.disabled(disabled)` | `boolean` | Disables the input |
| `.error(message)` | `string` | Static error line under the input |
| `.controlled(on)` | `boolean` | `true` keeps React `value` and re-renders on each change |

### Events

| Method | Type | Description |
| :--- | :--- | :--- |
| `.onChange(handler)` | `(value: string) => void` | Called on input. Does not by itself re-render the field. |
| `.onCommit(handler)` | `(value: string) => void` | Called on blur |

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

## Helper and clear

```tsx
TextField()
  .label('Search')
  .helper('At least 2 characters')
  .clearable()
  .name('q')
```

`.helper()` is not an error. Form validation still paints `.error()` / the field error line and hides the helper. `.clearable()` writes `''`, fires `onChange('')`, and patches a bound signal. The button is `type="button"` so it does not submit. `.clear(true)` is the same write.

## See Also

- [Textarea](/components/interactive-all) - Multi-line text input
- [Select](/components/interactive-all) - Dropdown selector
- [Button](/components/interactive-button) - Action button
