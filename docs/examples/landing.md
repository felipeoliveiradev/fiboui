# Recipe: landing sections

**TODO (PR #5 not merged).** `Text.h1()`, `Section`, `Nav`, `Main`, `Anchor`, `Code`, and `Svg` are **not** in fiboui 2.2.0. They live on the open landing PR and must not be documented as shipped APIs.

Until that PR merges, compose a landing from public builders:

```ts snippet
import { Box, Button, Column, Text } from 'fiboui';

export default function Example() {
  return Column()
    .gap(16)
    .padding(32)
    .anchor('hero')
    .children([
      Text('FiboUI').variant('h1'),
      Text('Fluent React UI').muted(),
      Button('Get started').variant('solid').onPress(() => undefined),
      Box().anchor('features').padding(16).children(Text('Features').variant('h2')),
    ]);
}
```
