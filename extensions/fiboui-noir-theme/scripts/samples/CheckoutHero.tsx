import { Box, Button, Card, Column, Row, Text } from 'fiboui';

export function CheckoutHero() {
  return Column()
    .gap(16)
    .padding(24)
    .children([
      Text('FiboUI Noir')
        .fontSize(28)
        .fontWeight(600),
      Text('Minimal dark chrome for fluent builders.').muted(),
      Row()
        .gap(12)
        .crossAxisAlignment('center')
        .children([
          Button('Install theme')
            .variant('solid')
            .onPress(() => {}),
          Button('Open docs')
            .variant('ghost')
            .onPress(() => {}),
        ]),
      Card()
        .padding(16)
        .children([
          Text('Palette').fontSize(14),
          Box().height(8),
          Text('#0C0C0E editor  ·  #4EC9B0 accent').muted(),
        ]),
    ]);
}
