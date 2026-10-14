# Monetron fidelity pass

Packed `fiboui@2.0.0` consumer. Side-by-side: `compare.png`. Zoomed crops: `zoom-splash-btn.png`, `zoom-inv-btns.png`, `zoom-dash-tools.png`, `zoom-dash-header.png`, `zoom-sheet.png`. Per-region numbers: `diff.json` (filled after Playwright).

```bash
# from repo root
npm run build && npm pack --pack-destination examples/monetron/vendor
cd examples/monetron && npm install && npm run build && npm run test:e2e
```

## Classification

| Region / element | Mismatch vs original | Root cause | Fix |
|------------------|----------------------|------------|-----|
| GET STARTED shape | Pill (~half-height radius) vs ~2px rect | **(a)** Button had no `shape('rect')` / `size('xs')`; example used `variant('raw')` + `borderRadius: 8` | Button `shape('rect')` `size('xs')` `tone('inverse')` `variant('solid')` |
| GET STARTED / ANALYZE label | Left-aligned in raw buttons | **(a)** `variant('raw')` skipped flex centering | Button always `inline-flex items-center justify-center` |
| SET GOALS / ANALYZE | Unequal, rounded, long `.style()` | **(a)** no inverse outline/solid + `expand()` | `tone('inverse').shape('rect').size('xs').expand()` |
| Wallet chip | Stretched across header leftover | **(a)** Row always `w-full self-stretch` | `Row().hug()` |
| MONEY TRACKER | Wrapped onto two lines | **(a)** Text is `<p>` and wraps; no nowrap helper | `Text.nowrap()` + UA `<p>` margin defaulted to 0 |
| Stats columns | Centered labels/values | **(b)** Column 2.0 default is center | `.crossAxisAlignment('start')` in the example |
| `$650.5K` | Too bold | **(b)** example `.fontWeight(700)` | drop weight; inherit 400 |
| Investment ring | Custom SVG; Progress was single-arc | **(a)** no multi-segment / ring Progress | `Progress().variant('ring').segments([...])` |
| Avatar | Required a data-URI image | **(a)** Avatar had only `.image(url)` | `Avatar().icon('user')` / `.initials()` |
| TOOLS rows | Hand-rolled Row + Box + Chevron | **(a)** no ListTile; easy to miss divider/alignment | `ListTile().icon().title().chevron().divider()` |
| Root `.build()` | Extra ceremony | **(a)** React `createRoot` needs an element | `mount('#root', App)` / `<Fibo>` |
| Nav icons | Stroke/geometry off | **(b)** example SVGs | tighter Gauge/Bars/Trend/Apps paths |
| Portfolio deltas | — | **(b)** already muted gray; kept | `Text.muted()` |
| Cards / phone frame / type | Close; remaining Δ is logo stroke + raster | mix of SVG + font raster | left as-is (not a component gap) |

## Before / after (common cases)

**Inverse rect button**

```ts
// before
Button('GET STARTED').variant('raw').style({
  background: '#f2f2f2', color: '#000', border: '1px solid #f2f2f2',
  borderRadius: 8, padding: '9px 26px', fontSize: 10, letterSpacing: '0.12em',
  fontFamily: 'inherit', fontWeight: 400, height: 'auto', boxShadow: 'none',
})

// after
Button('GET STARTED').variant('solid').tone('inverse').shape('rect').size('xs')
```

**Paired actions**

```ts
// before
Button('SET GOALS').variant('raw').style({ ...ghost, flex: 1, /* left-aligned */ })

// after
Button('SET GOALS').variant('outline').tone('inverse').shape('rect').size('xs').expand()
```

**Compact chip / list row / ring / root**

```ts
Row().hug().border(LINE).children([icon, Text(() => wallet.value).muted()])
ListTile().icon(<Wallet />).title(T('ROBO-ADVISOR SERVICES', 8)).chevron().divider()
Progress().variant('ring').size(190).strokeWidth(2.4).segments([
  { value: 50, color: '#fff' }, { value: 25, color: '#888' },
])
mount('#root', App)   // App returns a builder — no .build()
```

## Per-region mean pixel Δ (0–255)

Filled by `scripts/compare.py` after `npm run test:e2e`. Target: visually near-identical; buttons and list should drop from the previous 24 / 16 / 8 band.

| Region | Δ |
|--------|---|
| *(run Playwright)* | |

Not published.
