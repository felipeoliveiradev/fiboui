import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Inspector } from '../src/layout/Inspector'

afterEach(() => {
  cleanup()
})

describe('Inspector', () => {
  it('renders main and the complementary panel when open', () => {
    render(
      Inspector().open(true).title('Details').child('Main').panel('Meta').build() as ReactElement,
    )

    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Meta')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()

    const panel = screen.getByRole('complementary')
    expect(panel).toHaveTextContent('Meta')
    expect(panel).toHaveAttribute('role', 'complementary')
  })

  it('keeps main and omits the panel when closed', () => {
    render(
      Inspector().open(false).title('Details').child('Main').panel('Meta').build() as ReactElement,
    )

    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.queryByText('Meta')).not.toBeInTheDocument()
    expect(screen.queryByText('Details')).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary')).toBeNull()
  })
})
