import { type ReactElement } from 'react'
import { cleanup, render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Progress, interp, listSignal, signal } from '../src'

afterEach(cleanup)

describe('Progress live interp', () => {
  it('label and subLabel with $length update after add', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Progress()
        .value(40)
        .max(100)
        .variant('floating')
        .label(`Done ${todos.$length}`)
        .subLabel(`n=${todos.$length}`)
        .build() as ReactElement,
    )
    expect(screen.getByRole('progressbar', { name: 'Done 0' })).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('progressbar', { name: 'Done 1' })).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })

  it('label with interp() updates', () => {
    const name = signal('Ada')
    render(
      Progress()
        .value(10)
        .max(100)
        .variant('circular')
        .label(`Hi ${interp(name)}`)
        .build() as ReactElement,
    )
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Hi Ada')
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Hi Bob')
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })
})

describe('Progress leftover a11y (W6-09 lock)', () => {
  it('extra role:presentation still progressbar', () => {
    render(
      Progress()
        .value(40)
        .max(80)
        .label('Upload')
        .id('prog-upload')
        .props({ role: 'presentation', 'data-testid': 'prog-upload' })
        .build(),
    )
    const bar = screen.getByTestId('prog-upload')
    expect(bar).toHaveAttribute('id', 'prog-upload')
    expect(bar).toHaveAttribute('role', 'progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '80')
    expect(bar).toHaveAttribute('aria-label', 'Upload')
  })

  it('circular SVG is hidden from AT', () => {
    const { container, unmount } = render(
      Progress().value(40).max(100).variant('circular').label('Load').build(),
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    unmount()

    const ring = render(Progress().value(40).variant('ring').size(80).label('Ring').build())
    expect(ring.container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
