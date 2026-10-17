# SSR fixtures

Vite SSR and Next.js 15 App Router apps used to prove FiboUI hydrates without warnings.

From the repo root:

```bash
npm run build
npm --prefix examples/ssr-fixtures install
npx --prefix examples/ssr-fixtures playwright install chromium
npm --prefix examples/ssr-fixtures run test:e2e
```

- Vite injects `getStyleTag()` after `renderToString` (style tag outside `#root`).
- Next App Router page is a **Server Component** (`page()` from the `react-server` export). `FiboStyles` is appended by `page()`. A tiny client island sets `window.__FIBO_HYDRATED__` for Playwright.
