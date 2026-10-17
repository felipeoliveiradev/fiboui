import { createRef } from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FineGrainText } from '../src/core/FineGrain'
import {
  collectInterpSignals,
  hasInterpMarks,
  interp,
  resolveInterpString,
} from '../src/core/interpolate'
import { signal } from '../src/core/state'

afterEach(cleanup)

describe('W23-08 FineGrain XSS', () => {
  it('does not paint HTML from rest.dangerouslySetInnerHTML', () => {
    const { container } = render(
      <FineGrainText
        compute={() => 'safe'}
        dangerouslySetInnerHTML={{ __html: '<img data-xss="1" src="x" onerror="window.__w2308=1">' }}
      />,
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toBe('safe')
    expect((window as { __w2308?: number }).__w2308).toBeUndefined()
  })

  it('null compute + innerHTML is not an HTML injection hole', () => {
    const { container } = render(
      <FineGrainText
        compute={() => null as unknown as string}
        dangerouslySetInnerHTML={{ __html: '<img data-xss="1" src="x">' }}
      />,
    )
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('HTML in compute() is textContent, not parsed markup', () => {
    const payload = '<img data-xss="1" src="x"><b>own</b>'
    const { container } = render(<FineGrainText compute={() => payload} />)
    expect(container.querySelector('[data-xss]')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('b')).toBeNull()
    expect(container.textContent).toBe(payload)
  })
})

describe('W23-08 FineGrain textContent patches', () => {
  it('user ref (React 19 prop) does not freeze live textContent patches', () => {
    const sig = signal('Ada')
    const userRef = createRef<HTMLElement>()
    const props = {
      compute: () => sig.value,
      ref: userRef,
      'data-testid': 'fg-ref',
    }
    const { container } = render(<FineGrainText {...props} />)
    const node = container.querySelector('[data-testid="fg-ref"]')
    expect(node?.textContent).toBe('Ada')
    expect(userRef.current).toBe(node)

    act(() => {
      sig.value = 'Grace'
    })
    expect(node?.textContent).toBe('Grace')
    expect(container.querySelector('[data-testid="fg-ref"]')).toBe(node)
    expect(userRef.current).toBe(node)
  })

  it('bind-style compute stays live after a signal write', () => {
    const sig = signal(1)
    const { container } = render(
      <FineGrainText compute={() => `n=${sig.value}`} data-testid="fg-live" />,
    )
    const node = container.querySelector('[data-testid="fg-live"]')
    expect(node?.textContent).toBe('n=1')
    act(() => {
      sig.value = 2
    })
    expect(node?.textContent).toBe('n=2')
    expect(container.querySelector('[data-testid="fg-live"]')).toBe(node)
  })
})

describe('W23-08 interpolate leftovers', () => {
  it('resolveInterpString does not turn HTML signal values into markup tokens', () => {
    const html = signal('<img data-xss="1" src="x">')
    const marked = `hi ${interp(html)}`
    expect(hasInterpMarks(marked)).toBe(true)
    expect(collectInterpSignals(marked)).toHaveLength(1)
    expect(resolveInterpString(marked)).toBe('hi <img data-xss="1" src="x">')
  })

  it('collectInterpSignals still finds every mark after repeated scans (shared /g lastIndex)', () => {
    const a = signal('A')
    const b = signal('B')
    const marked = `${interp(a)}-${interp(b)}`
    expect(collectInterpSignals(marked)).toHaveLength(2)
    expect(collectInterpSignals(marked)).toHaveLength(2)
    expect(resolveInterpString(marked)).toBe('A-B')
  })
})
