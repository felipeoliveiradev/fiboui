# Recipe: list with keys

Stable `.key()` on every mapped builder. `List` virtualizes above 100 items.

```ts snippet
import { Column, List, ListTile, Text } from 'fiboui';

const people = [
  { id: 'a', name: 'Ada', role: 'Engineer' },
  { id: 'b', name: 'Grace', role: 'Admiral' },
];

export default function Example() {
  return Column()
    .gap(16)
    .children([
      Text('Team').variant('h2'),
      List()
        .items(people)
        .renderItem((person) =>
          ListTile()
            .key(person.id)
            .title(person.name)
            .subtitle(person.role)
            .chevron()
            .divider()
        ),
      Column().children(
        people.map((person) => Text(person.name).key(person.id))
      ),
    ]);
}
```
