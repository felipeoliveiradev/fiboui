import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { Text } from '../src/content/Text'
import { List } from '../src/structure/List'

afterEach(() => {
  cleanup()
})

describe('List when(hover)', () => {
  it('sends inheritable text styles to descendants and keeps paint on the row', () => {
    render(
      List()
        .items([{ text: 'Buy' }])
        .when('hover', (row) => row.background('transparent').color('#000').fontWeight(800).letterSpacing('0.04em'))
        .renderItem((item: { text: string }) => Text(item.text).color('#fff'))
        .build() as any,
    )

    const sheet = document.querySelector('style[id^="fibo-list-custom-styles-"]')
    const text = sheet?.textContent ?? ''
    const rowRule = text.split('\n').find((line) => line.includes(':hover {')) ?? ''
    const childRule = text.split('\n').find((line) => line.includes(':hover *')) ?? ''

    expect(childRule).toContain('color: #000 !important')
    expect(childRule).toContain('font-weight: 800 !important')
    expect(childRule).toContain('letter-spacing: 0.04em !important')
    expect(childRule).not.toContain('background')

    expect(rowRule).toContain('background: transparent !important')
    expect(rowRule).toContain('color: #000 !important')
  })

  it('does not emit descendant * when hover is paint-only', () => {
    render(
      List()
        .items([{ text: 'Buy' }])
        .when('hover', (row) => row.background('red').opacity(0.8).transform('scale(1.01)'))
        .renderItem((item: { text: string }) => Text(item.text))
        .build() as any,
    )

    const text = document.querySelector('style[id^="fibo-list-custom-styles-"]')?.textContent ?? ''
    expect(text).toContain(':hover {')
    expect(text).toContain('background: red !important')
    expect(text).toContain('opacity: 0.8 !important')
    expect(text).toContain('transform: scale(1.01) !important')
    expect(text).not.toContain(':hover *')
  })

  it('stamps fibo-list-item on each row wrapper', () => {
    const { container } = render(
      List()
        .items([{ text: 'Buy' }])
        .renderItem((item: { text: string }) => Text(item.text))
        .build() as any,
    )
    expect(container.querySelector('.fibo-list-item')).toBeTruthy()
  })
})
