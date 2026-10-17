import { type ReactElement } from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button, ListTile, Text, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function hostOf(title: string): HTMLElement {
  const node = screen.getByText(title).closest('.fibo-list-tile')
  expect(node).toBeTruthy()
  return node as HTMLElement
}

describe('W21-03 ListTile leading/trailing not dropped', () => {
  it('fluent leading/trailing stay painted after later .props()', () => {
    render(
      ListTile()
        .leading(Text('LEAD'))
        .title('Row')
        .trailing(Text('TAIL'))
        .props({ leading: undefined, trailing: undefined, 'data-testid': 'tile' })
        .build(),
    )
    expect(screen.getByTestId('tile').querySelector('.fibo-list-tile-leading')).toBeTruthy()
    expect(screen.getByTestId('tile').querySelector('.fibo-list-tile-trailing')).toBeTruthy()
    expect(screen.getByText('LEAD')).toBeInTheDocument()
    expect(screen.getByText('TAIL')).toBeInTheDocument()
  })

  it('string leading/trailing with $length stay live (not PUA / dropped)', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      ListTile()
        .leading(`L${todos.$length}`)
        .title('Row')
        .trailing(`T${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('L0')).toBeInTheDocument()
    expect(screen.getByText('T0')).toBeInTheDocument()
    expect(screen.queryByText(/FIBO:/)).toBeNull()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('L1')).toBeInTheDocument()
    expect(screen.getByText('T1')).toBeInTheDocument()
  })
})

describe('W21-03 ListTile title/subtitle interp leftover', () => {
  it('.title(interp(sig)) / .subtitle(interp(sig)) stay live without a template', () => {
    const name = signal('Ada')
    const n = signal(0)
    render(
      ListTile()
        .title(interp(name))
        .subtitle(interp(n))
        .build() as ReactElement,
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByText(/FIBO:/)).toBeNull()
    act(() => {
      name.value = 'Grace'
      n.value = 2
    })
    expect(screen.getByText('Grace')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('.props({ title }) cannot replace resolved interp with PUA marks', () => {
    const todos = listSignal<{ title: string }>([])
    const marked = `Row ${todos.$length}`
    render(
      ListTile()
        .title(marked)
        .props({ title: marked, subtitle: `n=${todos.$length}` })
        .build() as ReactElement,
    )
    expect(screen.getByText('Row 0')).toBeInTheDocument()
    expect(screen.queryByText(/FIBO:/)).toBeNull()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Row 1')).toBeInTheDocument()
  })
})

describe('W21-03 ListTile onTap vs button semantics', () => {
  it('.onTap() is a button (click + keyboard), not a CSS no-op', async () => {
    const user = userEvent.setup()
    const onTap = vi.fn()
    render(ListTile().title('Go').onTap(onTap).build())
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn).toHaveAttribute('tabindex', '0')
    fireEvent.click(btn)
    expect(onTap).toHaveBeenCalledTimes(1)
    btn.focus()
    await user.keyboard('{Enter}')
    expect(onTap).toHaveBeenCalledTimes(2)
    await user.keyboard(' ')
    expect(onTap).toHaveBeenCalledTimes(3)
  })

  it('clicking a trailing Button does not fire the row onPress', () => {
    const row = vi.fn()
    const more = vi.fn()
    render(
      ListTile()
        .title('Row')
        .trailing(Button('More').onPress(more))
        .onPress(row)
        .build(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    expect(more).toHaveBeenCalledTimes(1)
    expect(row).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('Row'))
    expect(row).toHaveBeenCalledTimes(1)
  })
})

describe('W21-03 ListTile dense / disabled', () => {
  it('.dense() tightens default vertical padding', () => {
    const { container, rerender } = render(ListTile().title('Go').build())
    const normal = container.querySelector('.fibo-list-tile') as HTMLElement
    expect(normal.style.padding).toMatch(/^14px 0(px)?$/)
    rerender(ListTile().title('Go').dense().build())
    const dense = container.querySelector('.fibo-list-tile') as HTMLElement
    expect(dense.style.padding).toMatch(/^8px 0(px)?$/)
    expect(dense.getAttribute('dense')).toBeNull()
  })

  it('.disabled() blocks onPress and exposes aria-disabled', () => {
    const onPress = vi.fn()
    render(
      ListTile()
        .title('Go')
        .onPress(onPress)
        .disabled()
        .build(),
    )
    const tile = hostOf('Go')
    fireEvent.click(tile)
    expect(onPress).not.toHaveBeenCalled()
    expect(tile).toHaveAttribute('aria-disabled', 'true')
    expect(tile).toHaveAttribute('role', 'button')
    expect(tile.getAttribute('tabindex')).toBe('-1')
  })
})

describe('W21-03 ListTile href vs button', () => {
  it('.href() renders <a>, not role=button', () => {
    render(ListTile().title('Go').href('/settings').build())
    const link = screen.getByRole('link', { name: 'Go' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/settings')
    expect(link).not.toHaveAttribute('role', 'button')
    expect(link).toHaveClass('fibo-list-tile')
  })

  it('.props({ href }) is a link; javascript: is stripped', () => {
    const { rerender } = render(
      ListTile().title('Go').props({ href: '/inbox' }).build(),
    )
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/inbox')
    rerender(ListTile().title('Go').href('javascript:alert(1)').build())
    const el = hostOf('Go')
    expect(el.getAttribute('href') ?? '').not.toMatch(/javascript/i)
    expect(screen.queryByRole('link', { name: 'Go' })).toBeNull()
  })

  it('href + onPress stays a link and still fires onPress', () => {
    const onPress = vi.fn()
    render(
      ListTile()
        .title('Go')
        .href('/settings')
        .onPress(onPress)
        .build(),
    )
    const link = screen.getByRole('link', { name: 'Go' })
    fireEvent.click(link)
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(link).not.toHaveAttribute('role', 'button')
  })

  it('disabled href is not a live link', () => {
    render(
      ListTile()
        .title('Go')
        .href('/settings')
        .disabled()
        .build(),
    )
    expect(screen.queryByRole('link', { name: 'Go' })).toBeNull()
    const el = hostOf('Go')
    expect(el.getAttribute('href')).toBeNull()
    expect(el).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('W21-03 ListTile leftover SSR', () => {
  it('renderToString of leftover APIs does not throw', () => {
    expect(() =>
      renderToString(
        ListTile()
          .leading(Text('i'))
          .title('SSR')
          .subtitle('ok')
          .trailing(Text('t'))
          .href('/x')
          .dense()
          .disabled()
          .chevron()
          .build() as ReactElement,
      ),
    ).not.toThrow()
  })
})
