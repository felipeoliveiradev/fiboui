import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CustomScrollView } from '../src/layout/CustomScrollView'
import { SliverAppBar } from '../src/layout/SliverAppBar'
import { SliverList } from '../src/layout/SliverList'

afterEach(cleanup)

describe('slivers', () => {
  it('pinned app bar style.position is sticky', () => {
    const { container } = render(
      SliverAppBar().title('Inbox').pinned(true).build() as ReactElement
    )
    const header = container.querySelector('header')
    expect(header).toBeInstanceOf(HTMLElement)
    expect((header as HTMLElement).style.position).toBe('sticky')
    expect((header as HTMLElement).style.top).toBe('0px')
  })

  it('unpinned app bar is a normal header', () => {
    const { container } = render(
      SliverAppBar().title('Inbox').pinned(false).build() as ReactElement
    )
    const header = container.querySelector('header') as HTMLElement
    expect(header.style.position).toBe('')
    expect(header.textContent).toBe('Inbox')
  })

  it('CustomScrollView renders the title and a list child text', () => {
    const appBar = SliverAppBar().title('Inbox').pinned(true)
    const list = SliverList().children(['First item'])
    const { container } = render(
      CustomScrollView().slivers([appBar, list]).build() as ReactElement
    )

    expect(screen.getByText('Inbox')).toBeInTheDocument()
    expect(screen.getByText('First item')).toBeInTheDocument()

    const view = container.querySelector('.fibo-custom-scroll-view') as HTMLElement
    expect(view.style.overflow).toBe('auto')
    expect(view.style.display).toBe('flex')
    expect(view.style.flexDirection).toBe('column')

    const column = container.querySelector('.fibo-sliver-list') as HTMLElement
    expect(column.style.display).toBe('flex')
    expect(column.style.flexDirection).toBe('column')
  })
})
