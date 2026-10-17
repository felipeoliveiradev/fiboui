import { type CSSProperties, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Column, Text, interp, signal } from '../src'

afterEach(cleanup)

function host(): HTMLElement {
  const el = document.querySelector('.fibo-column')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-column')
  return el
}

describe('W22-01 Column leftover — gap vs spacing', () => {
  it('.spacing(0) stamps gap 0px (overrides a prior .gap())', () => {
    render(
      Column()
        .gap(16)
        .spacing(0)
        .children([Text('A'), Text('B')])
        .build(),
    )
    expect(host().style.gap).toBe('0px')
  })

  it('.spacing(12) stamps gap 12px', () => {
    render(
      Column()
        .spacing(12)
        .children([Text('A'), Text('B')])
        .build(),
    )
    expect(host().style.gap).toBe('12px')
  })

  it('.gap(22) alone still paints (FiboBuilder gap, no spacing)', () => {
    render(
      Column()
        .gap(22)
        .children([Text('A'), Text('B')])
        .build(),
    )
    expect(host().style.gap).toBe('22px')
  })
})

describe('W22-01 Column leftover — props.style must merge', () => {
  it('.props({ style }) keeps spacing gap and adds the extra keys', () => {
    render(
      Column()
        .spacing(12)
        .props({ style: { color: 'rgb(1, 2, 3)' }, 'data-testid': 'col-style' })
        .children('merge-style')
        .build(),
    )
    const el = screen.getByTestId('col-style')
    expect(el.style.gap).toBe('12px')
    expect(el.style.color).toBe('rgb(1, 2, 3)')
    expect(el).toHaveTextContent('merge-style')
  })

  it('.props({ style }) keeps .gap() when spacing is unset', () => {
    render(
      Column()
        .gap(8)
        .props({ style: { color: 'rgb(4, 5, 6)' } })
        .children('gap-kept')
        .build(),
    )
    expect(host().style.gap).toBe('8px')
    expect(host().style.color).toBe('rgb(4, 5, 6)')
  })

  it('.props({ style }) keeps flexDirection from .flexDirection()', () => {
    render(
      Column()
        .flexDirection('row')
        .mainAxisAlignment('spaceBetween')
        .props({ style: { color: 'rgb(7, 8, 9)' } })
        .children('dir')
        .build(),
    )
    expect(host().style.flexDirection).toBe('row')
    expect(host().style.color).toBe('rgb(7, 8, 9)')
    expect(host().className).toMatch(/\bjustify-between\b/)
  })
})

describe('W22-01 Column leftover — flexDirection vs mainAxisAlignment', () => {
  it('.flexDirection(row) paints inline row and keeps main-axis class', () => {
    render(
      Column()
        .flexDirection('row')
        .mainAxisAlignment('spaceBetween')
        .children([Text('L'), Text('R')])
        .build(),
    )
    expect(host().style.flexDirection).toBe('row')
    expect(host().className).toMatch(/\bjustify-between\b/)
    expect(host().className).toMatch(/\bfibo-column\b/)
  })
})

describe('W22-01 Column leftover — crossAxisAlignment / fill / size', () => {
  it('.crossAxisAlignment(stretch) stamps items-stretch not leftover items-center', () => {
    render(Column().crossAxisAlignment('stretch').children(Text('s')).build())
    expect(host().className).toMatch(/\bitems-stretch\b/)
    expect(host().className).not.toMatch(/\bitems-center\b/)
  })

  it('.fill() is inherited width/height 100% (not a dead leftover)', () => {
    render(Column().fill().children('fill').build())
    expect(host().style.width).toBe('100%')
    expect(host().style.height).toBe('100%')
  })

  it('.size(medium) stamps flex-1', () => {
    render(Column().size('medium').children('m').build())
    expect(host().className).toMatch(/\bflex-1\b/)
  })
})

describe('W22-01 Column leftover — interp lock', () => {
  it('string children with interp() auto-update', () => {
    const n = signal(1)
    render(Column().children(`n=${interp(n)}`).id('col-w22').build() as ReactElement)
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('col-w22')?.textContent).not.toMatch(/FIBO:/)
  })
})

describe('W22-01 Column leftover — SSR', () => {
  it('renderToString keeps spacing gap when props.style is set', () => {
    const html = renderToString(
      Column()
        .spacing(10)
        .props({ style: { color: 'red' } as CSSProperties })
        .children('ssr-gap')
        .build() as ReactElement,
    )
    expect(html).toMatch(/gap:\s*10px/)
    expect(html).toMatch(/color:\s*red/)
    expect(html).toContain('ssr-gap')
  })
})
