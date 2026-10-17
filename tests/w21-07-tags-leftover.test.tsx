import { type ReactElement } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Tags, interp, listSignal, signal } from '../src'

afterEach(cleanup)

function reactKey(node: Element): string | null {
  const fiberKey = Object.keys(node).find(
    (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  )
  if (!fiberKey) return null
  const fiber = (node as any)[fiberKey]
  const key = fiber?.key
  return key == null ? null : String(key)
}

function keyWarnings(spy: { mock: { calls: unknown[][] } }): string[] {
  return spy.mock.calls
    .map((args) => args.map(String).join(' '))
    .filter((msg) => /unique key|each child/i.test(msg))
}

describe('W21-07 Tags leftover — duplicate keys', () => {
  it('id that equals another row index does not collide', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { container } = render(
      Tags()
        .items([
          { id: '1', title: 'A' },
          { title: 'B' },
        ] as { title: string; id?: string }[])
        .build() as ReactElement
    )
    const warnings = keyWarnings(spy)
    spy.mockRestore()
    expect(warnings).toEqual([])

    const spans = Array.from(container.querySelectorAll('.fibo-tag'))
    expect(spans).toHaveLength(2)
    const keys = spans.map((el) => reactKey(el))
    expect(keys[0]).toBe('1')
    expect(keys[1]).not.toBe(keys[0])
    expect(keys[1]).toBeTruthy()
  })

  it('duplicate item ids stay unique and do not warn', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { container } = render(
      Tags()
        .items([
          { id: 'dup', title: 'alpha' },
          { id: 'dup', title: 'beta' },
        ] as { title: string; id?: string }[])
        .build() as ReactElement
    )
    const warnings = keyWarnings(spy)
    spy.mockRestore()
    expect(warnings).toEqual([])

    const spans = Array.from(container.querySelectorAll('.fibo-tag'))
    expect(spans).toHaveLength(2)
    expect(reactKey(spans[0])).toBe('dup')
    expect(reactKey(spans[1])).not.toBe('dup')
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(screen.getByText('beta')).toBeInTheDocument()
  })
})

describe('W21-07 Tags leftover — overflow wrap', () => {
  it('stamps flex wrap + minWidth so chips wrap instead of overflowing', () => {
    const { container } = render(
      Tags()
        .items([{ title: 'React' }, { title: 'TypeScript' }, { title: 'Vite' }])
        .build() as ReactElement
    )
    const host = container.querySelector('.fibo-tags') as HTMLElement
    expect(host).toBeTruthy()
    expect(host.className).toMatch(/flex-wrap/)
    expect(host.style.display).toBe('flex')
    expect(host.style.flexWrap).toBe('wrap')
    expect(host.style.minWidth).toMatch(/^0(px)?$/)
  })

  it('keeps wrap when extra className is set; user flexWrap wins', () => {
    const { container } = render(
      Tags()
        .items([{ title: 'one' }])
        .flexWrap('nowrap')
        .props({ className: 'extra-tags' })
        .build() as ReactElement
    )
    const host = container.querySelector('.fibo-tags') as HTMLElement
    expect(host.className).toMatch(/fibo-tags/)
    expect(host.className).toMatch(/flex-wrap/)
    expect(host.className).toMatch(/extra-tags/)
    expect(host.style.flexWrap).toBe('nowrap')
    expect(host.style.minWidth).toMatch(/^0(px)?$/)
  })
})

describe('W21-07 Tags leftover — onRemove / keyboard / a11y', () => {
  it('does not paint a remove control without onRemove', () => {
    render(Tags().items([{ title: 'React' }]).build() as ReactElement)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('named remove button is keyboard-activatable and stays off the host', async () => {
    const onRemove = vi.fn()
    const user = userEvent.setup()
    render(
      Tags()
        .items([{ title: 'React' }, { title: 'Vite' }])
        .props({ onRemove, 'data-testid': 'tags-host' })
        .build() as ReactElement
    )
    const host = screen.getByTestId('tags-host')
    expect(host).not.toHaveAttribute('onRemove')

    const btn = screen.getByRole('button', { name: 'Remove React' }) as HTMLButtonElement
    expect(btn.type).toBe('button')
    expect(host.contains(btn)).toBe(true)
    expect(screen.getByRole('button', { name: 'Remove Vite' })).toBeInTheDocument()

    btn.focus()
    await user.keyboard('{Enter}')
    expect(onRemove).toHaveBeenCalledTimes(1)
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({ title: 'React' }), 0)

    fireEvent.click(screen.getByRole('button', { name: 'Remove Vite' }))
    expect(onRemove).toHaveBeenLastCalledWith(expect.objectContaining({ title: 'Vite' }), 1)
  })

  it('interp title stays live on the chip when removable', () => {
    const name = signal('Ada')
    render(
      Tags()
        .items([{ title: `Hi ${interp(name)}` }])
        .props({ onRemove: vi.fn() })
        .build() as ReactElement
    )
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Hi Ada' })).toBeInTheDocument()

    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Hi Bob' })).toBeInTheDocument()
  })

  it('listSignal add with interp still live when removable', () => {
    const name = signal('Ada')
    const tags = listSignal<{ title: string }>([{ title: 'static' }])
    render(
      Tags()
        .items(tags)
        .props({ onRemove: vi.fn() })
        .build() as ReactElement
    )

    act(() => {
      tags.add({ title: `Hi ${interp(name)}` })
    })
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()

    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Hi Bob' })).toBeInTheDocument()
  })
})
