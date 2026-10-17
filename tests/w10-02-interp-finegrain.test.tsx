import { act, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { FineGrainText } from '../src/core/FineGrain'
import {
  collectInterpSignals,
  hasInterpMarks,
  interp,
  resolveInterpString,
} from '../src/core/interpolate'
import { computed, signal } from '../src/core/state'

describe('W10-02 hasInterpMarks', () => {
  it('is true for interp() without wrapping in a template (no false negative)', () => {
    const name = signal('Ada')
    expect(typeof interp(name)).toBe('string')
    expect(hasInterpMarks(interp(name))).toBe(true)
  })

  it('does not throw on null / undefined / non-strings', () => {
    expect(hasInterpMarks(null as never)).toBe(false)
    expect(hasInterpMarks(undefined as never)).toBe(false)
    expect(hasInterpMarks(12 as never)).toBe(false)
    expect(hasInterpMarks({} as never)).toBe(false)
  })

  it('is true for nested template literals that embed interp()', () => {
    const title = signal('Dr')
    const name = signal('Ada')
    const marked = `${` ${interp(title)}. ${interp(name)} `.trim()}`
    expect(hasInterpMarks(marked)).toBe(true)
    expect(resolveInterpString(marked)).toBe('Dr. Ada')
  })
})

describe('W10-02 resolveInterpString stale / lastIndex', () => {
  it('still resolves every mark after collectInterpSignals (shared /g lastIndex)', () => {
    const a = signal('A')
    const b = signal('B')
    const marked = `${interp(a)}-${interp(b)}`
    expect(collectInterpSignals(marked)).toHaveLength(2)
    expect(resolveInterpString(marked)).toBe('A-B')
    a.value = 'X'
    expect(resolveInterpString(marked)).toBe('X-B')
  })

  it('re-reads live signal values (not a snapshot taken at interp())', () => {
    const n = signal(1)
    const marked = `n=${interp(n)}`
    expect(resolveInterpString(marked)).toBe('n=1')
    n.value = 9
    expect(resolveInterpString(marked)).toBe('n=9')
  })

  it('resolves nested interp() inside a computed value (no leftover PUA / stale inner)', () => {
    const inner = signal('Ada')
    const wrapped = computed(() => `Hi ${interp(inner)}`)
    const outer = `msg=${interp(wrapped)}`
    expect(resolveInterpString(outer)).toBe('msg=Hi Ada')
    inner.value = 'Grace'
    expect(resolveInterpString(outer)).toBe('msg=Hi Grace')
  })

  it('nested resolveInterpString during a computed read does not drop sibling marks', () => {
    const a = signal('A')
    const b = signal('B')
    const inner = computed(() => resolveInterpString(`in:${interp(a)}`))
    const outer = `out:${interp(inner)}|${interp(b)}`
    expect(resolveInterpString(outer)).toBe('out:in:A|B')
    a.value = 'Z'
    b.value = 'Y'
    expect(resolveInterpString(outer)).toBe('out:in:Z|Y')
  })

  it('cyclic mark values do not infinite-loop', () => {
    const loop = signal('')
    const marked = `${interp(loop)}`
    loop.value = marked
    expect(() => resolveInterpString(marked)).not.toThrow()
    expect(typeof resolveInterpString(marked)).toBe('string')
  })
})

describe('W10-02 FineGrain remount vs textContent', () => {
  it('parent re-render after a signal write keeps the host node and the live text', () => {
    const sig = signal(0)

    function Host() {
      const [, bump] = useState(0)
      return (
        <div>
          <button type="button" onClick={() => bump((n) => n + 1)}>
            rerender
          </button>
          <FineGrainText compute={() => `n=${sig.value}`} data-testid="fg" />
        </div>
      )
    }

    const { container } = render(<Host />)
    const node = container.querySelector('[data-testid="fg"]')
    expect(node?.textContent).toBe('n=0')

    act(() => {
      sig.value = 7
    })
    expect(node?.textContent).toBe('n=7')
    expect(container.querySelector('[data-testid="fg"]')).toBe(node)

    act(() => {
      screen.getByText('rerender').click()
    })
    expect(container.querySelector('[data-testid="fg"]')).toBe(node)
    expect(node?.textContent).toBe('n=7')
  })

  it('bindText host is not remounted when the signal changes', () => {
    const sig = signal('hello')
    const { container, rerender } = render(
      <FineGrainText compute={() => String(sig.value)} data-testid="bt" />,
    )
    const node = container.querySelector('[data-testid="bt"]')
    expect(node?.textContent).toBe('hello')

    act(() => {
      sig.value = 'world'
    })
    expect(container.querySelector('[data-testid="bt"]')).toBe(node)
    expect(node?.textContent).toBe('world')

    rerender(<FineGrainText compute={() => String(sig.value)} data-testid="bt" />)
    expect(container.querySelector('[data-testid="bt"]')).toBe(node)
    expect(node?.textContent).toBe('world')
  })
})
