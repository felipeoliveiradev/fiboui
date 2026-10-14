import { expect, test } from '@playwright/test';

test.describe('CSS motion demo', () => {
  test('computed styles use CSS animations, not rAF loops', async ({ page }) => {
    await page.addInitScript(() => {
      const started = performance.now();
      const calls: number[] = [];
      const orig = window.requestAnimationFrame.bind(window);
      (window as unknown as { __fiboRaf: number[] }).__fiboRaf = calls;
      window.requestAnimationFrame = (cb: FrameRequestCallback) => {
        calls.push(performance.now() - started);
        return orig(cb);
      };
    });

    await page.goto('/');
    await page.locator('#fade-title, #title').first().waitFor();

    const fade = page.locator('#preset-fadeIn');
    const animName = await fade.evaluate((el) => getComputedStyle(el).animationName);
    const animDur = await fade.evaluate((el) => getComputedStyle(el).animationDuration);
    expect(animName).toMatch(/fibo-fadeIn/);
    expect(animDur).toMatch(/0\.3s|300ms/);

    const spring = page.locator('#spring-box');
    const ease = await spring.evaluate((el) => getComputedStyle(el).animationTimingFunction);
    expect(ease).toMatch(/linear/);

    const hover = page.locator('#hover-card');
    const transition = await hover.evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(transition).toMatch(/transform|all/);

    const staggerDelay = await page.locator('#stagger-1').evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        delay: style.animationDelay,
        i: (el as HTMLElement).style.getPropertyValue('--fibo-i')
          || getComputedStyle(el).getPropertyValue('--fibo-i')
          || (el.parentElement ? getComputedStyle(el.parentElement).getPropertyValue('--fibo-i') : ''),
      };
    });
    expect(staggerDelay.i === '1' || staggerDelay.delay !== '0s').toBeTruthy();

    const sheet = await page.locator('[data-fibo-motion]').first().evaluate((el) => el.textContent ?? '');
    expect(sheet).toContain('@keyframes fibo-fadeIn');
    expect(sheet).toContain('prefers-reduced-motion');
    expect((sheet.match(/@keyframes fibo-fadeIn/g) ?? []).length).toBe(1);

    await hover.hover();
    await page.waitForTimeout(120);

    const rafCalls = await page.evaluate(() => (window as unknown as { __fiboRaf: number[] }).__fiboRaf.length);
    // The browser (and React StrictMode) may schedule a handful of frames.
    // A JS spring loop would keep scheduling. Bound the count after settle.
    expect(rafCalls).toBeLessThan(40);

    await page.evaluate(() => {
      (window as unknown as { __fiboRaf: number[] }).__fiboRaf.length = 0;
    });
    await page.waitForTimeout(200);
    const extra = await page.evaluate(() => (window as unknown as { __fiboRaf: number[] }).__fiboRaf.length);
    expect(extra).toBeLessThan(8);
  });

  test('scroll reveal toggles fibo-inview via IntersectionObserver', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#reveal-card, [data-fibo-reveal="fadeUp"]').first();
    await expect(card).toBeAttached();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/fibo-inview/);
    const opacity = await card.evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThan(0.9);
  });
});
