import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Wizard } from '../src/structure/Wizard'

afterEach(cleanup)

const steps = [
  { title: 'Account', child: 'Name' },
  { title: 'Done', child: 'Thanks' },
]

describe('Wizard', () => {
  it('shows the current step title and child, and Next calls onChange(1)', () => {
    const onChange = vi.fn()
    render(
      Wizard()
        .steps(steps)
        .index(0)
        .onChange(onChange)
        .build(),
    )

    expect(screen.getByText('Account')).toBeTruthy()
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.queryByText('Thanks')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('omits or disables Next on the last step', () => {
    render(
      Wizard()
        .steps(steps)
        .index(1)
        .onChange((i: number) => {
          void i
        })
        .build(),
    )

    expect(screen.getByText('Done')).toBeTruthy()
    expect(screen.getByText('Thanks')).toBeTruthy()

    const next = screen.queryByRole('button', { name: 'Next' })
    expect(next === null || (next as HTMLButtonElement).disabled).toBe(true)
  })
})
