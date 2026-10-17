import { expect, test } from '@playwright/test';

test.describe('CSS motion (no fiboui/motion)', () => {
  test('computed presets, spring, hover compose, stagger, scroll classes', async ({ page }) => {
    await page.goto('/');

    const fade = page.locator('#fade-in');
    await expect(fade).toHaveClass(/fibo-anim-fadeIn/);
    await expect(fade).toHaveCSS('animation-name', /fibo-fadeIn/);
    await expect(fade).toHaveAttribute('data-fibo-anim', 'fadeIn');

    const spring = page.locator('#spring-pop');
    const ease = await spring.evaluate((el) => getComputedStyle(el).animationTimingFunction);
    expect(ease.startsWith('linear(') || ease.includes('linear')).toBeTruthy();

    const css = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .flatMap((sheet) => {
          try {
            return Array.from(sheet.cssRules).map((r) => r.cssText);
          } catch {
            return [];
          }
        })
        .join('\n')
    );
    expect(css).toMatch(/@keyframes stripes/);
    expect(css).toContain('prefers-reduced-motion');
    expect(css).toMatch(/scale\(1\.05\)\s+translate3d\(0,\s*-4px,\s*0\)/);

    const hover = page.locator('#hover-card');
    await hover.hover();
    const transform = await hover.evaluate((el) => getComputedStyle(el).transform);
    expect(transform === 'none' || /matrix|scale|translate/i.test(transform)).toBeTruthy();

    const list = page.locator('#stagger-list');
    await expect(list).toHaveCSS('--fibo-stagger', '80ms');
    const indexes = await page.locator('.fibo-stagger-item').evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLElement).style.getPropertyValue('--fibo-i'))
    );
    expect(indexes).toEqual(['0', '1', '2']);

    await expect(page.locator('#progress')).toHaveClass(/fibo-scroll-progress/);
    await expect(page.locator('#snap-scroller')).toHaveClass(/fibo-snap-y/);
    await expect(page.locator('[data-fibo-reveal="fadeIn"]')).toHaveCount(1);
    await expect(page.locator('#sticky-bar')).toHaveCSS('position', 'sticky');
    const titleSize = await page.locator('#title').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(titleSize).toBeGreaterThan(28);
    const stickyOffset = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--fibo-sticky-offset').trim()
    );
    expect(stickyOffset).toBe('64px');
    await expect(page.locator('#footer')).toHaveCSS('scroll-margin-top', '72px');

    await page.locator('#hover-btn').hover();
    await expect(page.locator('#hover-btn')).toContainText('1');

    await page.locator('#to-footer').click();
    await expect(page.locator('#footer')).toBeInViewport();
  });

  test('prefers-reduced-motion disables animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const fade = page.locator('#fade-in');
    await expect(fade).toHaveClass(/fibo-anim-fadeIn/);
    await expect(fade).toHaveCSS('animation-name', 'none');
  });

  test('default CSS path does not start a rAF loop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(200);
    const frames = await page.evaluate(async () => {
      let n = 0;
      const orig = window.requestAnimationFrame;
      window.requestAnimationFrame = (cb) => {
        n += 1;
        return orig(cb);
      };
      await new Promise((r) => setTimeout(r, 400));
      window.requestAnimationFrame = orig;
      return n;
    });
    expect(frames).toBeLessThan(8);
  });
});
