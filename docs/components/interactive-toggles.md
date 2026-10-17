<script setup>
import { Checkbox } from '../../src/interactive/Checkbox'
import { Switch } from '../../src/interactive/Switch'
import { Box } from '../../src/structure/Box'

const renderCheckboxes = () =>
  Box().display('flex').flexDirection('column').gap('12px').children([
    Checkbox().label('Unchecked').checked(false).onChange(() => {}),
    Checkbox().label('Checked').checked(true).onChange(() => {}),
    Checkbox().label('Indeterminate').checked(false).indeterminate(true).onChange(() => {}),
    Checkbox().label('Disabled').checked(false).disabled(true)
  ])

const renderSwitches = () =>
  Box().display('flex').flexDirection('column').gap('12px').children([
    Switch().label('Off').checked(false).onChange(() => {}),
    Switch().label('On').checked(true).onChange(() => {}),
    Switch().label('Disabled').checked(false).disabled(true)
  ])
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
  Checkbox().label('Unchecked').checked(checked).onChange(setChecked),
  Checkbox().label('Checked').checked(true),
  Checkbox().label('Indeterminate').indeterminate(true),
  Checkbox().label('Disabled').checked(false).disabled(true)
])
```
:::

### Constructor

```tsx
Checkbox() → CheckboxBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.checked(value)` | `boolean` | Initial checked state (`defaultChecked`). Uncontrolled unless `.controlled(true)`. |
| `.onChange(handler)` | `(checked: boolean) => void` | Change event handler |
| `.label(text)` | `string` | Optional label text |
| `.name(name)` | `string` | Name used by `Form` / `FormData` (checked value defaults to `'on'`) |
| `.controlled(on)` | `boolean` | `true` keeps React `checked` and re-renders on each change |
| `.rules(...rules)` | `FieldRule[]` | Checks collected on submit. See [Form](/components/interactive-form). |
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
  Switch().label('Off').checked(enabled).onChange(setEnabled),
  Switch().label('On').checked(true),
  Switch().label('Disabled').checked(false).disabled(true)
])
```
:::

### Constructor

```tsx
Switch() → SwitchBuilder
```

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.checked(value)` | `boolean` | Initial toggle state (`defaultChecked`). Uncontrolled unless `.controlled(true)`. |
| `.onChange(handler)` | `(checked: boolean) => void` | Change event handler |
| `.label(text)` | `string` | Optional label text |
| `.name(name)` | `string` | Name used by `Form` / `FormData` (checked value defaults to `'on'`) |
| `.controlled(on)` | `boolean` | `true` keeps React `checked` and re-renders on each change |
| `.rules(...rules)` | `FieldRule[]` | Checks collected on submit. See [Form](/components/interactive-form). |
| `.disabled(disabled)` | `boolean` | Disabled state |

## Usage Examples

Drive the parent with `.controlled(true)` plus `.checked(state).onChange(setState)`. Without that, `.checked()` is only the initial `defaultChecked`.

### Form with Checkboxes

```tsx
Box().display('flex').flexDirection('column').gap('8px').children([
  Checkbox().label('Accept terms and conditions').checked(accepted).onChange(setAccepted),
  Checkbox().label('Subscribe to newsletter').checked(subscribed).onChange(setSubscribed)
])
```

### Settings with Switches

```tsx
Box().display('flex').flexDirection('column').gap('12px').children([
  Switch().label('Enable notifications').checked(notifications).onChange(setNotifications),
  Switch().label('Dark mode').checked(darkMode).onChange(setDarkMode)
])
```

## See Also

- [Button](/components/interactive-button) - Action buttons
- [TextField](/components/interactive-inputs) - Text inputs
- [RadioGroup](/components/interactive-all) - Radio buttons
