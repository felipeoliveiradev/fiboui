import { afterEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Textarea } from '../src/interactive/Textarea'
import { Signal } from '../src/core/state'
import { interp } from '../src/core/interpolate'

afterEach(cleanup)

describe('Textarea .placeholder() interp (parity with TextField)', () => {
  it('resolves interp markers on first paint (no FIBO leftover)', () => {
    const who = new Signal('Ada')
    render(Textarea().placeholder(`Write about ${interp(who)}`) as any)
    const control = document.querySelector('.fibo-textarea-input') as HTMLTextAreaElement
    expect(control).toBeTruthy()
    expect(control.placeholder).toBe('Write about Ada')
    expect(control.placeholder).not.toMatch(/FIBO:/)
    expect(screen.getByPlaceholderText('Write about Ada')).toBe(control)
  })

  it('placeholder with interp stays live when the signal ticks', () => {
    const who = new Signal('Ada')
    render(Textarea().placeholder(`Write about ${interp(who)}`) as any)
    expect(screen.getByPlaceholderText('Write about Ada')).toBeTruthy()
    act(() => {
      who.value = 'Bob'
    })
    expect(screen.getByPlaceholderText('Write about Bob')).toBeTruthy()
    expect(screen.queryByPlaceholderText('Write about Ada')).toBeNull()
    const control = document.querySelector('.fibo-textarea-input') as HTMLTextAreaElement
    expect(control.placeholder).toBe('Write about Bob')
    expect(control.placeholder).not.toMatch(/FIBO:/)
  })

  it('does not drop an uncontrolled typed value when placeholder interp ticks', () => {
    const who = new Signal('Ada')
    const bio = new Signal('')
    render(
      Textarea()
        .value(bio)
        .placeholder(`Write about ${interp(who)}`) as any
    )
    const control = screen.getByPlaceholderText('Write about Ada') as HTMLTextAreaElement
    fireEvent.change(control, { target: { value: 'typed notes' } })
    expect(bio.value).toBe('typed notes')
    act(() => {
      who.value = 'Bob'
    })
    expect(screen.getByPlaceholderText('Write about Bob')).toBe(control)
    expect(control.value).toBe('typed notes')
    expect(bio.value).toBe('typed notes')
  })

  it('static placeholder without interp still paints as-is', () => {
    render(Textarea().placeholder('notes') as any)
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(control.placeholder).toBe('notes')
  })
})
