import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListTile, Text, listSignal } from '../src'
import { act } from 'react'

afterEach(cleanup)

describe('W13-03 ListTile onClick / onPress', () => {
  it('FiboBuilder .onClick() fires when onPress is not set', () => {
    const onClick = vi.fn()
    render(ListTile().title('Go').onClick(onClick).build())
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('runs onPress then rest.onClick; rest.onClick does not clobber onPress', () => {
    const order: string[] = []
    render(
      ListTile()
        .title('Mix')
        .onPress(() => order.push('press'))
        .onClick(() => order.push('click'))
        .build(),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Mix' }))
    expect(order).toEqual(['press', 'click'])
  })

  it('.onClick() without onPress is keyboard-activatable', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(ListTile().title('Go').onClick(onClick).build())
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn).toHaveAttribute('tabindex', '0')
    btn.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('locks role=button when pressable even if props try to clobber it', () => {
    render(
      ListTile()
        .title('Go')
        .onPress(() => undefined)
        .props({ role: 'presentation', 'data-testid': 'tile' })
        .build(),
    )
    const el = screen.getByTestId('tile')
    expect(el).toHaveAttribute('role', 'button')
    expect(screen.getByRole('button', { name: 'Go' })).toBe(el)
  })

  it('non-pressable tile keeps a custom role from props', () => {
    render(
      ListTile()
        .title('Row')
        .props({ role: 'listitem', 'data-testid': 'row' })
        .build(),
    )
    const el = screen.getByTestId('row')
    expect(el).toHaveAttribute('role', 'listitem')
    expect(el).not.toHaveAttribute('tabindex')
  })
})

describe('W13-03 ListTile interp / SSR (W6 regression)', () => {
  it('title and subtitle with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      ListTile()
        .title(`Row ${todos.$length}`)
        .subtitle(`n=${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByText('Row 0')).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Row 1')).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(
        ListTile()
          .icon(Text('i'))
          .title('SSR')
          .subtitle('ok')
          .chevron()
          .divider()
          .build() as ReactElement,
      ),
    ).not.toThrow()
  })
})
