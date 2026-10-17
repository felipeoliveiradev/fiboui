import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { type ReactElement } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from '../examples/site/src/main/App'
import { route } from '../examples/site/src/modules/site/route'
import { menuOpen } from '../examples/site/src/modules/site/state'

afterEach(() => {
  cleanup()
  menuOpen.value = false
  route.value = 'home'
})

beforeEach(() => {
  menuOpen.value = false
  route.value = 'home'
})

describe('W25-05 App menu scroll lock', () => {
  it('does not stamp the lock class while the menu is closed', () => {
    render(App() as ReactElement)
    expect(document.querySelector('.site-menu-open')).toBeNull()
    expect(screen.queryByRole('dialog', { name: /site menu/i })).toBeNull()
    expect(document.querySelector('[data-site-main][inert]')).toBeNull()
  })

  it('locks the shell and inerts the page when the menu opens (live, not a builder snapshot)', () => {
    render(App() as ReactElement)

    act(() => {
      menuOpen.value = true
    })

    const dialog = screen.getByRole('dialog', { name: /site menu/i })
    const lock = document.querySelector('.site-menu-open') as HTMLElement | null
    expect(lock).toBeTruthy()
    expect(lock).not.toBe(dialog)
    expect(lock!.style.overflowY).toBe('hidden')
    expect(lock!.style.height).toBe('100dvh')

    const main = document.querySelector('[data-site-main]') as HTMLElement | null
    expect(main).toBeTruthy()
    expect(main).toHaveAttribute('inert')
    expect(main).toHaveAttribute('aria-hidden', 'true')
    expect(main!.contains(dialog)).toBe(false)
  })

  it('drops the lock when the menu closes', () => {
    render(App() as ReactElement)

    act(() => {
      menuOpen.value = true
    })
    expect(document.querySelector('.site-menu-open')).toBeTruthy()

    act(() => {
      menuOpen.value = false
    })

    expect(document.querySelector('.site-menu-open')).toBeNull()
    expect(screen.queryByRole('dialog', { name: /site menu/i })).toBeNull()
    expect(document.querySelector('[data-site-main][inert]')).toBeNull()
  })

  it('site.css locks the document via :has(#site-menu) and quiets shop motion', () => {
    const css = readFileSync(
      resolve(__dirname, '../examples/site/src/site.css'),
      'utf8',
    )
    expect(css).toContain('html:has(#site-menu)')
    expect(css).toContain('body:has(#site-menu)')
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
