import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Column } from '../src/layout/Column'
import { withFiboStyles } from '../src/index'

describe('logical CSS on every builder', () => {
  it('borderHorizontal and paddingHorizontal land on the host', () => {
    const html = renderToString(
      Column()
        .paddingHorizontal(12)
        .borderHorizontal('1px solid red')
        .roundedTop(8)
        .children([])
        .build() as any
    )
    expect(html).toContain('padding-left')
    expect(html).toContain('padding-right')
    expect(html).toContain('border-left')
    expect(html).toContain('border-right')
    expect(html).toContain('border-top-left-radius')
    expect(html).toContain('border-top-right-radius')
  })

  it('hover accepts any CSS and logical axes', () => {
    const html = renderToString(
      withFiboStyles(
        Column()
          .hover((h) =>
            h.paddingHorizontal(8).boxShadow('0 4px 12px rgba(0,0,0,.2)').marginVertical(4)
          )
          .children([])
      ) as any
    )
    expect(html).toContain('padding-left')
    expect(html).toContain('box-shadow')
    expect(html).toContain('margin-top')
    expect(html).toContain('margin-bottom')
  })
})
