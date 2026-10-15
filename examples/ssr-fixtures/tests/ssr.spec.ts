import { expect, test, type ConsoleMessage } from '@playwright/test';

const FIXTURES = [
  { name: 'Vite SSR', url: 'http://127.0.0.1:4173' },
  { name: 'Next.js App Router', url: 'http://127.0.0.1:3015' },
] as const;

function isNoise(text: string): boolean {
  return /Download the React DevTools|React DevTools|Fast Refresh|\[HMR\]|hot-reloaded|webpack-hmr/i.test(
    text
  );
}

function isBad(msg: ConsoleMessage): boolean {
  const type = msg.type();
  if (type !== 'error' && type !== 'warning') return false;
  const text = msg.text();
  if (isNoise(text)) return false;
  return true;
}

test.describe('SSR fixtures hydrate cleanly', () => {
  for (const fixture of FIXTURES) {
    test(`${fixture.name}: no console errors and identical #ssr-root`, async ({
      browser,
    }) => {
      const noscript = await browser.newContext({ javaScriptEnabled: false });
      const ssrPage = await noscript.newPage();
      await ssrPage.goto(fixture.url, { waitUntil: 'domcontentloaded' });
      const before = await ssrPage.locator('#ssr-root').innerHTML();
      expect(before.length).toBeGreaterThan(20);
      expect(before).toContain('Hydration audit');
      await ssrPage.close();
      await noscript.close();

      const context = await browser.newContext();
      const page = await context.newPage();
      const bad: string[] = [];
      page.on('console', (msg) => {
        if (isBad(msg)) bad.push(`[${msg.type()}] ${msg.text()}`);
      });
      page.on('pageerror', (err) => bad.push(`[pageerror] ${err.message}`));

      await page.goto(fixture.url, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.__FIBO_HYDRATED__ === true, null, {
        timeout: 20_000,
      });
      const after = await page.locator('#ssr-root').innerHTML();
      expect(after).toBe(before);
      expect(bad).toEqual([]);
      await page.close();
      await context.close();
    });
  }
});
