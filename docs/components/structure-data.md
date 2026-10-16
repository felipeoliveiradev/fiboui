<script setup>
import { List } from '../../src/structure/List'
import { Table } from '../../src/structure/Table'
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderList = () => {
  const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4']

  return List()
    .items(items)
    .variant('card')
    .renderItem((item) => Text(item).variant('body'))
    .maxWidth('400px')

}

const renderTable = () => {
  const data = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'User' }
  ]

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role', align: 'right' }
  ]

  return Table()
    .data(data)
    .columns(columns)
    .variant('clean')
    .striped(true)

}
</script>

# List & Table

Components for displaying collections of data.

## List

Flexible list component with variants and infinite scroll support.

<ReactWrapper :component="renderList" />

::: details View Source
```tsx
const items = ['Item 1', 'Item 2', 'Item 3', 'Item 4']

List()
  .items(items)
  .variant('card')
  .renderItem((item) => Text(item).variant('body'))

```
:::

### Constructor

```tsx
List() → ListBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.items(items)` | `T[]` or `listSignal` | Rows. A list signal is subscribed (that signal only) and read on each rebuild. Data mode needs `.renderItem`. |
| `.renderItem(fn)` | `(item, index) => ReactNode` | Render function for each item. Row key prefers `_id`. |
| `.variant(variant)` | `'default' \| 'card' \| 'floating'` | Visual style |
| `.itemStyle(fn \| css)` | callback or style object | Row chrome. The callback is a CSS fluent proxy (`paddingHorizontal`, `boxShadow(0)` → `none`). |
| `.itemHover(fn)` / `.itemActive(fn)` / `.itemFocus(fn)` | callback | Pseudo styles, injected with `!important`. One shared stylesheet for every list on the page. |
| `.separator(show)` | `boolean` | Separators on the default variant only, and only when item styles were not reset |
| `.onEndReached(handler)` | `() => void` | Infinite scroll callback |
| `.loading(isLoading)` | `boolean` | Spinner inside the infinite-scroll sentinel. It does not paint a loader by itself. |

---

## Table

Data table with sorting, variants, and density control.

<ReactWrapper :component="renderTable" />

::: details View Source
```tsx
const data = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
]

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Role', accessor: 'role', align: 'right' }
]

Table()
  .data(data)
  .columns(columns)
  .variant('clean')
  .striped(true)

```
:::

### Constructor

```tsx
Table() → TableBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.data(items)` | `T[]` | Array of data rows |
| `.columns(cols)` | `TableColumn[]` | Column definitions |
| `.variant(variant)` | `'default' \| 'clean'` | Visual style |
| `.density(density)` | `'compact' \| 'standard' \| 'relaxed'` | Row spacing |
| `.striped(enabled)` | `boolean` | Alternating row colors |
| `.width(value)` | `string \| number` | Table width |

### Column Definition

```typescript
interface TableColumn<T> {
  header: string
  accessor?: keyof T
  render?: (item: T) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}
```

## Usage Examples

### Custom List Items

```tsx
List()
  .items(users)
  .variant('card')
  .renderItem((user) =>
    Box().display('flex').alignItems('center').gap('12px').children([
      Avatar().image(user.avatar).size(40),
      Text(user.name).variant('body')
    ])
  )

```

### Table with Custom Cells

```tsx
Table()
  .data(products)
  .columns([
    { header: 'Product', accessor: 'name' },
    {
      header: 'Price',
      render: (item) => Text(`$${item.price}`).fontWeight('600')
    },
    { header: 'Stock', accessor: 'stock', align: 'right' }
  ])
  .density('relaxed')

```

## See Also

- [Grid](/components/structure-grid) - Grid layout
- [Card](/components/structure-card) - Card container
- [Box](/components/structure-box) - Layout primitive
