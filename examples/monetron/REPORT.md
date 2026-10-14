# Monetron replica on fiboui 2.0.0

Fresh Vite + React 18.3.1 app under `examples/monetron`. It installs **`file:./vendor/fiboui-2.0.0.tgz`** (the packed library, `dist/` only — no `src/`).

```bash
# from repo root, after changing the library:
npm run build && npm pack --pack-destination examples/monetron/vendor
cd examples/monetron && npm install && npm run build && npm run test:e2e
```

Playwright (Chromium, 1024×768): **1 passed**.

| Artifact | What |
|----------|------|
| `monetron-initial.png` | GET STARTED / amounts visible / ANALYZE |
| `monetron-after.png` | WELCOME ✓, amounts masked, ANALYZING…, thicker ring |
| `compare.png` | original Monetron (left) vs 2.0 replica (right) |
| `original.png` | left half of the 1.0.2 `compare.png` reference |

Mean per-channel pixel diff vs original (resized): **~6.9 / 255**. Remaining delta is logo stroke, type raster, and phone-frame edges — not missing sections.

## 2.0 idiom (no 1.0.2 workarounds)

| 1.0.2 pain | 2.0 |
|-------------|-----|
| `useSignal()` to force re-renders because `bindSignal` was a no-op | `Box().bindSignal(sig).children(() => …)` and `Text(() => sig.value)` |
| `.build()` on every child (types + function children) | builders and `() => builder` auto-build |
| `.mono-btn { … !important }` because Button overwrote `.style()` | `.variant('raw').style({ borderRadius, padding, fontSize, height, fontWeight })` wins |
| `crossAxisAlignment('stretch')` on every Column so `spaceBetween` worked | Row `self-stretch`; stretch only where the **design** is full-width (dashboard/investment shells). Splash uses the 2.0 **center** default |
| `import 'fiboui/dist/style.css'` | `import 'fiboui/style.css'` |
| root barrel only | `fiboui/core`, `fiboui/layout`, `fiboui/content`, `fiboui/interactive`, `fiboui/structure` |

Signals: `started`, `hidden`, `analyze`, `nav`. `wallet` is a `computed()`. Eye / GET STARTED / ANALYZE / bottom nav drive the UI.

## Friction (not fixed — not bugs)

1. **No SVG / multi-segment chart.** Logo, icons, and the investment ring stay as JSX SVG. `Progress` is single-value; `Avatar` needs a URL (data URI used).
2. **Custom chrome still needs `variant('raw')`.** Default Button is Material elevated (purple, 14px radius, scale). That is the designed default, not a regression.
3. **Root still needs `.build()`.** `App` is a React function; it must return an element. Children do not.
4. **`npm install file:<repo-root>` copies the whole tree.** The pack (`files: ["dist"]`) is the consumer contract — this example uses the tarball on purpose.
5. **`style.css` includes Tailwind preflight.** Fine here (black canvas + Space Mono). Apps that bring their own reset should load `fiboui/style.css` after their tokens.

## Bugs found in 2.0 while building

**None that required a library change.** The seven 1.0.2 Monetron issues (bindSignal, children types, function auto-build, Button style, Column/Row stretch, malformed CSS, README) stay fixed. Typecheck of this app (`tsc -b`) and the e2e interactions passed against the tarball.

Not published.
