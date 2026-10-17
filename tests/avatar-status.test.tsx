import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar } from '../src'

afterEach(cleanup)

function descendants(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll('*')) as HTMLElement[]
}

function clipsOverflow(el: HTMLElement): boolean {
  return el.style.overflow === 'hidden'
    || el.style.overflowX === 'hidden'
    || el.style.overflowY === 'hidden'
}

function isStatusPip(el: HTMLElement): boolean {
  const bg = el.style.backgroundColor.replace(/\s/g, '').toLowerCase()
  const green = bg === '#10b981' || bg === 'rgb(16,185,129)'
  const pipShape = el.style.borderRadius === '50%' && el.style.position === 'absolute'
  return green || pipShape
}

describe('Avatar status pip', () => {
  it('host overflow is not hidden; face clips; online pip is present', () => {
    render(Avatar().status('online').initials('AB').build())
    const host = screen.getByRole('img')
    expect(host.style.overflow).not.toBe('hidden')
    expect(descendants(host).some(clipsOverflow)).toBe(true)
    expect(descendants(host).some(isStatusPip)).toBe(true)
  })

  it('extra role cannot drop img; data-testid lands on the host', () => {
    render(
      Avatar()
        .status('online')
        .initials('AB')
        .props({ role: 'presentation', 'data-testid': 'av' })
        .build(),
    )
    const el = screen.getByTestId('av')
    expect(el).toHaveAttribute('role', 'img')
  })

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(Avatar().status('online').initials('AB').build() as ReactElement),
    ).not.toThrow()
  })

  it('status none has no status pip', () => {
    render(Avatar().status('none').initials('AB').build())
    const host = screen.getByRole('img')
    expect(descendants(host).some(isStatusPip)).toBe(false)
  })
})
