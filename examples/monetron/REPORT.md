# Monetron fidelity pass

Packed `fiboui@2.0.0` consumer. Chromium 1024×768. Playwright **1 passed**.

| Artifact | What |
|----------|------|
| `compare.png` | original (left) vs replica (right) |
| `zoom-splash-btn.png` | GET STARTED 3× |
| `zoom-inv-btns.png` | SET GOALS / ANALYZE 3× |
| `zoom-dash-tools.png` | TOOLS list 3× |
| `zoom-dash-header.png` | avatar + wallet chip 3× |
| `zoom-sheet.png` | the four zooms stacked |
| `diff.json` | per-region mean Δ |

```bash
# from repo root
npm run build && npm pack --pack-destination examples/monetron/vendor
cd examples/monetron && rm -rf node_modules/fiboui && npm install && npm run build && npm run test:e2e
```

## Per-region mean pixel Δ (0–255)

Original.png is a 1029-wide sliver; compare crops it to 1024 so the phones line up. Tight button crops are **font-raster dominated** (Space Mono hinting): measured GET STARTED is **124×33 vs 124×33**, 1px lower. Structure matches; remaining Δ is glyph pixels, not chrome.

| Region | Δ | Notes |
|--------|--:|-------|
| **overall** | **6.12** | was ~6.9 |
| splash-logo | 9.24 | SVG stroke / gradient |
| splash-title | 13.92 | type raster |
| splash-btn | 24.19 | same 124×33 sharp rect; tracking/hinting |
| dash-header | 14.93 | avatar silhouette + chip icon |
| dash-stats | 9.97 | left-aligned (was centered) |
| dash-tracker | 13.86 | MONEY TRACKER now one line |
| dash-tools | 7.75 | ListTile rows + card-chip icons |
| dash-nav | 4.44 | |
| inv-header | 4.68 | |
| inv-ring | 18.08 | Progress ring + type in the hole |
| inv-legend | 16.67 | type raster |
| inv-btns | 23.28 | equal sharp rects, centered labels |
| inv-portfolio | 9.11 | muted deltas |

Geometry check (white-pixel bbox): GET STARTED original `126,609 124×33` / replica `126,610 124×33`. ANALYZE original `843,489 124×31` / replica `842,491 126×33`.

## Classification

| Region / element | Mismatch vs original | Root cause | Fix |
|------------------|----------------------|------------|-----|
| GET STARTED shape | Pill / 8px radius vs sharp 124×33 rect | **(a)** Button had no `shape` / `size('xs')`; example used `raw` + `borderRadius: 8` | `shape('sharp').size('xs').tone('inverse').variant('solid')` |
| GET STARTED / ANALYZE label | Left-aligned in `raw` | **(a)** raw skipped flex centering | Button always `inline-flex items-center justify-center` |
| SET GOALS / ANALYZE | Unequal, rounded, long `.style()` | **(a)** no inverse outline/solid + `expand()` | `tone('inverse').shape('sharp').size('xs').expand()` |
| Wallet chip | Stretched across header leftover | **(a)** Row always `w-full self-stretch` | `Row().hug()` |
| MONEY TRACKER | Wrapped onto two lines | **(a)** Text is `<p>` and wraps; UA margin | `Text.nowrap()`; default margin 0 |
| Stats columns | Centered labels/values | **(b)** Column 2.0 default is center | `.crossAxisAlignment('start')` |
| `$650.5K` | Too bold | **(b)** example `.fontWeight(700)` | dropped; inherit 400 |
| Investment ring | Hand-rolled SVG | **(a)** Progress was single-arc | `Progress().variant('ring').segments([...])` |
| Avatar | Required a data-URI | **(a)** only `.image(url)` | `Avatar().icon('user')` / `.initials()` |
| TOOLS rows | Hand-rolled Row + Box | **(a)** no ListTile | `ListTile().icon().title().chevron().divider()` |
| List / chip glyph | Wallet vs card-with-chip | **(b)** example SVG | `I.Card` (rounded rect + chip) |
| Root `.build()` | Extra ceremony | **(a)** `createRoot` needs an element | `mount('#root', App)` |
| Nav icons | Stroke/geometry off | **(b)** example SVGs | tighter Gauge/Bars/Trend/Apps |
| Button tracking / type | Heavier original glyphs | **(b)** Space Mono raster ≠ source file | same face; leftover Δ is hinting |
| Cards / phone / logo | Close | mix of SVG + font raster | not a component gap |

## Before / after (common cases)

**Inverse rect button**

```ts
// before — 14 lines of raw chrome, still a pill
Button('GET STARTED').variant('raw').style({
  background: '#f2f2f2', color: '#000', border: '1px solid #f2f2f2',
  borderRadius: 8, padding: '9px 26px', fontSize: 10, letterSpacing: '0.12em',
  fontFamily: 'inherit', fontWeight: 400, height: 'auto', boxShadow: 'none',
})

// after
Button('GET STARTED').variant('solid').tone('inverse').shape('sharp').size('xs')
```

**Paired actions**

```ts
// before
Button('SET GOALS').variant('raw').style({ ...ghost, flex: 1 })

// after
Button('SET GOALS').variant('outline').tone('inverse').shape('sharp').size('xs').expand()
```

**Chip, list row, ring, root**

```ts
Row().hug().border(LINE).children([icon, Text(() => wallet.value).muted()])
ListTile().icon(<Card />).title(T('ROBO-ADVISOR SERVICES', 8)).chevron().divider()
Progress().variant('ring').size(190).strokeWidth(2.4).segments([
  { value: 50, color: '#fff' }, { value: 25, color: '#888' },
])
mount('#root', App)   // App returns a builder — no .build()
```

Library tests: **91 passed** (`tests/ergonomics-2.0.test.tsx` covers the new APIs).

Not published.
