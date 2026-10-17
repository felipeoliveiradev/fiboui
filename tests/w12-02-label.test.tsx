import { isValidElement, type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Label } from '../src/content/Label'
import { interp, signal } from '../src'

afterEach(cleanup)

describe('W12-02 Label typography CSS', () => {
  it('user text-xs is not fought by a baked-in text-sm class', () => {
    render(Label('Name').className('text-xs') as any)
    const el = screen.getByText('Name')
    expect(el.className).toMatch(/\btext-xs\b/)
    expect(el.className).not.toMatch(/\btext-sm\b/)
    expect(el.className).not.toMatch(/\bfont-medium\b/)
    expect(el.className).not.toMatch(/\bleading-none\b/)
  })

  it('host uses fibo-label + fibo-text-label (library tokens, shop-skin hook)', () => {
    render(Label('Name') as any)
    const el = screen.getByText('Name')
    expect(el.className).toMatch(/\bfibo-label\b/)
    expect(el.className).toMatch(/\bfibo-text-label\b/)
    expect(el.tagName).toBe('LABEL')
  })

  it('optional props.className undefined does not stamp a class named undefined', () => {
    render(Label('Name').props({ className: undefined as never }) as any)
    const el = screen.getByText('Name')
    expect(el.className.split(/\s+/)).not.toContain('undefined')
    expect(el.className).toMatch(/\bfibo-label\b/)
  })
})

describe('W12-02 Label htmlFor a11y', () => {
  it('htmlFor associates the label with the input (getByLabelText)', () => {
    render(
      <>
        {Label('Email').htmlFor('em') as any}
        <input id="em" />
      </>
    )
    expect(screen.getByLabelText('Email')).toBe(document.getElementById('em'))
    expect(screen.getByText('Email')).toHaveAttribute('for', 'em')
  })

  it('extra props do not drop htmlFor', () => {
    render(
      <>
        {Label('Email')
          .htmlFor('em')
          .props({ 'data-testid': 'lbl', title: 'field-label' }) as any}
        <input id="em" />
      </>
    )
    const el = screen.getByTestId('lbl')
    expect(el).toHaveAttribute('for', 'em')
    expect(el).toHaveAttribute('title', 'field-label')
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'em')
  })

  it('required asterisk stays aria-hidden; htmlFor still associates the input', () => {
    render(
      <>
        {Label('Email').required(true).htmlFor('em') as any}
        <input id="em" />
      </>
    )
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
    const input = document.getElementById('em') as HTMLInputElement
    expect(input.labels).toHaveLength(1)
    expect(input.labels![0].textContent).toContain('Email')
  })
})

describe('W12-02 Label interp live (W6 regression)', () => {
  it('Label(`Hi ${interp(name)}`) auto-updates', () => {
    const name = signal('Ada')
    render(Label(`Hi ${interp(name)}`) as any)
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })

  it('Label(interp(name)) without a template stays live', () => {
    const name = signal('Ada')
    render(Label(interp(name) as never) as any)
    expect(screen.getByText('Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Grace'
    })
    expect(screen.getByText('Grace')).toBeInTheDocument()
  })

  it('.text() after construct still binds interp', () => {
    const n = signal(0)
    render(Label().text(`n=${interp(n)}`) as any)
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(() => {
      n.value = 3
    })
    expect(screen.getByText('n=3')).toBeInTheDocument()
  })
})

describe('W12-02 Label host hygiene', () => {
  it('does not leak the internal text prop onto the DOM', () => {
    render(Label('Email').htmlFor('em') as any)
    const el = screen.getByText('Email')
    expect(el.hasAttribute('text')).toBe(false)
    expect(el.getAttribute('text')).toBeNull()
  })

  it('is a React element without .build()', () => {
    expect(isValidElement(Label('Hi'))).toBe(true)
  })

  it('SSR renderToString keeps text and for', () => {
    const html = renderToString(Label('Email').htmlFor('em').required() as ReactElement)
    expect(html).toContain('Email')
    expect(html).toContain('for="em"')
    expect(html).toContain('aria-hidden')
    expect(html).not.toContain(' text=')
  })
})
