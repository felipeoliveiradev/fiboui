# FiboUI landing

Marketing site for [fiboui@2.0.0](https://www.npmjs.com/package/fiboui), built **with** FiboUI.

Layout follows the repo’s consumer convention (`examples/`, same Vite + Playwright shape as `examples/monetron`) and the clean-architecture folders from `boilerplate/` (`src/main`, `src/modules/<name>/Views`).

```bash
# from the repo root
npm run dev:page     # http://127.0.0.1:4176

cd examples/landing
npm install
npm run dev
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
```

Idiomatic 2.0 usage in this app:

- `import 'fiboui/style.css'`
- subpath imports (`fiboui/core`, `fiboui/layout`, `fiboui/content`, `fiboui/interactive`, `fiboui/structure`, `fiboui/navigation`)
- `mount('#root', App)` — no root `.build()`
- **zero JSX** — `.ts` sources only; `Section` / `Nav` / `Main` / `Footer` / `Anchor` / `Code` / `Svg`
- builders + `signal` / `computed` / `.bindSignal()`
- `ListTile`, `Avatar`, `Progress` ring

`npm test` at the repo root includes `tests/landing-no-jsx.test.ts`, which fails if this folder grows a `.tsx` file or any JSX node.
