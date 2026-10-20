import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScrollView } from '../src'

afterEach(cleanup)

describe('ScrollView scrollAnchor and refreshable', () => {
  it('sets data-scroll-anchor and snap align for a vertical center anchor', () => {
    render(
      ScrollView().direction('vertical').scrollAnchor('center').children('pane').build() as ReactElement,
    )
    const el = document.querySelector('.fibo-scrollview')
    expect(el).toBeTruthy()
    expect(el).toHaveAttribute('data-scroll-anchor', 'center')
    expect((el as HTMLElement).style.scrollSnapAlign).toBe('center')
    expect((el as HTMLElement).style.scrollSnapType).toBe('y mandatory')
    expect((el as HTMLElement).style.overflowY).toBe('auto')
    expect((el as HTMLElement).style.overflowX).toBe('hidden')
  })

  it('uses x mandatory for a horizontal anchor when snap type is unset', () => {
    render(ScrollView().horizontal().scrollAnchor('start').build() as ReactElement)
    const el = document.querySelector('.fibo-scrollview') as HTMLElement
    expect(el).toHaveAttribute('data-scroll-anchor', 'start')
    expect(el.style.scrollSnapAlign).toBe('start')
    expect(el.style.scrollSnapType).toBe('x mandatory')
    expect(el.style.overflowX).toBe('auto')
    expect(el.style.overflowY).toBe('hidden')
  })

  it('keeps an existing scrollSnapType', () => {
    render(
      ScrollView()
        .vertical()
        .style({ scrollSnapType: 'y proximity' })
        .scrollAnchor('end')
        .build() as ReactElement,
    )
    const el = document.querySelector('.fibo-scrollview') as HTMLElement
    expect(el.style.scrollSnapType).toBe('y proximity')
    expect(el.style.scrollSnapAlign).toBe('end')
  })

  it('refreshable wraps content in PullToRefresh (not a stub Refresh button)', () => {
    const handler = vi.fn()
    render(
      ScrollView().children('kept-child').refreshable(handler).build() as ReactElement,
    )
    expect(screen.getByText('kept-child')).toBeInTheDocument()
    const ptr = document.querySelector('.fibo-pull-to-refresh')
    expect(ptr).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull()
  })
})
