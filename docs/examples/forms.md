# Recipe: form

Fluent fields, labels, and a submit button. No JSX.

```ts snippet
import { Button, Checkbox, Column, Label, Text, TextField, Textarea } from 'fiboui';
import { signal } from 'fiboui';

export default function Example() {
  const name = signal('');
  const bio = signal('');
  const agree = signal(false);

  return Column()
    .gap(12)
    .padding(24)
    .maxWidth(420)
    .crossAxisAlignment('stretch')
    .bindSignal(name)
    .children(() => [
      Text('Profile').variant('h2'),
      Label('Name').htmlFor('name').required(),
      TextField(name.value)
        .placeholder('Ada Lovelace')
        .props({ id: 'name' })
        .onChange((value: string) => {
          name.value = value;
        }),
      Label('Bio').htmlFor('bio'),
      Textarea()
        .placeholder('Notes')
        .props({ id: 'bio' })
        .onChange((value: string) => {
          bio.value = value;
        }),
      Checkbox()
        .label('I agree')
        .checked(agree.value)
        .onChange((value: boolean) => {
          agree.value = value;
        }),
      Button('Save')
        .variant('solid')
        .disabled(!agree.value)
        .onPress(() => undefined),
    ]);
}
```
