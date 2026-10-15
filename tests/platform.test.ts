import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindHotkeys, openExternal, writeClipboard } from '../src/core/platform';
import { scrollTo } from '../src/core/scroll';

describe('platform facade (only what scrollTo does not cover)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writeClipboard uses navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    await expect(writeClipboard('hi')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hi');
  });

  it('openExternal wraps window.open', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    openExternal('https://example.com');
    expect(spy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('scrollTo({ hash: true }) sets location.hash and scrolls', () => {
    const el = document.createElement('div');
    el.id = 'architecture';
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    scrollTo('architecture', { hash: true });
    expect(window.location.hash).toBe('#architecture');
    expect(el.scrollIntoView).toHaveBeenCalled();
    el.remove();
  });

  it('bindHotkeys listens for metaOrCtrl+k', () => {
    const run = vi.fn();
    const unbind = bindHotkeys([{ key: 'k', metaOrCtrl: true, run }]);
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
    expect(run).toHaveBeenCalledTimes(1);
    unbind();
  });
});
