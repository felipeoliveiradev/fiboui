import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box, Column, PreferenceKey, reducePreferences, Text } from '../src'

afterEach(cleanup)

describe('PreferenceKey', () => {
  it('reducePreferences applies reduce', () => {
    const MaxKey = PreferenceKey({
      defaultValue: 0,
      reduce: (a, b) => Math.max(a, b),
    })
    expect(reducePreferences(MaxKey, [3, 9, 1])).toBe(9)
  })

  it('onPreferenceChange receives reduced descendant values', async () => {
    const WidthKey = PreferenceKey({
      id: 'test-width',
      defaultValue: 0,
      reduce: (a, b) => Math.max(a, b),
    })
    const onChange = vi.fn()
    render(
      Column()
        .onPreferenceChange(WidthKey, onChange)
        .children([
          Box().preference(WidthKey, 40).children(Text('a')),
          Box().preference(WidthKey, 120).children(Text('b')),
        ])
        .build()
    )
    expect(screen.getByText('a')).toBeTruthy()
    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
      const calls = onChange.mock.calls
      expect(calls[calls.length - 1]?.[0]).toBe(120)
    })
  })

  it('same-node preference + onPreferenceChange works', async () => {
    const FlagKey = PreferenceKey({ id: 'flag', defaultValue: false })
    const onChange = vi.fn()
    render(
      Box()
        .preference(FlagKey, true)
        .onPreferenceChange(FlagKey, onChange)
        .children(Text('self'))
        .build()
    )
    await waitFor(() => {
      const calls = onChange.mock.calls
      expect(calls[calls.length - 1]?.[0]).toBe(true)
    })
  })
})
