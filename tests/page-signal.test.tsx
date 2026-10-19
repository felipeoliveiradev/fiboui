import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Button, Text, page, signal } from '../src'

afterEach(() => cleanup())

describe('signal inside page()', () => {
  it('keeps the signal and refreshes Button(`… ${count.value}`)', () => {
    const Page = page(() => {
      const count = signal(0)
      return Button(`Menu ${count.value}`).onPress(() => {
        count.value += 1
      })
    })

    render(<Page />)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Menu 0')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Menu 1')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Menu 2')
  })

  it('reads the same way on a Text node', () => {
    const Page = page(() => {
      const count = signal(0)
      return [
        Text(`Menu ${count.value}`),
        Button('+').onPress(() => {
          count.value += 1
        }),
      ]
    })

    render(<Page />)
    expect(screen.getByText('Menu 0')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('Menu 1')).toBeTruthy()
  })

  it('patches the text node and leaves the rest mounted', () => {
    let mounts = 0
    function Mark() {
      mounts += 1
      return React.createElement('i', { 'data-testid': 'mark' })
    }

    const Page = page(() => {
      const count = signal(0)
      return [
        Text(`Menu ${count.value}`),
        Button('+').onPress(() => {
          count.value += 1
        }),
        React.createElement(Mark),
      ]
    })

    render(<Page />)
    const mounted = mounts
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('Menu 1')).toBeTruthy()
    expect(mounts).toBe(mounted)
  })
})
