import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Column } from '../src/layout/Column'
import { SafeArea } from '../src/layout/SafeArea'
import { Text } from '../src/content/Text'

afterEach(cleanup)

describe('round 2 layout props', () => {
  it('sets text direction, clip, and z-index on the flex container', () => {
    const { container } = render(
      Column().flexDirection('column').textDirection('rtl').clip('hardEdge').zIndex(3).mainAxisSize('min').build() as never,
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.direction).toBe('rtl')
    expect(el.style.overflow).toBe('hidden')
    expect(el.style.zIndex).toBe('3')
    expect(el.style.height).toBe('fit-content')
  })

  it('redacts text and can ignore the safe area', () => {
    const redacted = render(Text('Secret').redacted().build() as never)
    const text = redacted.container.firstElementChild as HTMLElement
    expect(text.style.color).toBe('transparent')
    redacted.unmount()

    const safe = render(SafeArea().ignoresSafeArea().children(['x']).build() as never)
    const box = safe.container.firstElementChild as HTMLElement
    expect(box.style.paddingTop).toBe('')
  })
})
