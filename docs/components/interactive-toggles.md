<script setup>
import { Checkbox } from '../../src/interactive/Checkbox'
import { Switch } from '../../src/interactive/Switch'
import { Box } from '../../src/structure/Box'

const renderCheckboxes = () => 
  Box().display('flex').flexDirection('column').gap('12px').children([
    Checkbox().label('Unchecked').checked(false).onChange(() => {}).build(),
    Checkbox().label('Checked').checked(true).onChange(() => {}).build(),
    Checkbox().label('Indeterminate').checked(false).indeterminate(true).onChange(() => {}).build(),
    Checkbox().label('Disabled').checked(false).disabled(true).build()
  ]).build()

const renderSwitches = () => 
  Box().display('flex').flexDirection('column').gap('12px').children([
    Switch().label('Off').checked(false).onChange(() => {}).build(),
    Switch().label('On').checked(true).onChange(() => {}).build(),
    Switch().label('Disabled').checked(false).disabled(true).build()
  ]).build()
</script>

# Checkbox & Switch

Toggle controls for binary choices and settings.

These components provide accessible, interactive controls for boolean states with smooth animations and clear visual feedback.

## Checkbox

### Live Examples

<ReactWrapper :component="renderCheckboxes" />

::: details View Source
```tsx
const [checked, setChecked] = useState(false)

Box().display('flex').flexDirection('column').gap('12px').children([
  Checkbox().label('Unchecked').checked(checked).onChange(setChecked).build(),
  Checkbox().label('Checked').checked(true).build(),
  Checkbox().label('Indeterminate').indeterminate(true).build(),
  Checkbox().label('Disabled').checked(false).disabled(true).build()
]).build()
```
:::

### Constructor

```tsx
Checkbox() → CheckboxBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.checked(value)` | `boolean` | Checked state |
| `.onChange(handler)` | `(checked: boolean) => void` | Change event handler |
| `.label(text)` | `string` | Optional label text |
| `.disabled(disabled)` | `boolean` | Disabled state |
| `.indeterminate(value)` | `boolean` | Indeterminate state (dash icon) |

---

## Switch

### Live Examples

<ReactWrapper :component="renderSwitches" />

::: details View Source
```tsx
const [enabled, setEnabled] = useState(false)

Box().display('flex').flexDirection('column').gap('12px').children([
  Switch().label('Off').checked(enabled).onChange(setEnabled).build(),
  Switch().label('On').checked(true).build(),
  Switch().label('Disabled').checked(false).disabled(true).build()
]).build()
```
:::

### Constructor

```tsx
Switch() → SwitchBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.checked(value)` | `boolean` | Toggle state |
| `.onChange(handler)` | `(checked: boolean) => void` | Change event handler |
| `.label(text)` | `string` | Optional label text |
| `.disabled(disabled)` | `boolean` | Disabled state |

## Usage Examples

### Form with Checkboxes

```tsx
Box().display('flex').flexDirection('column').gap('8px').children([
  Checkbox().label('Accept terms and conditions').checked(accepted).onChange(setAccepted).build(),
  Checkbox().label('Subscribe to newsletter').checked(subscribed).onChange(setSubscribed).build()
]).build()
```

### Settings with Switches

```tsx
Box().display('flex').flexDirection('column').gap('12px').children([
  Switch().label('Enable notifications').checked(notifications).onChange(setNotifications).build(),
  Switch().label('Dark mode').checked(darkMode).onChange(setDarkMode).build()
]).build()
```

## See Also

- [Button](/components/interactive-button) - Action buttons
- [TextField](/components/interactive-inputs) - Text inputs
- [RadioGroup](/components/interactive-all) - Radio buttons
