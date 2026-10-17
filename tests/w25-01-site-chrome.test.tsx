import { type ReactElement } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getCss } from '../src/core/styleManager'
import { menuOpen } from '../examples/site/src/modules/site/state'
import { logoLockup } from '../examples/site/src/modules/site/Views/Logo'
import { MenuOverlay } from '../examples/site/src/modules/site/Views/MenuOverlay'
import { TopBar } from '../examples/site/src/modules/site/Views/NavBar'

afterEach(() => {
  cleanup()
  menuOpen.value = false
})

beforeEach(() => {
  menuOpen.value = false
})

function pseudoDecl(el: HTMLElement, pseudo: string, prop: string): string | undefined {
  const css = getCss()
  for (const cls of el.classList) {
    const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const block = css.match(new RegExp(`\\.${escaped}:${pseudo}\\s*\\{([^}]+)\\}`))
    if (!block) continue
    const hit = block[1].match(new RegExp(`${prop}:\\s*([^;!]+)`))
    if (hit) return hit[1].trim().toLowerCase()
  }
}

function hex(value: string | undefined): string | undefined {
  if (!value) return value
  const named: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
  }
  if (named[value]) return named[value]
  const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgb) {
    const toHex = (n: string) => Number(n).toString(16).padStart(2, '0')
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`
  }
  return value
}

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => !el.hasAttribute('disabled'),
  )
}

describe('W25-01 site chrome leftover', () => {
  it('logo lockup is a named home control', () => {
    render(logoLockup() as ReactElement)
    expect(screen.getByRole('button', { name: /fiboui/i })).toBeTruthy()
  })

  it('hamburger hover does not paint the same color as the 9-dot icon', () => {
    render(TopBar() as ReactElement)
    const menu = screen.getByRole('button', { name: /open menu/i })
    const hoverBg = hex(pseudoDecl(menu, 'hover', 'background-color'))
    expect(hoverBg, 'hamburger :hover background').toBeTruthy()
    // Dots are chalk (#ffffff). White-on-white hover hides the control.
    expect(hoverBg).not.toBe('#ffffff')
  })

  it('opening the menu moves focus into the dialog and closing restores it', () => {
    const outside = document.createElement('button')
    outside.textContent = 'outside'
    document.body.appendChild(outside)
    outside.focus()
    expect(document.activeElement).toBe(outside)

    render(MenuOverlay() as ReactElement)
    act(() => {
      menuOpen.value = true
    })

    const dialog = document.getElementById('site-menu')
    expect(dialog, '#site-menu').toBeTruthy()
    expect(dialog!.contains(document.activeElement), 'focus inside dialog').toBe(true)

    act(() => {
      menuOpen.value = false
    })
    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  it('Tab wraps inside the modal and does not escape to the page', () => {
    render(MenuOverlay() as ReactElement)
    act(() => {
      menuOpen.value = true
    })
    const dialog = document.getElementById('site-menu') as HTMLElement
    const nodes = focusables(dialog)
    expect(nodes.length).toBeGreaterThan(1)

    nodes[nodes.length - 1].focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(document.activeElement).toBe(nodes[0])

    nodes[0].focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(nodes[nodes.length - 1])
  })

  it('overlay focus ring is not the pink panel color', () => {
    act(() => {
      menuOpen.value = true
    })
    render(MenuOverlay() as ReactElement)
    const close = screen.getByRole('button', { name: /close menu/i })
    const outline = hex(pseudoDecl(close, 'focus', 'outline')?.replace(/^2px solid\s+/i, ''))
    expect(outline, 'close :focus outline color').toBeTruthy()
    expect(outline).not.toBe('#ff2d8a')
  })

  it('fullscreen menu can scroll when items overflow', () => {
    act(() => {
      menuOpen.value = true
    })
    render(MenuOverlay() as ReactElement)
    const dialog = document.getElementById('site-menu') as HTMLElement
    const y = dialog.style.overflowY || dialog.style.overflow
    expect(y === 'auto' || y === 'scroll').toBe(true)
    expect(dialog.style.touchAction).not.toBe('none')
  })
})
