import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Center, Column, Line, Spacer, Text } from '../src'

afterEach(cleanup)

function host(selector: string): HTMLElement {
  const el = document.querySelector(selector)
  if (!(el instanceof HTMLElement)) throw new Error(`missing ${selector}`)
  return el
}

describe('W22-04 Center leftover — actually centers', () => {
  it('stamps inline flex + margin auto so children center without Tailwind', () => {
    render(
      Center()
        .props({ 'data-testid': 'ctr-flex' })
        .children(Text('mid'))
        .build()
    )
    const el = screen.getByTestId('ctr-flex')
    expect(el.style.display).toBe('flex')
    expect(el.style.alignItems).toBe('center')
    expect(el.style.justifyContent).toBe('center')
    expect(el.style.marginLeft).toBe('auto')
    expect(el.style.marginRight).toBe('auto')
    expect(el.className).toMatch(/\bflex\b/)
    expect(el.className).toMatch(/\bitems-center\b/)
    expect(el.className).toMatch(/\bjustify-center\b/)
  })

  it('.props({ style }) keeps flex centering and extra paint', () => {
    render(
      Center()
        .props({ style: { color: 'rgb(255, 0, 0)' }, 'data-testid': 'ctr-style' })
        .children('x')
        .build()
    )
    const el = screen.getByTestId('ctr-style')
    expect(el.style.display).toBe('flex')
    expect(el.style.alignItems).toBe('center')
    expect(el.style.justifyContent).toBe('center')
    expect(el.style.marginLeft).toBe('auto')
    expect(el.style.marginRight).toBe('auto')
    expect(el.style.color).toBe('rgb(255, 0, 0)')
  })

  it('hidden() is not forced back to flex', () => {
    render(
      Center()
        .hidden()
        .props({ 'data-testid': 'ctr-hidden' })
        .children('x')
        .build()
    )
    expect(screen.getByTestId('ctr-hidden').style.display).toBe('none')
  })
})

describe('W22-04 Spacer leftover — grow vs flex 1', () => {
  it('bare Spacer grow survives .props({ style }) and is not a leftover grow class', () => {
    render(
      Column()
        .children([
          Text('A'),
          Spacer()
            .props({ style: { color: 'rgb(1, 2, 3)' }, 'data-testid': 'sp-grow' }),
          Text('B'),
        ])
        .build()
    )
    const el = screen.getByTestId('sp-grow')
    expect(el.style.flex).toBe('1 1 0%')
    expect(el.style.alignSelf).toBe('stretch')
    expect(el.style.color).toBe('rgb(1, 2, 3)')
    expect(el.style.display).toBe('')
    expect(el.className.split(/\s+/)).not.toContain('grow')
    expect(el.getAttribute('aria-hidden')).toBe('true')
  })

  it('.flex(n) grow factor survives extra style without becoming a flex container', () => {
    render(
      Spacer()
        .flex(2)
        .props({ style: { backgroundColor: 'rgb(0, 128, 0)' }, 'data-testid': 'sp-flex' })
        .build()
    )
    const el = screen.getByTestId('sp-flex')
    expect(el.style.flex).toBe('2 1 0%')
    expect(el.style.display).toBe('')
    expect(el.style.backgroundColor).toBe('rgb(0, 128, 0)')
  })

  it('fixed height still wins over leftover grow', () => {
    const { container } = render(
      Column()
        .children([Spacer().height(32).props({ style: { color: 'rgb(0, 0, 0)' } })])
        .build()
    )
    const el = container.querySelector('.fibo-spacer') as HTMLElement
    expect(el.style.height).toBe('32px')
    expect(el.style.flex).toBe('0 0 auto')
    expect(el.style.color).toBe('rgb(0, 0, 0)')
  })
})

describe('W22-04 Line leftover — orientation / hr vs decorative', () => {
  it('empty Line stays a horizontal separator by default', () => {
    render(Line().build())
    const el = screen.getByRole('separator')
    expect(el.tagName).toBe('HR')
    expect(el).toHaveAttribute('aria-orientation', 'horizontal')
    expect(el).not.toHaveAttribute('aria-hidden')
  })

  it('empty Line().flexDirection("column") is a vertical separator', () => {
    render(Line().flexDirection('column').build())
    const el = screen.getByRole('separator')
    expect(el.tagName).toBe('DIV')
    expect(el).toHaveAttribute('aria-orientation', 'vertical')
    expect(el).toHaveAttribute('role', 'separator')
    expect(el.style.width).toBe('1px')
  })

  it('aria-hidden empty Line is decorative, not a separator', () => {
    const { container } = render(
      Line().props({ 'aria-hidden': true, 'data-testid': 'ln-deco' }).build()
    )
    expect(screen.queryByRole('separator')).toBeNull()
    const el = screen.getByTestId('ln-deco')
    expect(el.tagName).toBe('HR')
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.getAttribute('role')).toBe('none')
    expect(el).not.toHaveAttribute('aria-orientation')
    expect(container.querySelector('.fibo-line')).toBe(el)
  })

  it('role=presentation empty Line is decorative', () => {
    render(Line().props({ role: 'presentation', 'data-testid': 'ln-pres' }).build())
    expect(screen.queryByRole('separator')).toBeNull()
    const el = screen.getByTestId('ln-pres')
    expect(el.tagName).toBe('HR')
    expect(el.getAttribute('role')).toBe('none')
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el).not.toHaveAttribute('aria-orientation')
  })

  it('.sizeHeight() survives .props({ style }) on a flex row Line', () => {
    render(
      Line()
        .sizeHeight('40px')
        .props({ style: { color: 'rgb(255, 0, 0)' }, 'data-testid': 'ln-style' })
        .children([Text('a'), Text('b')])
        .build()
    )
    const el = screen.getByTestId('ln-style')
    expect(el.tagName).toBe('DIV')
    expect(el.style.height).toBe('40px')
    expect(el.style.color).toBe('rgb(255, 0, 0)')
    expect(el.className).toMatch(/\bflex-row\b/)
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('renderToString keeps separator vs decorative split', () => {
    const sep = renderToString(Line().build() as ReactElement)
    expect(sep).toContain('separator')
    expect(sep).toContain('horizontal')
    const deco = renderToString(
      Line().props({ 'aria-hidden': true }).build() as ReactElement
    )
    expect(deco).toContain('aria-hidden')
    expect(deco).not.toContain('separator')
    expect(deco).not.toContain('aria-orientation')
  })
})

describe('W22-04 leftover — host class lock', () => {
  it('keeps fibo-center when extra className is set', () => {
    render(
      Center()
        .props({ className: 'extra-ctr', 'data-testid': 'ctr-host' })
        .children('hello-ctr')
        .build()
    )
    const el = screen.getByTestId('ctr-host')
    expect(el.className).toMatch(/\bfibo-center\b/)
    expect(el.className).toMatch(/\bextra-ctr\b/)
    expect(el.style.display).toBe('flex')
  })

  it('optional props.className undefined does not stamp undefined', () => {
    render(Center().children('x').props({ className: undefined as never }).build())
    expect(host('.fibo-center').className.split(/\s+/)).not.toContain('undefined')
  })
})
