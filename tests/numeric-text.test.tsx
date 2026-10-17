import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { NumericText } from '../src/content/NumericText'

afterEach(cleanup)

describe('NumericText', () => {
  it('NumericText().value(12).build() shows 12', () => {
    render(NumericText().value(12).build())
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows the new number when value changes on a later render', () => {
    const { rerender } = render(NumericText().value(12).build())
    rerender(NumericText().value(34).build())
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.queryByText('12')).toBeNull()
  })

  it('format maps the number to a string', () => {
    const { rerender } = render(
      NumericText()
        .value(12)
        .format((n: number) => `€${n.toFixed(2)}`)
        .build(),
    )
    expect(screen.getByText('€12.00')).toBeInTheDocument()
    rerender(
      NumericText()
        .value(7)
        .format((n: number) => `€${n.toFixed(2)}`)
        .build(),
    )
    expect(screen.getByText('€7.00')).toBeInTheDocument()
  })
})
