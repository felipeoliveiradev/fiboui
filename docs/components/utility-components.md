<script setup>
import { RadioGroup } from '../../src/interactive/RadioGroup'
import { Image } from '../../src/content/Image'
import { Label } from '../../src/content/Label'
import { Skeleton } from '../../src/content/Skeleton'
import { Box } from '../../src/structure/Box'

const renderRadioGroup = () => {
  const options = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ]

  return RadioGroup()
    .options(options)
    .value('option2')
    .onChange(() => {})

}

const renderImage = () =>
  Image('https://picsum.photos/400/300')
    .alt('Sample image')
    .clipShape('rounded')
    .frame({ width: 400, height: 300 })


const renderLabel = () =>
  Box().display('flex').flexDirection('column').gap('8px').children([
    Label('Email Address').required(true),
    Label('Optional Field')
  ])

const renderSkeleton = () =>
  Box().display('flex').flexDirection('column').gap('12px').children([
    Skeleton().width('100%').height('20px'),
    Skeleton().width('80%').height('20px'),
    Skeleton().width(64).height(64).shape('circle')
  ])
</script>

# Utility Components

Miscellaneous utility components for forms and content display.

## RadioGroup

Radio button group for single selection.

<ReactWrapper :component="renderRadioGroup" />

::: details View Source
```tsx
const [value, setValue] = useState('option1')
const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' }
]

RadioGroup()
  .options(options)
  .value(value)
  .onChange(setValue)

```
:::

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.value(value)` | `string` | Selected value |
| `.options(options)` | `Array<{label, value, disabled?}>` | Radio options |
| `.onChange(handler)` | `(value: string) => void` | Change handler |
| `.direction(dir)` | `'vertical' \| 'horizontal'` | Layout direction |

---

## Image

Image component with fit and clipping options.

<ReactWrapper :component="renderImage" />

::: details View Source
```tsx
Image('https://picsum.photos/400/300')
  .alt('Sample image')
  .clipShape('rounded')
  .frame({ width: 400, height: 300 })

```
:::

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.src(url)` | `string` | Image source URL |
| `.alt(text)` | `string` | Alt text |
| `.clipShape(shape)` | `'circle' \| 'rounded' \| 'square'` | Clipping shape |
| `.frame(dimensions)` | `{width, height}` | Fixed dimensions |
| `.scaledToFit()` | - | Fit image within bounds |
| `.scaledToFill()` | - | Fill bounds (crop if needed) |
| `.resizable()` | - | Make image responsive |

---

## Label

Form label with required indicator.

<ReactWrapper :component="renderLabel" />

::: details View Source
```tsx
Box().display('flex').flexDirection('column').gap('8px').children([
  Label('Email Address').required(true),
  Label('Optional Field')
])
```
:::

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.text(text)` | `string` | Label text |
| `.htmlFor(id)` | `string` | Associated input ID |
| `.required(required)` | `boolean` | Show required asterisk |

---

## Skeleton

Loading placeholder with pulse animation.

<ReactWrapper :component="renderSkeleton" />

::: details View Source
```tsx
Box().display('flex').flexDirection('column').gap('12px').children([
  Skeleton().width('100%').height('20px'),
  Skeleton().width('80%').height('20px'),
  Skeleton().width(64).height(64).shape('circle')
])
```
:::

### Properties

| Method | Type | Description |
| :--- | :--- | :--- |
| `.width(value)` | `string \| number` | Skeleton width |
| `.height(value)` | `string \| number` | Skeleton height |
| `.shape(shape)` | `'circle' \| 'square' \| 'rounded' \| 'rounded-sm' \| 'rounded-md' \| 'rounded-lg'` | Border radius |

## Usage Examples

### Form with Labels

```tsx
Box().display('flex').flexDirection('column').gap('16px').children([
  Label('Username').htmlFor('username').required(true),
  TextField().id('username').placeholder('Enter username')
])
```

### Card Skeleton

```tsx
Box().display('flex').flexDirection('column').gap('12px').padding('16px').children([
  Skeleton().width(64).height(64).shape('circle'),
  Skeleton().width('100%').height('20px'),
  Skeleton().width('80%').height('16px')
])
```

## See Also

- [Checkbox & Switch](/components/interactive-toggles) - Toggle controls
- [TextField](/components/interactive-inputs) - Text inputs
- [Progress & Spinner](/components/content-loading) - Loading indicators
