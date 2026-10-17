import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { type ReactElement } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { menuOpen } from '../examples/site/src/modules/site/state'
import { MenuOverlay } from '../examples/site/src/modules/site/Views/MenuOverlay'
import { TopBar } from '../examples/site/src/modules/site/Views/NavBar'
import { CheckoutView } from '../examples/site/src/modules/site/Views/shop/CheckoutView'
import { shopBar } from '../examples/site/src/modules/site/Views/shop/ShopBar'

afterEach(() => {
  cleanup()
  menuOpen.value = false
})

beforeEach(() => {
  menuOpen.value = false
})

describe('W15-01 site leftover a11y', () => {
  it('hamburger is a named menu button (not an empty control)', () => {
    render(TopBar() as ReactElement)
    const menu = screen.getByRole('button', { name: /menu/i })
    expect(menu).toHaveAttribute('aria-label')
    expect(menu.getAttribute('aria-label')).toMatch(/menu/i)
    expect(menu).toHaveAttribute('aria-expanded', 'false')
  })

  it('hamburger aria-expanded tracks menuOpen', () => {
    render(TopBar() as ReactElement)
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    act(() => {
      menuOpen.value = true
    })
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('menu overlay close control is named', () => {
    act(() => {
      menuOpen.value = true
    })
    render(MenuOverlay() as ReactElement)
    expect(screen.getByRole('button', { name: /close menu/i })).toBeTruthy()
  })

  it('checkout labels are associated with their fields', () => {
    render(CheckoutView() as ReactElement)
    expect(screen.getByRole('textbox', { name: /full name/i })).toHaveAttribute('id', 'shop-name')
    expect(screen.getByRole('textbox', { name: /^email/i })).toHaveAttribute('id', 'shop-email')
    expect(screen.getByRole('textbox', { name: /shipping address/i })).toHaveAttribute(
      'id',
      'shop-address',
    )
    expect(screen.getByRole('textbox', { name: /order note/i })).toHaveAttribute('id', 'shop-note')
  })

  it('shop search label is associated with the field', () => {
    render(shopBar() as ReactElement)
    expect(screen.getByLabelText(/^search$/i)).toBeTruthy()
  })

  it('source keeps htmlFor on checkout and search labels', () => {
    const checkout = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/shop/CheckoutView.ts'),
      'utf8',
    )
    const bar = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/shop/ShopBar.ts'),
      'utf8',
    )
    expect(checkout).toContain(".htmlFor('shop-name')")
    expect(checkout).toContain(".htmlFor('shop-email')")
    expect(checkout).toContain(".htmlFor('shop-address')")
    expect(checkout).toContain(".htmlFor('shop-note')")
    expect(bar).toContain(".htmlFor('shop-search')")
  })
})
