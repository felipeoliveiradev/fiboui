import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const artifacts = '/opt/cursor/artifacts/screenshots';

test('landing: content, signals, screenshots', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero-title')).toHaveText(/Build UIs\s+like you think/);
  await expect(page.locator('#hero-amount')).toHaveText('$3,845.75');
  await expect(page.locator('#hero-ring-value')).toHaveText('64');
  await expect(page.locator('#hero-tile')).toContainText('Builders');

  await page.locator('#amount-inc').click();
  await expect(page.locator('#hero-amount')).toHaveText('$3,870.75');
  await expect(page.locator('#hero-delta')).toHaveText('+$25.00');
  await expect(page.locator('#hero-ring-value')).toHaveText('70');
  await expect(page.locator('#show-amount')).toHaveText('$3,870.75');

  await page.locator('#hero-tile').click();
  await expect(page.locator('#hero-tile')).toContainText('Signals');

  await page.locator('#copy-install').click();
  await expect(page.locator('#copy-install')).toHaveText('Copied');

  await page.locator('#show-reset').click();
  await expect(page.locator('#hero-amount')).toHaveText('$3,845.75');
  await expect(page.locator('#hero-ring-value')).toHaveText('64');

  await page.screenshot({
    path: resolve(process.cwd(), 'landing-desktop.png'),
    fullPage: true,
  });
  await page.screenshot({
    path: `${artifacts}/landing-desktop.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#hero-title')).toBeVisible();
  await page.screenshot({
    path: resolve(process.cwd(), 'landing-mobile.png'),
    fullPage: true,
  });
  await page.screenshot({
    path: `${artifacts}/landing-mobile.png`,
    fullPage: true,
  });

  execFileSync('python3', [resolve(process.cwd(), 'scripts/side-by-side.py')], {
    stdio: 'inherit',
  });
});
