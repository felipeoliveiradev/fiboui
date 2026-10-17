<script setup>
import { Select } from '../../src/interactive/Select'
import { Textarea } from '../../src/interactive/Textarea'
import { Box } from '../../src/structure/Box'

const renderSelect = () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' }
  ]

  return Select()
    .label('Choose an option')
    .options(options)
    .value('2')
    .onChange(() => {})
    .maxWidth('400px')

}

const renderTextarea = () =>
  Textarea()
    .label('Description')
    .placeholder('Enter your description...')
    .rows(4)
    .value('Sample text content...')
    .onChange(() => {})
    .maxWidth('400px')

</script>

# Select & Textarea

Advanced input components for selections and multi-line text.

## Select

Dropdown selector with single or multiple selection support. Uncontrolled by default. `.name()` writes hidden input(s) for `Form` / `FormData`. Multi-select is one hidden per value (same `name`) → `string[]`, not a comma string. Use `.controlled(true)` when parent state must win.

<ReactWrapper :component="renderSelect" />

::: details View Source
```tsx
const [value, setValue] = useState('')
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' }
]

Select()
  .label('Choose an option')
  .options(options)
  .value(value)
  .onChange(setValue)

```
:::

### Constructor

```tsx
Select() → SelectBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string \| string[]` | Initial selection. Uncontrolled unless `.controlled(true)`. |
| `.options(options)` | `Array<{label, value}>` | Available options |
| `.onChange(handler)` | `(value) => void` | Change event handler |
| `.label(text)` | `string` | Optional label |
| `.placeholder(text)` | `string` | Placeholder text |
| `.name(name)` | `string` | Hidden input(s) for `Form` / `FormData`. Multi-select: one hidden per selected value |
| `.controlled(on)` | `boolean` | `true` keeps React `value` and re-renders on each change |
| `.rules(...rules)` | `FieldRule[]` | Checks collected on submit. See [Form](/components/interactive-form). |
| `.multiple(enabled)` | `boolean` | Enable multiple selection |
| `.disabled(disabled)` | `boolean` | Disabled state |
| `.error(message)` | `string` | Error message |

---

## Textarea

Multi-line text input with resize control. Uncontrolled by default (`defaultValue`). `.name()` participates in `Form` / `FormData`. Use `.controlled(true)` when parent state must win.

<ReactWrapper :component="renderTextarea" />

::: details View Source
```tsx
const [value, setValue] = useState('')

Textarea()
  .label('Description')
  .placeholder('Enter your description...')
  .rows(4)
  .value(value)
  .onChange(setValue)

```
:::

### Constructor

```tsx
Textarea() → TextareaBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string` | Initial value (`defaultValue`). Uncontrolled unless `.controlled(true)`. |
| `.onChange(handler)` | `(value: string) => void` | Change event handler |
| `.label(text)` | `string` | Optional label |
| `.placeholder(text)` | `string` | Placeholder text |
| `.name(name)` | `string` | Name used by `Form` / `FormData` |
| `.controlled(on)` | `boolean` | `true` keeps React `value` and re-renders on each change |
| `.rules(...rules)` | `FieldRule[]` | Checks collected on submit. See [Form](/components/interactive-form). |
| `.rows(count)` | `number` | Number of visible rows |
| `.resize(mode)` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | Resize behavior |
| `.disabled(disabled)` | `boolean` | Disabled state |
| `.error(message)` | `string` | Error message |

## Usage Examples

### Multi-Select

```tsx
Select()
  .label('Select tags')
  .options(tagOptions)
  .multiple(true)
  .value(selectedTags)
  .onChange(setSelectedTags)

```

### Auto-Resize Textarea

```tsx
Textarea()
  .label('Comments')
  .rows(3)
  .resize('vertical')
  .value(comments)
  .onChange(setComments)

```

## See Also

- [TextField](/components/interactive-inputs) - Single-line text input
- [Checkbox & Switch](/components/interactive-toggles) - Toggle controls
- [Button](/components/interactive-button) - Action buttons
