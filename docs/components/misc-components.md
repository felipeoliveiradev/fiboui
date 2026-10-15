<script setup>
import { Tags } from '../../src/structure/Tags'
import { Banner } from '../../src/structure/Banner'
import { Collapse } from '../../src/structure/Collapse'
import { Box } from '../../src/structure/Box'

const renderTags = () => {
  const tags = [
    { title: 'React' },
    { title: 'TypeScript' },
    { title: 'Vite' },
    { title: 'TailwindCSS' }
  ]

  return Tags()
    .items(tags)

}

const renderBanner = () =>
  Box().display('flex').flexDirection('column').gap('12px').children([
    Banner('Info Banner').status('info').subtitle('This is an informational message.'),
    Banner('Success Banner').status('success').subtitle('Operation completed successfully.'),
    Banner('Warning Banner').status('warning').subtitle('Please review this carefully.'),
    Banner('Error Banner').status('error').subtitle('An error occurred.')
  ])

const renderCollapse = () =>
  Collapse()
    .title('Click to expand')
    .isOpen(true)
    .onToggle(() => {})
    .children('This is the collapsible content that can be shown or hidden.')

</script>

# Miscellaneous Components

Additional structure and display components.

## Tags

Display a collection of tags or labels.

<ReactWrapper :component="renderTags" />

::: details View Source
```tsx
const tags = [
  { title: 'React' },
  { title: 'TypeScript' },
  { title: 'Vite' },
  { title: 'TailwindCSS' }
]

Tags()
  .items(tags)

```
:::

### Constructor

```tsx
Tags() → TagsBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.items(items)` | `Array<{title}>` | Tag items to display |

---

## Banner

Status banner for announcements and notifications.

<ReactWrapper :component="renderBanner" />

::: details View Source
```tsx
Box().display('flex').flexDirection('column').gap('12px').children([
  Banner('Info Banner').status('info').subtitle('This is an informational message.'),
  Banner('Success Banner').status('success').subtitle('Operation completed successfully.'),
  Banner('Warning Banner').status('warning').subtitle('Please review this carefully.'),
  Banner('Error Banner').status('error').subtitle('An error occurred.')
])
```
:::

### Constructor

```tsx
Banner(title?) → BannerBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.title(text)` | `string` | Banner title |
| `.subtitle(text)` | `string` | Optional subtitle |
| `.status(status)` | `'info' \| 'success' \| 'warning' \| 'error'` | Banner intent/status |

---

## Collapse

Collapsible content panel with toggle.

<ReactWrapper :component="renderCollapse" />

::: details View Source
```tsx
const [isOpen, setIsOpen] = useState(false)

Collapse()
  .title('Click to expand')
  .isOpen(isOpen)
  .onToggle(() => setIsOpen(!isOpen))
  .children('This is the collapsible content.')

```
:::

### Constructor

```tsx
Collapse() → CollapseBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.title(text)` | `string` | Collapse header text |
| `.isOpen(open)` | `boolean` | Expanded state |
| `.onToggle(handler)` | `() => void` | Toggle handler |
| `.children(content)` | `ReactNode` | Collapsible content |

## Usage Examples

### Tag Cloud

```tsx
Tags()
  .items([
    { title: 'JavaScript' },
    { title: 'Python' },
    { title: 'Go' },
    { title: 'Rust' }
  ])
  .gap('8px')

```

### Notification Banner

```tsx
Banner('System Update')
  .status('warning')
  .subtitle('Scheduled maintenance on Dec 31, 2024')
  .padding('16px')

```

### FAQ Accordion

```tsx
Box().display('flex').flexDirection('column').gap('8px').children([
  Collapse().title('What is FiboUI?').children('FiboUI is...'),
  Collapse().title('How do I install?').children('Run npm install...'),
  Collapse().title('Is it free?').children('Yes, it is open source.')
])
```

## See Also

- [Alert](/components/content-alert) - Alert messages
- [Badge](/components/content-badge) - Status badges
- [Card](/components/structure-card) - Card container
