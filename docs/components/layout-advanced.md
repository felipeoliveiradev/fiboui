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
      Text('Centered Content').variant('h3').build()
    )
    .build()
}

const renderHeader = () => {
  return Header()
    .height(64)
    .children(
      Text('Application Header').variant('h3').build()
    )
    .build()
}

const renderSidebar = () => {
  return Sidebar()
    .width(260)
    .height('300px')
    .children(
      Box().padding('16px').children(
        Text('Sidebar Content').variant('body').build()
      ).build()
    )
    .build()
}

const renderScrollView = () => {
  const items = []
  for (let i = 0; i < 10; i++) {
    items.push(Text(`Item ${i + 1}`).variant('body').marginBottom('8px').build())
  }
  
  return ScrollView()
    .vertical()
    .height('200px')
    .width('300px')
    .border('1px solid #E5E7EB')
    .borderRadius('8px')
    .padding('16px')
    .children(items)
    .build()
}

const renderLine = () => {
  return Line()
    .sizeHeight('40px')
    .gap('12px')
    .children([
      Box().padding('8px').backgroundColor('#3B82F6').color('#FFF').children('Item 1').build(),
      Box().padding('8px').backgroundColor('#10B981').color('#FFF').children('Item 2').build(),
      Box().padding('8px').backgroundColor('#EF4444').color('#FFF').children('Item 3').build()
    ])
    .build()
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
    Text('Centered Content').variant('h3').build()
  )
  .build()
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
    Text('Application Header').variant('h3').build()
  )
  .build()
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
      Text('Sidebar Content').build()
    ).build()
  )
  .build()
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
    Text('Item 1').build(),
    Text('Item 2').build(),
    // ... more items
  ])
  .build()
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

Horizontal flex container (alias for Row).

<ReactWrapper :component="renderLine" />

::: details View Source
```tsx
Line()
  .sizeHeight('40px')
  .gap('12px')
  .children([
    Box().padding('8px').children('Item 1').build(),
    Box().padding('8px').children('Item 2').build()
  ])
  .build()
```
:::

### Constructor

```tsx
Line() → LineBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.sizeHeight(value)` | `string` | Line height |

## Usage Examples

### App Layout

```tsx
Box().display('flex').height('100vh').children([
  Sidebar().width(260).children([...]).build(),
  Box().flex('1').display('flex').flexDirection('column').children([
    Header().sticky(true).children([...]).build(),
    ScrollView().vertical().flex('1').children([...]).build()
  ]).build()
]).build()
```

## See Also

- [Row, Column, Container](/components/layout-primitives) - Basic layout
- [DashboardLayout](/components/layout-dashboard) - Complete layout template
- [Box](/components/structure-box) - Layout primitive
