import { type ReactElement } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { CartView } from '../examples/site/src/modules/site/Views/shop/CartView'
import { CheckoutView } from '../examples/site/src/modules/site/Views/shop/CheckoutView'
import { freeShipFrom, money } from '../examples/site/src/modules/site/Views/shop/data'
import {
  addToCart,
  cartTotal,
  clearCart,
  openCart,
  openCheckout,
  openProduct,
  resetShop,
  setShipMethod,
  shippingCost,
} from '../examples/site/src/modules/site/Views/shop/state'

afterEach(() => {
  cleanup()
  resetShopState()
})

beforeEach(() => {
  resetShopState()
})

function resetShopState() {
  clearCart()
  setShipMethod('standard')
  resetShop()
}

function bagSpiralTee() {
  openProduct('spiral-tee')
  addToCart()
  openCart()
}

function totalRowText() {
  const label = screen.getByText('Total')
  return label.parentElement?.textContent ?? ''
}

describe('W25-03 shop cart total includes shipping', () => {
  it('bag total is merchandise + standard shipping when under the free threshold', () => {
    act(() => {
      bagSpiralTee()
    })
    const merchandise = cartTotal()
    expect(merchandise).toBe(48)
    expect(merchandise).toBeLessThan(freeShipFrom)
    expect(shippingCost()).toBe(8)

    render(CartView() as ReactElement)

    expect(totalRowText()).toContain(money(merchandise + 8))
    expect(totalRowText()).not.toBe(`Total${money(merchandise)}`)
  })

  it('bag total matches checkout grand total for express under the threshold', () => {
    act(() => {
      bagSpiralTee()
      setShipMethod('express')
    })
    expect(shippingCost()).toBe(18)
    const grand = cartTotal() + shippingCost()

    render(CartView() as ReactElement)
    expect(totalRowText()).toContain(money(grand))
    cleanup()

    act(() => {
      openCheckout()
    })
    render(CheckoutView() as ReactElement)
    expect(totalRowText()).toContain(money(grand))
  })

  it('bag total equals merchandise when free shipping unlocks', () => {
    act(() => {
      openProduct('lime-hoodie')
      addToCart()
      openCart()
    })
    const merchandise = cartTotal()
    expect(merchandise).toBeGreaterThanOrEqual(freeShipFrom)
    expect(shippingCost()).toBe(0)

    render(CartView() as ReactElement)
    expect(totalRowText()).toContain(money(merchandise))
    expect(screen.getByText('Free')).toBeTruthy()
  })
})
