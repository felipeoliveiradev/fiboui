# Form

Native `<form>` with a submit pipeline, a small validation catalog, and a handle to reset or set fields after submit.

`Form` is a root export and a `fiboui/interactive` export:

```tsx
import { Form, TextField, Button, required, minLength, url, integer, equalTo } from 'fiboui'
// or: import { Form, required, url, integer, equalTo } from 'fiboui/interactive'

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
| `form.element` | The `<form>` element (`data-submitting` / `aria-busy` while `onSubmit` is in flight) |

`reset(name)` only sticks on uncontrolled fields. `TextField`, `Textarea`, `Checkbox`, `Switch`, and `RadioGroup` are uncontrolled by default, so they reset. `.controlled(true)` keeps React `value` / `checked` and paints the old state back on the next render.

## Validation

```tsx
Form().validation({
  email: [required(), email()],
  website: [url()],
  age: [integer(), min(18, '18+')],
  confirm: [equalTo('password')],
})
```

| Helper | Passes when |
| :--- | :--- |
| `required(message?)` | Trimmed value is not empty |
| `minLength(n, message?)` | Trimmed length is at least `n` |
| `maxLength(n, message?)` | Raw length is at most `n` |
| `email(message?)` | Empty, or looks like an email |
| `url(message?)` | Empty, or an `http:` / `https:` URL (`javascript:` / `data:` fail) |
| `integer(message?)` | Empty, or an integer (not a float) |
| `pattern(re, message?)` | Empty, or `re.test(value)` |
| `min(n, message?)` / `max(n, message?)` | Empty, or `Number(value)` is in range |
| `equalTo(other, message?)` | Value equals `values[other]` |
| `rule(check, message)` | `check(value, values)` returns true |

Rules can also live on the field. On submit they are merged with the form schema:

```tsx
TextField().name('title').rules(required('Obrigatório'), minLength(2))
```

### Where the message goes

`FormErrorMode` is `'field' | 'below' | 'manual'`. Import the type from `fiboui` or `fiboui/interactive`.

| `.errorMode(...)` | What happens |
| :--- | :--- |
| `'field'` (default) | Calls the field's own error line when it registered one (`TextField` and other `.rules()` fields). Otherwise a paragraph is inserted under the control. |
| `'below'` | Always inserts `.fibo-form-error` under the named control. |
| `'manual'` | Paints nothing. Read `errors` in `.onInvalid((errors, form) => …)`. |

Painted errors clear while the user types. Validation runs on submit **and** on blur (not on every keystroke). While `onSubmit` is in flight the `<form>` has `data-submitting="true"` and `aria-busy="true"` — a second submit waits until it clears. Field host and form get `data-touched` on blur and `data-dirty` on input.

## What actually submits

`Form` reads successful named controls through `FormData`.

| Control | In `FormData`? | Notes |
| :--- | :--- | :--- |
| `TextField().name(...)` | Yes | Uncontrolled. `.rules()` and the field error line work. |
| `Textarea().name(...)` | Yes | Uncontrolled (`defaultValue`). `.controlled(true)` opts into React `value`. `.rules()` works. |
| `RadioGroup().name(...)` | Yes | Uncontrolled. Omit `.name()` and the group stays out of `FormData`. `.rules()` works. |
| `Checkbox().name(...)`, `Switch().name(...)` | Yes | Uncontrolled native checkbox. Checked value defaults to `'on'`. `.rules()` works. |
| `Select().name(...)`, `Combobox().name(...)` | Yes | `.name()` writes hidden input(s). Multi-select is **one hidden per value** (same `name`) → `FormData` `string[]`. A comma in a value is one entry. Empty multiple keeps a single empty hidden. |

A schema key with no matching node is still checked as `''` and blocks submit. It is not painted, because there is nowhere to attach the message. `onInvalid` still receives it. Disabled named fields are omitted from `FormData` and skipped in the schema.

`.action('javascript:…')` / `data:` is dropped on the DOM. Combobox Enter submits the form when the list is closed (or open with nothing to commit). Open list + highlight / `onAdd` commits the option and does not submit.

## Button inside a form

`.type('submit' | 'reset' | 'button')` sets the HTML `type`. `.submit()`, `.reset()`, and `.htmlType()` are the same write:

```tsx
Button('Save').type('submit')
Button('Save').submit()
Button('Clear').reset()
Button('Save').htmlType('submit')
```

## See also

- [TextField](/components/interactive-inputs)
- [Button](/components/interactive-button)
- [Audit — October 2026](/guide/audit-2026-10)
