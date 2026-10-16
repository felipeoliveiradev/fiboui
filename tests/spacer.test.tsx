import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Column, Row, Spacer, Text } from '../src/index'

function spacerStyle(node: Parameters<typeof render>[0]): CSSStyleDeclaration {
  const { container } = render(node)
  const el = container.querySelector('.fibo-spacer') as HTMLElement
  expect(el).toBeTruthy()
  return el.style
}

describe('Spacer', () => {
  it('grows to fill a column when no size is given', () => {
    const style = spacerStyle(Column().children([Text('A'), Spacer(), Text('B')]))
    expect(style.flex).toBe('1 1 0%')
    expect(style.alignSelf).toBe('stretch')
    expect(style.display).toBe('')
  })

  it('keeps a fixed height and does not shrink it away', () => {
    const style = spacerStyle(Column().children([Text('A'), Spacer().height(32), Text('B')]))
    expect(style.height).toBe('32px')
    expect(style.flex).toBe('0 0 auto')
  })

  it('keeps a fixed width in a row', () => {
    const style = spacerStyle(Row().children([Text('A'), Spacer().width(40), Text('B')]))
    expect(style.width).toBe('40px')
    expect(style.flex).toBe('0 0 auto')
  })

  it('uses the grow factor from flex() without becoming a flex container', () => {
    const style = spacerStyle(Column().children([Spacer().flex(2)]))
    expect(style.flex).toBe('2 1 0%')
    expect(style.display).toBe('')
  })
})
