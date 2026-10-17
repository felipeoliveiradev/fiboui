import { listSignal, signal } from 'fiboui'
import { freeShipFrom, productById, products } from './data'

export type ShopScreen = 'catalog' | 'product' | 'cart' | 'checkout' | 'success'
export type SortBy = 'featured' | 'price-asc' | 'price-desc' | 'name'
export type ShipMethod = 'standard' | 'express'
export type GridMode = 'standard' | 'bento'

export type CartLine = {
  key: string
  productId: string
  size: string
  qty: number
}

export const screen = signal<ShopScreen>('catalog')
export const productId = signal<string | null>(null)
export const category = signal<'all' | 'wear' | 'desk' | 'print'>('all')
export const query = signal('')
export const sortBy = signal<SortBy>('featured')
export const saleOnly = signal(false)
export const gridMode = signal<GridMode>('standard')
export const cart = listSignal<CartLine>([])
export const selectedSize = signal('M')
export const selectedQty = signal(1)
export const shipMethod = signal<ShipMethod>('standard')

/** Set from the checkout form on submit. Fields themselves stay uncontrolled. */
export const newsletter = signal(true)
export const orderId = signal('')

export function openCatalog() {
  screen.value = 'catalog'
  productId.value = null
}

export function openProduct(id: string) {
  const product = productById(id)
  if (!product) return
  productId.value = id
  selectedSize.value = product.sizes[0] ?? 'OS'
  selectedQty.value = 1
  screen.value = 'product'
}

export function openCart() {
  screen.value = 'cart'
}

export function openCheckout() {
  if (cart.value.length === 0) return
  screen.value = 'checkout'
}

export function setCategory(next: 'all' | 'wear' | 'desk' | 'print') {
  category.value = next
}

export function setQuery(value: string) {
  query.value = value
}

export function setSortBy(value: SortBy) {
  sortBy.value = value
}

export function setSaleOnly(value: boolean) {
  saleOnly.value = value
}

export function setGridMode(value: GridMode) {
  gridMode.value = value
}

export function setShipMethod(value: ShipMethod) {
  shipMethod.value = value
}

export function setSize(size: string) {
  selectedSize.value = size
}

export function setQty(qty: number) {
  selectedQty.value = Math.min(9, Math.max(1, qty))
}

export function bumpQty(delta: number) {
  setQty(selectedQty.value + delta)
}

function lineKey(id: string, size: string) {
  return `${id}::${size}`
}

export function addToCart() {
  const id = productId.value
  if (!id) return
  const size = selectedSize.value
  const qty = selectedQty.value
  const key = lineKey(id, size)
  const existing = cart.find((line) => line.key === key)
  if (existing) {
    cart.update(existing._id, { qty: Math.min(9, existing.qty + qty) })
  } else {
    cart.add({ key, productId: id, size, qty })
  }
}

export function setLineQty(key: string, qty: number) {
  if (qty < 1) {
    removeLine(key)
    return
  }
  cart.update((line) => line.key === key, { qty: Math.min(9, qty) })
}

export function removeLine(key: string) {
  cart.remove((line) => line.key === key)
}

export function clearCart() {
  cart.clear()
}

export function cartCount() {
  return cart.value.reduce((sum, line) => sum + line.qty, 0)
}

export function cartTotal() {
  return cart.value.reduce((sum, line) => {
    const product = productById(line.productId)
    return sum + (product?.price ?? 0) * line.qty
  }, 0)
}

export function shippingCost() {
  if (cartTotal() >= freeShipFrom) return 0
  return shipMethod.value === 'express' ? 18 : 8
}

export function catalogProducts() {
  const q = query.value.trim().toLowerCase()
  const cat = category.value
  let list = products.filter((item) => {
    if (cat !== 'all' && item.category !== cat) return false
    if (saleOnly.value && !item.compareAt) return false
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.blurb.toLowerCase().includes(q) ||
      item.category.includes(q)
    )
  })

  switch (sortBy.value) {
    case 'price-asc':
      list = [...list].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list = [...list].sort((a, b) => b.price - a.price)
      break
    case 'name':
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      break
  }
  return list
}

export function placeOrder(drops: boolean) {
  if (cart.value.length === 0) return false
  newsletter.value = drops
  orderId.value = `FB-${Date.now().toString(36).toUpperCase()}`
  cart.clear()
  screen.value = 'success'
  return true
}

export function resetShop() {
  newsletter.value = true
  orderId.value = ''
  openCatalog()
}
