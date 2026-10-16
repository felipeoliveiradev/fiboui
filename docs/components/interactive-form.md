# Form

Native `<form>` with a submit pipeline, a small validation catalog, and a handle to reset or set fields after submit.

```tsx
import { Form, TextField, Button, required, minLength } from 'fiboui'

Form()
  .gap(12)
  .validation({
    title: [required('Escreve um título'), minLength(2, 'Mínimo 2 caracteres')],
  })
  .onSubmit((values) => {
    // values.title is a string from FormData
  })
  .afterSubmit((_values, form) => {
    form.reset('title')
  })
  .children([
    TextField().name('title').placeholder('New todo'),
    Button('Ship it').submit(),
  ])
```

## Submit order

1. `preventDefault` on the native submit event.
2. `FormData` becomes a plain object (`string`, `string[]`, or a file name).
3. Validation runs. The first failing rule per field wins. If anything fails, errors are painted, `onInvalid` runs, and the pipeline stops.
4. `beforeSubmit(values, form)`. Return `false` to cancel.
5. `onSubmit(values, form)`.
6. `afterSubmit(values, form)`.

The second argument is a `FormControl`, captured before any `await`. `event.currentTarget` is gone after the first await, so use this handle:

| Method | Effect |
| :--- | :--- |
| `form.reset()` | `HTMLFormElement.reset()` |
| `form.reset('title')` | Restores that control's `defaultValue` or `defaultChecked` |
| `form.set('title', 'next')` | Writes `.value` on the named control |
| `form.errors` | `{ [name]: message }` from the last validation |
| `form.element` | The `<form>` element |

`reset(name)` only sticks on uncontrolled fields. `TextField` is uncontrolled by default, so it resets. A control that keeps React `value` / `checked` paints the old state back on the next render.

## Validation

```tsx
Form().validation({
  email: [required(), email()],
  age: [min(18, '18+')],
})
```

| Helper | Passes when |
| :--- | :--- |
| `required(message?)` | Trimmed value is not empty |
| `minLength(n, message?)` | Trimmed length is at least `n` |
| `maxLength(n, message?)` | Raw length is at most `n` |
| `email(message?)` | Empty, or looks like an email |
| `pattern(re, message?)` | Empty, or `re.test(value)` |
| `min(n, message?)` / `max(n, message?)` | Empty, or `Number(value)` is in range |
| `rule(check, message)` | `check(value, values)` returns true |

Rules can also live on the field. On submit they are merged with the form schema:

```tsx
TextField().name('title').rules(required('Obrigatório'), minLength(2))
```

### Where the message goes

| `.errorMode(...)` | What happens |
| :--- | :--- |
| `'field'` (default) | Calls the field's own error line when it registered one (`TextField`). Otherwise a paragraph is inserted under the control. |
| `'below'` | Always inserts `.fibo-form-error` under the named control. |
| `'manual'` | Paints nothing. Read `errors` in `.onInvalid((errors, form) => …)`. |

Errors clear on the next submit, not while the user types. Validation does not run on blur or on change.

## What actually submits

`Form` reads successful named controls through `FormData`.

| Control | In `FormData`? | Notes |
| :--- | :--- | :--- |
| `TextField().name(...)` | Yes | Uncontrolled. `.rules()` and the field error line work. |
| `Textarea().name(...)` | The initial string | The textarea is controlled, so later keystrokes are not what submit sees unless a parent re-renders `.value()`. No `.rules()`. |
| `RadioGroup().name(...)` | The initial selection | `checked` follows the `.value()` prop. |
| `Checkbox`, `Switch`, `Select`, `Combobox` | No | No `.name()`, and Select / Combobox are not native controls. |

A schema key with no matching node is still checked as `''` and blocks submit. It is not painted, because there is nowhere to attach the message. `onInvalid` still receives it.

## Button inside a form

`.type('submit')` does not set the DOM type. The builder property `type` is the React component. Use:

```tsx
Button('Save').submit()
Button('Clear').reset()
Button('Save').htmlType('submit')
```

## See also

- [TextField](/components/interactive-inputs)
- [Button](/components/interactive-button)
- [Audit — October 2026](/guide/audit-2026-10)
