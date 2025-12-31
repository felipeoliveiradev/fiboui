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
    .build()
}

const renderTextarea = () => 
  Textarea()
    .label('Description')
    .placeholder('Enter your description...')
    .rows(4)
    .value('Sample text content...')
    .onChange(() => {})
    .maxWidth('400px')
    .build()
</script>

# Select & Textarea

Advanced input components for selections and multi-line text.

## Select

Dropdown selector with single or multiple selection support.

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
  .build()
```
:::

### Constructor

```tsx
Select() → SelectBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string \| string[]` | Selected value(s) |
| `.options(options)` | `Array<{label, value}>` | Available options |
| `.onChange(handler)` | `(value) => void` | Change event handler |
| `.label(text)` | `string` | Optional label |
| `.placeholder(text)` | `string` | Placeholder text |
| `.multiple(enabled)` | `boolean` | Enable multiple selection |
| `.disabled(disabled)` | `boolean` | Disabled state |
| `.error(message)` | `string` | Error message |

---

## Textarea

Multi-line text input with resize control.

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
  .build()
```
:::

### Constructor

```tsx
Textarea() → TextareaBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string` | Text content |
| `.onChange(handler)` | `(value: string) => void` | Change event handler |
| `.label(text)` | `string` | Optional label |
| `.placeholder(text)` | `string` | Placeholder text |
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
  .build()
```

### Auto-Resize Textarea

```tsx
Textarea()
  .label('Comments')
  .rows(3)
  .resize('vertical')
  .value(comments)
  .onChange(setComments)
  .build()
```

## See Also

- [TextField](/components/interactive-inputs) - Single-line text input
- [Checkbox & Switch](/components/interactive-toggles) - Toggle controls
- [Button](/components/interactive-button) - Action buttons
