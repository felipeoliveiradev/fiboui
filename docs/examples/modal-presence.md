# Recipe: modal with Presence

`Presence(signal | boolean)` keeps children mounted through the exit keyframe.

```ts snippet
import { Box, Button, Column, Presence, Text, signal } from 'fiboui';

export default function Example() {
  const open = signal(false);

  return Column()
    .gap(12)
    .padding(24)
    .bindSignal(open)
    .children(() => [
      Button(open.value ? 'Close' : 'Open').onPress(() => {
        open.value = !open.value;
      }),
      Presence(open)
        .enter('fadeIn')
        .exit('fadeOut')
        .duration(200)
        .children(
          Box()
            .padding(16)
            .backgroundColor('#FFFBFE')
            .rounded(12)
            .shadow()
            .children([
              Text('Dialog').variant('h3'),
              Text('Mounted through exit.'),
            ])
        ),
    ]);
}
```

The component form `Presence({ show, children })` still works if you already have a React parent. Documented examples stay fluent.
