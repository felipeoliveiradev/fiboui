import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CheckboxTile } from '../src/structure/CheckboxTile'
import { RadioTile } from '../src/structure/RadioTile'
import { SwitchTile } from '../src/structure/SwitchTile'

afterEach(cleanup)

describe('CheckboxTile', () => {
  it('clicking the row toggles and calls onChange(true)', () => {
    const onChange = vi.fn()
    render(
      CheckboxTile().title('Mail').subtitle('Daily').checked(false).onChange(onChange).build(),
    )
    expect(screen.getByText('Daily')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Mail' }))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('checkbox', { name: 'Mail' })).toHaveAttribute('aria-checked', 'true')
  })
})

describe('SwitchTile', () => {
  it('reflects aria-checked from checked()', () => {
    const onChange = vi.fn()
    const { unmount } = render(
      SwitchTile().title('Wi-Fi').checked(true).onChange(onChange).build(),
    )
    const on = screen.getByRole('switch', { name: 'Wi-Fi' })
    expect(on).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(on)
    expect(onChange).toHaveBeenCalledWith(false)
    unmount()

    render(SwitchTile().title('Wi-Fi').checked(false).build())
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toHaveAttribute('aria-checked', 'false')
  })
})

describe('RadioTile', () => {
  it('calls onChange with its value', () => {
    const onChange = vi.fn()
    render(
      RadioTile()
        .title('Small')
        .value('s')
        .group('size')
        .checked(false)
        .onChange(onChange)
        .build(),
    )
    const radio = screen.getByRole('radio', { name: 'Small' })
    expect(radio).toHaveAttribute('aria-checked', 'false')
    expect(radio).toHaveAttribute('data-group', 'size')
    fireEvent.click(radio)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('s')
  })
})
