import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bindHotkeys,
  delay,
  goHash,
  open,
  openExternal,
  writeClipboard,
} from '../src/core/platform';

describe('platform facade', () => {
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

  it('open / openExternal wrap window.open', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    open('https://example.com');
    openExternal('https://npmjs.com');
    expect(spy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );
    expect(spy).toHaveBeenCalledWith(
      'https://npmjs.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('goHash sets location.hash and scrolls', () => {
    const el = document.createElement('div');
    el.id = 'architecture';
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    goHash('architecture');
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

  it('delay schedules and can cancel', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const cancel = delay(100, fn);
    vi.advanceTimersByTime(50);
    cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
