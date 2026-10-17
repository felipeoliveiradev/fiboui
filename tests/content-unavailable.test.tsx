import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContentUnavailable } from '../src/content/ContentUnavailable'

afterEach(cleanup)

describe('ContentUnavailable', () => {
  it('shows the title and calls the action button handler', () => {
    const reload = vi.fn()
    render(
      ContentUnavailable()
        .title('No mail')
        .message('You are caught up')
        .action('Reload', reload)
        .build(),
    )

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('No mail')
    expect(status).toHaveTextContent('You are caught up')

    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
