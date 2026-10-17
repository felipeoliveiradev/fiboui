import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Gauge } from '../src/content/Gauge'
import { RangeSlider } from '../src/interactive/RangeSlider'
import { Slider } from '../src/interactive/Slider'
import { Stepper } from '../src/interactive/Stepper'

afterEach(cleanup)

describe('range controls', () => {
  it('renders a slider input', () => {
    render(Slider().value(3).min(0).max(10).build())
    const slider = screen.getByRole('slider')
    expect(slider.tagName).toBe('INPUT')
    expect(slider).toHaveAttribute('type', 'range')
    expect(slider).toHaveValue('3')
    expect(document.querySelector('.fibo-slider-track')).toBeTruthy()
  })

  it('orients a vertical slider with writing-mode', () => {
    render(Slider().value(1).direction('vertical').label('Volume').build())
    const slider = screen.getByRole('slider', { name: 'Volume' })
    expect(slider).toHaveStyle({ writingMode: 'vertical-lr' })
  })

  it('disables the slider from .disabled() and from props', () => {
    const { unmount } = render(Slider().value(1).disabled(true).build())
    expect(screen.getByRole('slider')).toBeDisabled()
    unmount()

    render(Slider().value(1).props({ disabled: true }).build())
    expect(screen.getByRole('slider')).toBeDisabled()
  })

  it('calls RangeSlider onChange and keeps start <= end', () => {
    const onChange = vi.fn()
    const { container } = render(
      RangeSlider().start(20).end(80).min(0).max(100).step(1).onChange(onChange).build(),
    )
    const inputs = container.querySelectorAll('input')
    expect(inputs).toHaveLength(2)
    fireEvent.change(inputs[0], { target: { value: '90' } })
    expect(onChange).toHaveBeenCalledWith(80, 80)
  })

  it('steps up from 1 to 2', () => {
    const onChange = vi.fn()
    render(Stepper().value(1).min(0).max(10).step(1).label('Qty').onChange(onChange).build())
    expect(screen.getByText('Qty')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('renders a gauge semicircle', () => {
    const { container } = render(Gauge().value(0.4).min(0).max(1).label('Speed').color('#c8ff00').build())
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    const arc = container.querySelector('.fibo-gauge-value')
    expect(arc?.getAttribute('stroke')).toBe('#c8ff00')
    expect(arc?.getAttribute('stroke-dasharray')).toBeTruthy()
  })
})
