export type Category = 'all' | 'wear' | 'desk' | 'print'

export type Product = {
  id: string
  name: string
  category: Exclude<Category, 'all'>
  price: number
  compareAt?: number
  blurb: string
  detail: string
  material: string
  ship: string
  badge?: string
  accent: string
  ground: string
  mark: string
  sizes: string[]
}

export const categories: { label: string; value: Category }[] = [
  { label: 'All', value: 'all' },
  { label: 'Wear', value: 'wear' },
  { label: 'Desk', value: 'desk' },
  { label: 'Print', value: 'print' },
]

export const freeShipFrom = 75

export const products: Product[] = [
  {
    id: 'spiral-tee',
    name: 'Spiral Tee',
    category: 'wear',
    price: 48,
    compareAt: 58,
    blurb: 'Heavy cotton. Pink spiral hit.',
    detail:
      'Boxy cut in chalk-ink cotton. The pink spiral is screen-printed once — no second pass. Soft hand, sharp shoulder, made to wear like a return statement.',
    material: '220gsm organic cotton · Unisex fit',
    ship: 'Ships in 2–4 days · Free over $75',
    badge: 'Bestseller',
    accent: '#ff2d8a',
    ground: '#1a1216',
    mark: 'ST',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'lime-hoodie',
    name: 'Lime Hoodie',
    category: 'wear',
    price: 96,
    blurb: 'Fleece. Lime panel. Sharp hem.',
    detail:
      'Brushed fleece with a lime side panel. No drawcords. Raw cuff. Built for late mounts, cold rooms, and long reviews.',
    material: '420gsm cotton fleece · Drop shoulder',
    ship: 'Ships in 3–5 days · Free over $75',
    badge: 'New',
    accent: '#c8ff00',
    ground: '#141610',
    mark: 'LH',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'ink-cap',
    name: 'Ink Cap',
    category: 'wear',
    price: 32,
    blurb: 'Six-panel. Chalk stitch.',
    detail:
      'Unstructured six-panel in ink black. Chalk embroidery on the front. Soft peak, adjustable strap, everyday wear.',
    material: 'Washed cotton twill · One size',
    ship: 'Ships in 1–2 days',
    accent: '#f4f4f4',
    ground: '#121212',
    mark: 'IC',
    sizes: ['OS'],
  },
  {
    id: 'signal-tote',
    name: 'Signal Tote',
    category: 'desk',
    price: 28,
    blurb: 'Canvas. Laptop + plan.',
    detail:
      '14oz canvas tote with a reinforced base. Interior pocket fits a 14" laptop. Pink bar on the strap — the signal you carry.',
    material: '14oz cotton canvas · Reinforced base',
    ship: 'Ships in 2–3 days',
    accent: '#ff2d8a',
    ground: '#161014',
    mark: 'TO',
    sizes: ['OS'],
  },
  {
    id: 'builder-notebook',
    name: 'Builder Notebook',
    category: 'desk',
    price: 18,
    blurb: 'Dot grid. 120 pages.',
    detail:
      'A5 dot grid. Black cover, lime bookmark ribbon. Numbered pages for views, signals, and the next return.',
    material: 'A5 · 90gsm paper · Lay-flat bind',
    ship: 'Ships in 1–2 days',
    badge: 'Essentials',
    accent: '#c8ff00',
    ground: '#121410',
    mark: 'BN',
    sizes: ['OS'],
  },
  {
    id: 'focus-mug',
    name: 'Focus Mug',
    category: 'desk',
    price: 22,
    blurb: 'Matte black. 350ml.',
    detail:
      'Stoneware mug. Matte ink glaze outside, pink interior. Dishwasher safe. Keeps the focus mark warm through the stand-up.',
    material: 'Stoneware · 350ml · Matte glaze',
    ship: 'Ships in 2–4 days',
    accent: '#ff2d8a',
    ground: '#141014',
    mark: 'FM',
    sizes: ['OS'],
  },
  {
    id: 'poster-return',
    name: 'Return Poster',
    category: 'print',
    price: 36,
    blurb: 'A2. The function is the view.',
    detail:
      'A2 giclée on archival stock. Typography from the Stage. Ships rolled in a kraft tube. Frame not included.',
    material: 'A2 archival giclée · 200gsm',
    ship: 'Ships rolled · 3–6 days',
    accent: '#ffffff',
    ground: '#101010',
    mark: 'RP',
    sizes: ['A2'],
  },
  {
    id: 'poster-signal',
    name: 'Signal Poster',
    category: 'print',
    price: 36,
    blurb: 'A2. One value. Many readers.',
    detail:
      'A2 print of the signal meter motif. Lime and pink on ink. An edition of the kit — not of a stock photo.',
    material: 'A2 archival giclée · 200gsm',
    ship: 'Ships rolled · 3–6 days',
    badge: 'Limited',
    accent: '#c8ff00',
    ground: '#101208',
    mark: 'SP',
    sizes: ['A2'],
  },
]

export function productById(id: string) {
  return products.find((item) => item.id === id)
}

export function money(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function inkOn(accent: string) {
  return accent === '#ffffff' || accent === '#c8ff00' || accent === '#f4f4f4' ? '#000000' : '#ffffff'
}
