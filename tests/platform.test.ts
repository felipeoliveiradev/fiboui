import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bindHotkeys,
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

  it('open is canonical; openExternal is the same function (no break)', () => {
    expect(openExternal).toBe(open);
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    open('https://example.com');
    expect(spy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('goHash delegates to scrollTo({ hash: true })', () => {
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
});
