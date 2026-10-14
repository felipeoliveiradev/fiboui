import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const artifacts = '/opt/cursor/artifacts/screenshots';

test('Monetron 2.0: bindSignal, mask, analyze, nav, compare', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#get-started')).toHaveText('GET STARTED');
  await expect(page.locator('#wallet')).toHaveText('$ 195,654.80');
  await expect(page.locator('#stat-saving')).toHaveText('$44,770.00');
  await expect(page.locator('#analyze')).toHaveText('ANALYZE');
  await expect(page.locator('#delta')).toHaveText('-8.37%');

  await page.screenshot({ path: `${artifacts}/monetron-initial.png` });
  await page.screenshot({ path: resolve(process.cwd(), 'monetron-initial.png') });

  await page.locator('#get-started').click();
  await expect(page.locator('#get-started')).toHaveText('WELCOME ✓');

  await page.locator('#eye').click();
  await expect(page.locator('#wallet')).toHaveText('$ ••••••');
  await expect(page.locator('#stat-saving')).toHaveText('••••••');
  await expect(page.locator('#hold-stocks')).toHaveText('••••••');
  await expect(page.locator('#total')).toHaveText('••••');

  await page.locator('#eye').click();
  await expect(page.locator('#wallet')).toHaveText('$ 195,654.80');
  await expect(page.locator('#total')).toHaveText('$650.5K');
  await page.locator('#eye').click();
  await expect(page.locator('#wallet')).toHaveText('$ ••••••');

  await page.locator('#analyze').click();
  await expect(page.locator('#analyze')).toHaveText('ANALYZING…');
  await expect(page.locator('#delta')).toHaveText('vs 30D: -8.37%');

  await page.locator('#nav-2').click();

  await page.screenshot({ path: `${artifacts}/monetron-after.png` });
  await page.screenshot({ path: resolve(process.cwd(), 'monetron-after.png') });

  const styled = page.locator('#get-started');
  await expect(styled).toHaveCSS('border-radius', '2px');
  await expect(styled).toHaveCSS('font-size', '10px');
  await expect(styled).toHaveCSS('font-weight', '400');
  await expect(styled).toHaveCSS('letter-spacing', /.*/);

  const analyzeBtn = page.locator('#analyze');
  await expect(analyzeBtn).toHaveCSS('border-radius', '2px');
  await expect(page.locator('#set-goals')).toHaveCSS('border-radius', '2px');

  execFileSync('python3', [resolve(process.cwd(), 'scripts/compare.py')], { stdio: 'inherit' });
});
