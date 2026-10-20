# Stacks — Row / Column / virtual

Uma API por conceito. Sem aliases SwiftUI duplicados (`HStack`/`VStack` removidos).

## Row

Horizontal: filhos lado a lado.

```ts
import { Row, Text, Spacer } from 'fiboui'

Row()
  .spacing(12)
  .children(
    Text('Leading'),
    Spacer(),
    Text('Trailing'),
  )
```

## Column

Vertical: filhos um em baixo do outro.

```ts
import { Column, Text } from 'fiboui'

Column()
  .spacing(8)
  .children(
    Text('Title'),
    Text('Subtitle'),
  )
```

## VirtualColumn / VirtualRow

Mesma ideia, mas virtualizados (só montam o visível) — listas longas.

```ts
VirtualColumn()
  .itemHeight(48)
  .containerHeight(400)
  .children(...manyItems)

VirtualRow()
  .itemWidth(120)
  .containerWidth(600)
  .children(...manyCards)
```

| Queres… | Usa |
|---|---|
| Poucos filhos | `Row` / `Column` |
| Muitos itens a scrollar | `VirtualColumn` / `VirtualRow` ou `List` |

Correspondência mental SwiftUI (só documentação, não exports): Row ≈ HStack, Column ≈ VStack, Virtual* ≈ Lazy*.
