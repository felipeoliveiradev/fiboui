<script setup>
import { Alert } from '../../src/content/Alert'
import { Box } from '../../src/structure/Box'

const renderIntents = () =>
  Box().display('flex').flexDirection('column').gap('16px').children([
    Alert().title('Information').description('This is an informational message.').intent('info'),
    Alert().title('Success').description('Your action completed successfully.').intent('success'),
    Alert().title('Warning').description('Please review this carefully.').intent('warning'),
    Alert().title('Error').description('An error occurred. Please try again.').intent('error')
  ])
</script>

# Alert

Prominent notification messages for important information.

`Alert` displays contextual feedback messages with vibrant colors, icons, and decorative elements to grab user attention.

## Live Examples

### Alert Intents

<ReactWrapper :component="renderIntents" />

::: details View Source
```tsx
Box().display('flex').flexDirection('column').gap('16px').children([
  Alert().title('Information').description('This is an informational message.').intent('info'),
  Alert().title('Success').description('Your action completed successfully.').intent('success'),
  Alert().title('Warning').description('Please review this carefully.').intent('warning'),
  Alert().title('Error').description('An error occurred. Please try again.').intent('error')
])
```
:::

## Constructor

```tsx
Alert() → AlertBuilder
```

## Properties

### Content

| Method | Type | Description |
| :--- | :--- | :--- |
| `.title(text)` | `string` | Alert title/heading |
| `.description(text)` | `string` | Optional detailed message |

### Appearance

| Method | Type | Description |
| :--- | :--- | :--- |
| `.intent(intent)` | `'info' \| 'success' \| 'warning' \| 'error'` | Alert severity/type |

### Inherited from FiboBuilder

`Alert` inherits all layout and styling methods from `FiboBuilder`. See [Box](/components/structure-box) for complete API reference.

## Usage Examples

### Simple Alert

```tsx
Alert()
  .title('Welcome!')
  .description('Thanks for joining our platform.')
  .intent('success')

```

### Error Alert

```tsx
Alert()
  .title('Authentication Failed')
  .description('Invalid credentials. Please check your email and password.')
  .intent('error')

```

## See Also

- [Badge](/components/content-badge) - Status badges
- [Text](/components/content-text) - Typography
- [Box](/components/structure-box) - Layout container
