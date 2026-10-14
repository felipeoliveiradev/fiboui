# FiboUI landing

Marketing site for [fiboui@2.0.0](https://www.npmjs.com/package/fiboui), built **with** FiboUI.

Layout follows the repo’s consumer convention (`examples/`, same Vite + Playwright shape as `examples/monetron`) and the clean-architecture folders from `boilerplate/` (`src/main`, `src/modules/<name>/Views`).

```bash
cd examples/landing
npm install
npm run dev          # http://127.0.0.1:4176
npm run build
npm run preview
npx playwright install chromium
npm run test:e2e
```

Idiomatic 2.0 usage in this app:

- `import 'fiboui/style.css'`
- subpath imports (`fiboui/core`, `fiboui/layout`, `fiboui/content`, `fiboui/interactive`, `fiboui/structure`)
- `mount('#root', App)` — no root `.build()`
- builders + `signal` / `computed` / `.bindSignal()`
- `ListTile`, `Avatar`, `Progress` ring
