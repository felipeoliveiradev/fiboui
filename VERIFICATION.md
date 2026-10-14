# 1.0.3 real-world verification

Packed from this branch after the consumer-packaging fixes. **Not published to npm.**

Tarball: `npm pack` → `fiboui-1.0.3.tgz`  
Final pack: **764.6 kB**, 150 files, shasum `a5ab3900bd7ba45c83c1191a33c5444dc1c6f79e`  
(`dist/index.esm.js` 417 kB gzip 80 kB; `index.cjs.js` 422 kB; rolled-up `index.d.ts` 4.6 MB; `style.css` 677 kB)

Consumers installed the tarball with `file:../fiboui-1.0.3.tgz` into **fresh** apps (not this repo).

## Vite + React 18.3.1 + TypeScript (strict)

| Check | Command | Result |
|-------|---------|--------|
| `moduleResolution: bundler` | `tsc -p tsconfig.json --noEmit` | **exit 0** |
| `moduleResolution: NodeNext` + `verbatimModuleSyntax` | `tsc -p tsconfig.nodenext.json --noEmit` | **exit 0** |
| Production build | `vite build` | **exit 0**, 34 modules, **no esbuild warning** about `background-color: var(--fibo-primary-container)` |
| `import 'fiboui/style.css'` | resolved to `dist/style.css` | **ok** (538 kB CSS in the app) |

Screen exercised: builders in `.children()` ending in `.onPress` / `.id`, function children, `bindSignal`, `useSignal`, Button user `.style()`, Column + Row `spaceBetween`, `FiboThemeProvider` theme `web`.

### Playwright

`npx playwright test` against `vite preview` (Chromium): **1 passed (843 ms)**

Assertions:

- `#title` = `FiboUI 1.0.3 verify`
- Click `+ bind` → `bindSignal:1` and `useSignal:1`
- Click `+ useSignal` → `bindSignal:2` and `useSignal:2`
- `#styled-btn` computed: `border-radius: 0px`, `font-size: 20px`, `height: 30px`, `font-weight: 400`, `background-color: rgb(225, 29, 72)`
- `#space-row` width > 300px; Left/Right x-delta > 200px

Screenshots: `verify-vite-initial.png`, `verify-vite-after-clicks.png`

## Failures found in the packed 1.0.3 (fixed on this branch)

1. **Types / NodeNext** — `vite-plugin-dts` emitted `dist/index.d.ts` as `export * from './src/index'` plus per-file `.d.ts` without `.js` extensions. **Fix:** `tsconfig.build.json` + `rollupTypes: true`.
2. **React 18 Vite crash** — `react-dom/client` was not Rollup-external, so the ESM inlined React 19 DOM (`react.transitional.element`). Runtime: `Cannot read properties of undefined (reading 'S')`. **Fix:** externalize `react`, `react-dom/*`, `scheduler`. ESM dropped from **1.91 MB → 417 kB**.
3. **Next.js SSR crash** — `exports.require` pointed at **UMD**. Next’s server `require('fiboui')` then failed with `createContext is not a function`. **Fix:** emit `index.cjs.js` (`require("react")`) and point `main` / `exports.require` at it.

## Next.js 14.2.35 (App Router, React 18) SSR smoke

| Check | Result |
|-------|--------|
| `next build` with a **server** page calling builders | **fail** `createContext is not a function` until CJS fix; after CJS, still fails unless the page is a Client Component (builders use hooks/context — not RSC-callable factories) |
| `next build` with `'use client'` page | **success** — prerendered `/` 45.7 kB |
| `curl` HTML | Contains `<h1 id="ssr-title">FiboUI Next SSR</h1>`, `#ssr-child`, `<button type="button">ssr-button</button>` (SSR markup, not client-only) |
| Browser | `#ssr-title` / `#ssr-child` present; screenshot `verify-next-ssr.png` |

**Usage note:** Next App Router files that *call* `Button()` / `Column()` must be Client Components (`'use client'`). FiboUI is a hook/context UI kit, not an RSC primitive API.

## GitHub publish (not executed)

Workflow: `.github/workflows/publish.yml`  
Triggers: GitHub Release `published` **and** `push` to **`main`**.  
This repo currently has only `teste`. **Create and set `main`** before the workflow can publish on merge.  
Owner must add secret **`NPM_TOKEN`**. This agent did **not** publish.
