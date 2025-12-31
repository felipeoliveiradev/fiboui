<script setup>
import { Avatar } from '../../src/content/Avatar'
import { Box } from '../../src/structure/Box'

const renderSizes = () => 
  Box().display('flex').gap('16px').alignItems('center').children([
    Avatar().image('https://i.pravatar.cc/100').size(32).build(),
    Avatar().image('https://i.pravatar.cc/100').size(48).build(),
    Avatar().image('https://i.pravatar.cc/100').size(64).build(),
    Avatar().image('https://i.pravatar.cc/100').size(80).build()
  ]).build()

const renderShapes = () => 
  Box().display('flex').gap('16px').alignItems('center').children([
    Avatar().image('https://i.pravatar.cc/100').shape('circle').size(64).build(),
    Avatar().image('https://i.pravatar.cc/100').shape('rounded').size(64).build(),
    Avatar().image('https://i.pravatar.cc/100').shape('square').size(64).build()
  ]).build()

const renderStatus = () => 
  Box().display('flex').gap('16px').alignItems('center').children([
    Avatar().image('https://i.pravatar.cc/100').status('online').size(64).build(),
    Avatar().image('https://i.pravatar.cc/100').status('offline').size(64).build(),
    Avatar().image('https://i.pravatar.cc/100').status('busy').size(64).build()
  ]).build()

const renderBordered = () => 
  Avatar()
    .image('https://i.pravatar.cc/100')
    .size(64)
    .border('3px solid #3B82F6')
    .build()
</script>

# Avatar

A component for displaying user profile images with various shapes, sizes, and status indicators.

`Avatar` provides a flexible way to display user images with consistent styling, optional status badges, and customizable shapes.

## Live Examples

### Sizes

<ReactWrapper :component="renderSizes" />

::: details View Source
```tsx
Box().display('flex').gap('16px').alignItems('center').children([
  Avatar().image('https://i.pravatar.cc/100').size(32).build(),
  Avatar().image('https://i.pravatar.cc/100').size(48).build(),
  Avatar().image('https://i.pravatar.cc/100').size(64).build(),
  Avatar().image('https://i.pravatar.cc/100').size(80).build()
]).build()
```
:::

### Shapes

<ReactWrapper :component="renderShapes" />

::: details View Source
```tsx
Box().display('flex').gap('16px').alignItems('center').children([
  Avatar().image('https://i.pravatar.cc/100').shape('circle').size(64).build(),
  Avatar().image('https://i.pravatar.cc/100').shape('rounded').size(64).build(),
  Avatar().image('https://i.pravatar.cc/100').shape('square').size(64).build()
]).build()
```
:::

### Status Indicators

<ReactWrapper :component="renderStatus" />

::: details View Source
```tsx
Box().display('flex').gap('16px').alignItems('center').children([
  Avatar().image('https://i.pravatar.cc/100').status('online').size(64).build(),
  Avatar().image('https://i.pravatar.cc/100').status('offline').size(64).build(),
  Avatar().image('https://i.pravatar.cc/100').status('busy').size(64).build()
]).build()
```
:::

### With Border

<ReactWrapper :component="renderBordered" />

::: details View Source
```tsx
Avatar()
  .image('https://i.pravatar.cc/100')
  .size(64)
  .border('3px solid #3B82F6')
  .build()
```
:::

## Constructor

```tsx
Avatar() → AvatarBuilder
```

Creates a new `Avatar` builder instance.

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.image(url)` | `string` | Sets the avatar image URL |

### Appearance

| Method | Type | Description |
| :--- | :--- | :--- |
| `.size(size)` | `string \| number` | Sets avatar size (px or CSS value) |
| `.shape(shape)` | `'circle' \| 'rounded' \| 'square'` | Sets avatar shape |
| `.border(border)` | `string` | Sets border style (CSS border value) |
| `.status(status)` | `'none' \| 'online' \| 'offline' \| 'busy'` | Shows status indicator badge |

### Inherited from FiboBuilder

`Avatar` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete builder API reference.

## Usage Examples

### User Profile

```tsx
Avatar()
  .image('/user-profile.jpg')
  .size(96)
  .shape('circle')
  .status('online')
  .build()
```

### Team Member

```tsx
Avatar()
  .image('/team-member.jpg')
  .size(48)
  .shape('rounded')
  .border('2px solid #E5E7EB')
  .build()
```

## See Also

- [Badge](/components/content-all) - Status badges
- [Box](/components/structure-box) - Layout container
- [Text](/components/content-text) - Typography
