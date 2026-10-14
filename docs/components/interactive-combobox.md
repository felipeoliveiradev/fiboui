<script setup>
import { Combobox } from '../../src/interactive/Combobox'
import { Box } from '../../src/structure/Box'

const renderCombobox = () => {
  const options = [
    { label: 'React', value: 'react' },
    { label: 'Vue', value: 'vue' },
    { label: 'Angular', value: 'angular' },
    { label: 'Svelte', value: 'svelte' }
  ]

  return Combobox()
    .label('Select framework')
    .options(options)
    .value('react')
    .onChange(() => {})
    .maxWidth('400px')

}

const renderMultiple = () => {
  const options = [
    { label: 'TypeScript', value: 'ts' },
    { label: 'JavaScript', value: 'js' },
    { label: 'Python', value: 'py' },
    { label: 'Go', value: 'go' }
  ]

  return Combobox()
    .label('Select languages')
    .options(options)
    .value(['ts', 'js'])
    .multiple(true)
    .onChange(() => {})
    .maxWidth('400px')

}
</script>

# Combobox

Searchable select with autocomplete and multi-select support.

`Combobox` combines a text input with a dropdown list, allowing users to search and select from options or add new ones.

## Live Examples

### Single Selection

<ReactWrapper :component="renderCombobox" />

::: details View Source
```tsx
const options = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' }
]

Combobox()
  .label('Select framework')
  .options(options)
  .value('react')
  .onChange(() => {})

```
:::

### Multiple Selection

<ReactWrapper :component="renderMultiple" />

::: details View Source
```tsx
Combobox()
  .label('Select languages')
  .options(options)
  .value(['ts', 'js'])
  .multiple(true)
  .onChange(() => {})

```
:::

## Constructor

```tsx
Combobox() → ComboboxBuilder
```

## Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string \| string[]` | Selected value(s) |
| `.options(options)` | `Array<{label, value}>` | Available options |
| `.onChange(handler)` | `(value) => void` | Change event handler |
| `.label(text)` | `string` | Optional label |
| `.placeholder(text)` | `string` | Placeholder text |
| `.multiple(enabled)` | `boolean` | Enable multiple selection |
| `.onAdd(handler)` | `(label: string) => void` | Handler for adding new options |
| `.disabled(disabled)` | `boolean` | Disabled state |
| `.error(message)` | `string` | Error message |

## Usage Examples

### With Add New Option

```tsx
Combobox()
  .label('Tags')
  .options(tagOptions)
  .value(selectedTags)
  .multiple(true)
  .onAdd((newTag) => {
    // Add new tag to options
    setTagOptions([...tagOptions, { label: newTag, value: newTag }])
  })

```

## See Also

- [Select](/components/interactive-advanced) - Simple dropdown
- [TextField](/components/interactive-inputs) - Text input
- [Checkbox](/components/interactive-toggles) - Multiple selection
