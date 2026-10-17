import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Shortcuts } from '../src/interactive/Shortcuts'

afterEach(cleanup)

describe('Shortcuts', () => {
  it('fires once on window Meta+k and ignores the combo while an input is focused', () => {
    const onFire = vi.fn()
    render(
      <>
        <input aria-label="Query" />
        {Shortcuts().combo('Meta+k').onFire(onFire).label('Search').build()}
      </>,
    )

    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('⌘K')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(onFire).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(onFire).toHaveBeenCalledTimes(2)

    screen.getByRole('textbox', { name: 'Query' }).focus()
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(onFire).toHaveBeenCalledTimes(2)
  })
})
