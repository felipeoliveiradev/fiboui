# 2.0.0 real-world verification

Packed from this branch after the 2.0 breaking release. **Not published to npm.** Node **v22.14.0**.

Tarball: `npm pack` → `fiboui-2.0.0.tgz`  
**501.5 kB** packed, **6.0 MB** unpacked, **34 files**, npm shasum `403edb0c2f92e965fb385dccb4934083e78e4887`  
(`dist/index.js` 58.4 kB gzip 13.3 kB; rolled `index.d.ts` 4.9 MB; `style.css` 538 kB; CLI under `dist/cli/`)

`tar` listing: **no `package/src/`**. `files` is `["dist"]` plus npm’s always-included `package.json` + `README.md`.

Consumers installed `file:../fiboui-2.0.0.tgz` into **fresh** apps (not this repo):

- Vite: `npm create vite@latest` (`react-ts`), then React **18.3.1**
- Next: `create-next-app@14.2.35` App Router, React **18.3.1**

## Vite + React 18.3.1 + TypeScript (strict)

| Check | Command | Result |
|-------|---------|--------|
| `moduleResolution: bundler` + `skipLibCheck: false` | `tsc -p tsconfig.bundler-strict.json --noEmit` | **exit 0** |
| `moduleResolution: NodeNext` + `verbatimModuleSyntax` | `tsc -p tsconfig.nodenext.json --noEmit` | **exit 0** |
| Production build | `vite build` | **exit 0**, 33 modules, CSS 494 kB in the app, **no** esbuild orphan-rule warning |
| `import 'fiboui/style.css'` | resolved to packed `dist/style.css` | **ok** |
| ESM-only `exports.require` | absent from `package.json` | **ok** |

Node 22 can `require('fiboui')` via [require(esm)](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require). That is **not** a CJS/UMD build — there is no `dist/*.cjs` and no `exports.require`. Next 14 loaded the ESM `import` map.

Screen: builders in `.children()` ending in `.onPress` / `.id`, function children, `bindSignal`, `useSignal`, Button user `.style()`, Column + Row `spaceBetween`, Column `items-center`, `FiboThemeProvider` Material 3 then Web.

### Playwright (Chromium)

`npx playwright test` against `vite preview` (port 4173): **1 passed (1.0s)**

Assertions:

- `#title` = `FiboUI 2.0.0 verify`
- `#builder-child` / `#fn-child` present (builders-as-children + function children)
- `#main-col` has `items-center` (2.0 Column default)
- Click `+ bind` → `bindSignal:1` and `useSignal:1`
- Click `+ useSignal` → `bindSignal:2` and `useSignal:2`
- `#styled-btn` computed: `border-radius: 0px`, `font-size: 20px`, `height: 30px`, `font-weight: 400`, `background-color: rgb(225, 29, 72)`
- `#space-row` width > 300px; Left/Right x-delta > 200px
- `--fibo-primary` on `:root` is `#6750A4` (Material), then `#3B82F6` after theme-web

Screenshots: `verify-vite-initial.png`, `verify-vite-after-clicks.png`

## Next.js 14.2.35 (App Router, React 18) SSR

| Check | Result |
|-------|--------|
| `next build` with `'use client'` page + `import 'fiboui/style.css'` in the layout | **success** — `/` 32.9 kB, First Load JS 120 kB |
| Prerendered `.next/server/app/index.html` | Contains `ssr-title`, `ssr-child`, `ssr-button`, `builder-child`, `fn-child`, `bindSignal`, `items-center` |
| Playwright vs `next start` :4174 | **1 passed (758 ms)** |

Playwright also clicked `+ bind` → `bindSignal:1`, checked Button styles, `spaceBetween` geometry, and `--fibo-primary: #6750A4`.

Screenshots: `verify-next-ssr.png`, `verify-next-after-clicks.png`

**Usage note:** Next App Router files that *call* `Button()` / `Column()` must be Client Components (`'use client'`). FiboUI is a hook/context UI kit, not an RSC factory API.

## Publish workflow (ESM-only, not executed)

Workflow: `.github/workflows/publish.yml`  
Version read: `node --input-type=commonjs -e "…JSON.parse(fs.readFileSync('package.json'))…"` → **`2.0.0`** (this is required now that `"type": "module"`). Covered by `tests/packaging.test.ts`.

Triggers: GitHub Release `published` **and** push to **`main`**. After a successful `main` publish the workflow opens **`vX.Y.Z`** with the matching CHANGELOG section as notes. Owner must add secret **`NPM_TOKEN`** before merging. This agent did **not** publish.

CI (`.github/workflows/ci.yml`) now also runs `npm run build` so the dts + ESM pack cannot regress silently.
