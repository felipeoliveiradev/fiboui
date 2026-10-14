# Recipe: dashboard shell

`Scaffold` + header + a two-column `Grid` of cards.

```ts snippet
import {
  Card,
  Column,
  Grid,
  Header,
  Scaffold,
  Text,
  createStore,
} from 'fiboui';

const stats = createStore({
  items: [
    { id: 'u', label: 'Users', value: '1,204' },
    { id: 'r', label: 'Revenue', value: '$18k' },
    { id: 't', label: 'Tickets', value: '37' },
  ],
});

export default function Example() {
  return Scaffold()
    .headerBar(
      Header()
        .height(64)
        .sticky()
        .children(Text('Overview').variant('h3'))
    )
    .children(
      Column()
        .padding(24)
        .gap(16)
        .crossAxisAlignment('stretch')
        .observer()
        .children(() => [
          Text('Today').variant('h2'),
          Grid()
            .columns({ sm: 1, md: 3 })
            .gap('md')
            .children(
              stats.getState().items.map((item) =>
                Card()
                  .key(item.id)
                  .padding(16)
                  .children([
                    Text(item.label).muted(),
                    Text(item.value).variant('h3'),
                  ])
              )
            ),
        ])
    );
}
```
