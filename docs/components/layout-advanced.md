<script setup>
import { Center } from '../../src/layout/Center'
import { Header } from '../../src/layout/Header'
import { Sidebar } from '../../src/layout/Sidebar'
import { ScrollView } from '../../src/layout/ScrollView'
import { Line } from '../../src/layout/Line'
import { Box } from '../../src/structure/Box'
import { Text } from '../../src/content/Text'

const renderCenter = () => {
  return Center()
    .width('300px')
    .height('150px')
    .backgroundColor('#F3F4F6')
    .borderRadius('8px')
    .children(
      Text('Centered Content').variant('h3')
    )

}

const renderHeader = () => {
  return Header()
    .height(64)
    .children(
      Text('Application Header').variant('h3')
    )

}

const renderSidebar = () => {
  return Sidebar()
    .width(260)
    .height('300px')
    .children(
      Box().padding('16px').children(
        Text('Sidebar Content').variant('body')
      )
    )

}

const renderScrollView = () => {
  const items = []
  for (let i = 0; i < 10; i++) {
    items.push(Text(`Item ${i + 1}`).variant('body').marginBottom('8px'))
  }

  return ScrollView()
    .vertical()
    .height('200px')
    .width('300px')
    .border('1px solid #E5E7EB')
    .borderRadius('8px')
    .padding('16px')
    .children(items)

}

const renderLine = () => {
  return Line()
    .sizeHeight('40px')
    .gap('12px')
    .children([
      Box().padding('8px').backgroundColor('#3B82F6').color('#FFF').children('Item 1'),
      Box().padding('8px').backgroundColor('#10B981').color('#FFF').children('Item 2'),
      Box().padding('8px').backgroundColor('#EF4444').color('#FFF').children('Item 3')
    ])

}
</script>

# Advanced Layout Components

Specialized layout components for app structure.

## Center

Centers content both horizontally and vertically.

<ReactWrapper :component="renderCenter" />

::: details View Source
```tsx
Center()
  .width('300px')
  .height('150px')
  .backgroundColor('#F3F4F6')
  .children(
    Text('Centered Content').variant('h3')
  )

```
:::

### Constructor

```tsx
Center() → CenterBuilder
```

---

## Header

Application header with sticky positioning support.

<ReactWrapper :component="renderHeader" />

::: details View Source
```tsx
Header()
  .height(64)
  .sticky(true)
  .children(
    Text('Application Header').variant('h3')
  )

```
:::

### Constructor

```tsx
Header() → HeaderBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.height(value)` | `number \| string` | Header height |
| `.sticky(enabled)` | `boolean` | Sticky positioning |

---

## Sidebar

Collapsible sidebar navigation.

<ReactWrapper :component="renderSidebar" />

::: details View Source
```tsx
Sidebar()
  .width(260)
  .children(
    Box().padding('16px').children(
      Text('Sidebar Content')
    )
  )

```
:::

### Constructor

```tsx
Sidebar() → SidebarBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.width(value)` | `number \| string` | Sidebar width |
| `.collapsible(collapsed)` | `boolean` | Collapsed state |

---

## ScrollView

Scrollable container with direction control.

<ReactWrapper :component="renderScrollView" />

::: details View Source
```tsx
ScrollView()
  .vertical()
  .height('200px')
  .children([
    Text('Item 1'),
    Text('Item 2'),
    // ... more items
  ])

```
:::

### Constructor

```tsx
ScrollView() → ScrollViewBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.direction(dir)` | `'vertical' \| 'horizontal' \| 'both'` | Scroll direction |
| `.vertical()` | - | Shorthand for vertical scroll |
| `.horizontal()` | - | Shorthand for horizontal scroll |
| `.scrollbar(visibility)` | `'hidden' \| 'visible' \| 'auto'` | Scrollbar visibility |

---

## Line

Flex row of children, or an `<hr>` separator when empty. `.direction('vertical')` paints a column rule. Not a `Row` alias (`mainAxisAlignment` / `spacing` live on `Row`).

<ReactWrapper :component="renderLine" />

::: details View Source
```tsx
Line()
  .sizeHeight('40px')
  .gap('12px')
  .children([
    Box().padding('8px').children('Item 1'),
    Box().padding('8px').children('Item 2')
  ])

```
:::

### Constructor

```tsx
Line() → LineBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.sizeHeight(value)` | `string` | Host height when the line has children |
| `.direction(dir)` | `'horizontal' \| 'vertical'` | Axis. Empty + `vertical` is a 1px column rule; empty + default is `<hr>` |

## Usage Examples

### App Layout

```tsx
Box().display('flex').height('100vh').children([
  Sidebar().width(260).children([...]),
  Box().flex('1').display('flex').flexDirection('column').children([
    Header().sticky(true).children([...]),
    ScrollView().vertical().flex('1').children([...])
  ])
])
```

## See Also

- [Row, Column, Container](/components/layout-primitives) - Basic layout
- [DashboardLayout](/components/layout-dashboard) - Complete layout template
- [Box](/components/structure-box) - Layout primitive
