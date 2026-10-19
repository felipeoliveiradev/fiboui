import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Button, Text, computed, page, signal } from '../src'

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

  it('updates only the node that read the signal', () => {
    let builds = 0
    let marks = 0
    function Mark() {
      marks += 1
      return React.createElement('i', { 'data-testid': 'mark' })
    }

    const width = signal(12)
    const other = signal(20)
    const Page = page(() => {
      builds += 1
      return [
        Box().width(width.value).height(4),
        Box().width(other.value).height(6),
        React.createElement(Mark),
        Button('+').onPress(() => {
          width.value = 48
        }),
      ]
    })

    const { container } = render(<Page />)
    const widths = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[style*="width"]')).map(
        (node) => node.style.width,
      )
    expect(builds).toBe(1)
    expect(marks).toBe(1)
    expect(widths()).toEqual(['12px', '20px'])
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByTestId('mark')).toBeTruthy()
    expect(builds).toBe(1)
    expect(marks).toBe(1)
    expect(widths()).toEqual(['48px', '20px'])
  })

  it('writes one text and one sized node without running the page again', () => {
    let builds = 0
    const nome = signal('Ana')
    const pontos = signal(0)
    const Page = page(() => {
      builds += 1
      return [
        Text(nome.value),
        Text(`Pontos ${pontos.value}`),
        Text('fixo'),
        Box().width(`${pontos.value}px`).height(4),
        Button('+').onPress(() => {
          pontos.value += 1
        }),
      ]
    })

    const { container } = render(<Page />)
    expect(builds).toBe(1)
    expect(screen.getByText('Ana')).toBeTruthy()
    expect(screen.getByText('Pontos 0')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(builds).toBe(1)
    expect(screen.getByText('Ana')).toBeTruthy()
    expect(screen.getByText('Pontos 1')).toBeTruthy()
    expect(screen.getByText('fixo')).toBeTruthy()
    const sized = Array.from(container.querySelectorAll<HTMLElement>('[style*="width"]')).map(
      (node) => node.style.width,
    )
    expect(sized).toContain('1px')
  })

  it('replays pontos.value + 1 on that box alone', () => {
    let builds = 0
    const pontos = signal(12)
    const Page = page(() => {
      builds += 1
      return [
        Box().width(pontos.value + 1).height(4),
        Text('fixo'),
        Button('+').onPress(() => {
          pontos.value = 20
        }),
      ]
    })

    const { container } = render(<Page />)
    const widthOf = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[style*="width"]')).map(
        (node) => node.style.width,
      )
    expect(builds).toBe(1)
    expect(widthOf()).toContain('13px')
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(builds).toBe(1)
    expect(screen.getByText('fixo')).toBeTruthy()
    expect(widthOf()).toContain('21px')
  })

  it('keeps an observer read on that branch', () => {
    let builds = 0
    const flag = signal('off')
    const Page = page(() => {
      builds += 1
      return [
        Box().width(200).height(40),
        Box()
          .observer()
          .children(() => Text(flag.value === 'on' ? 'Live' : 'Idle')),
        Button('go').onPress(() => {
          flag.value = 'on'
        }),
      ]
    })

    render(<Page />)
    expect(screen.getByText('Idle')).toBeTruthy()
    const built = builds
    fireEvent.click(screen.getByRole('button', { name: 'go' }))
    expect(screen.getByText('Live')).toBeTruthy()
    expect(builds).toBe(built)
  })

  it('writes a computed count on the text and leaves the page', () => {
    const n = signal(2)
    const left = computed(() => n.value)
    let builds = 0
    const Page = page(() => {
      builds += 1
      return [Text(`${left.value} left`), Text('fixo')]
    })

    render(<Page />)
    expect(screen.getByText('2 left')).toBeTruthy()
    act(() => {
      n.value = 1
    })
    expect(screen.getByText('1 left')).toBeTruthy()
    expect(screen.getByText('fixo')).toBeTruthy()
    expect(builds).toBe(1)
  })
})
