import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Checkbox } from '../src/interactive/Checkbox'
import { Switch } from '../src/interactive/Switch'

afterEach(cleanup)

function boxEl(label: string, role: 'checkbox' | 'switch' = 'checkbox'): HTMLElement {
  const input = screen.getByRole(role, { name: label })
  const host = input.closest('.fibo-checkbox') ?? input.closest('.fibo-switch')
  const box = host?.querySelector('.fibo-checkbox-box, .fibo-switch-track') as HTMLElement | null
  if (!box) throw new Error('box/track not found')
  return box
}

describe('Checkbox .when() paint', () => {
  it('applies fluent on paint and skips default primary class', () => {
    render(
      Checkbox()
        .label('Done')
        .checked(true)
        .controlled(true)
        .when('on', (s) => s.bg('#c8ff00').borderColor('transparent'))
        .build() as any
    )
    const box = boxEl('Done')
    expect(box.style.backgroundColor).toBe('rgb(200, 255, 0)')
    expect(box.style.borderColor).toBe('transparent')
    expect(box.className).not.toContain('bg-[var(--fibo-primary')
  })

  it('applies off paint, and checked is an alias of on', () => {
    render(
      Checkbox()
        .label('Open')
        .checked(false)
        .controlled(true)
        .when('unchecked', (s) => s.bg('transparent').borderColor('rgba(255,255,255,0.16)'))
        .build() as any
    )
    const box = boxEl('Open')
    expect(box.style.borderColor).toBe('rgba(255, 255, 255, 0.16)')
    expect(box.className).not.toContain('border-gray-300')
  })

  it('swaps styles on uncontrolled toggle', () => {
    render(
      Checkbox()
        .label('Toggle')
        .when('on', { backgroundColor: '#c8ff00' })
        .when('off', { backgroundColor: '#111111' })
        .build() as any
    )
    const box = boxEl('Toggle')
    expect(box.style.backgroundColor).toBe('rgb(17, 17, 17)')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Toggle' }))
    expect(box.style.backgroundColor).toBe('rgb(200, 255, 0)')
  })

  it('indeterminate uses mixed, else on', () => {
    const { rerender } = render(
      Checkbox()
        .label('Mix')
        .indeterminate(true)
        .when('on', (s) => s.bg('#00ff00'))
        .when('mixed', (s) => s.bg('#ff00ff'))
        .build() as any
    )
    expect(boxEl('Mix').style.backgroundColor).toBe('rgb(255, 0, 255)')

    rerender(
      Checkbox()
        .label('Mix2')
        .indeterminate(true)
        .when('checked', (s) => s.bg('#00ff00'))
        .build() as any
    )
    expect(boxEl('Mix2').style.backgroundColor).toBe('rgb(0, 255, 0)')
  })
})

describe('Switch .when() paint', () => {
  it('paints the track when on', () => {
    render(
      Switch()
        .label('Power')
        .checked(true)
        .controlled(true)
        .when('on', (s) => s.bg('#c8ff00'))
        .build() as any
    )
    const track = boxEl('Power', 'switch')
    expect(track.style.backgroundColor).toBe('rgb(200, 255, 0)')
    expect(track.className).not.toContain('bg-[var(--fibo-primary')
  })
})
