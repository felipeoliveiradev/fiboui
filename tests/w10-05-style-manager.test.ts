import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Box } from '../src';
import {
  StyleManager,
  endSsrRequest,
  getCss,
  getStyleTag,
} from '../src/core/styleManager';
import { ensureInteractionFxCss } from '../src/core/ensureInteractionFx';
import { createRipple } from '../src/core/effects';

function liveCss(): string {
  const el = document.getElementById('fibo-dynamic-styles') as HTMLStyleElement | null;
  if (!el) return '';
  const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : '';
  return `${el.textContent ?? ''}\n${rules}`;
}

afterEach(() => {
  StyleManager.resetForTests();
});

describe('W10-05 StyleManager live sheet', () => {
  it('recreates #fibo-dynamic-styles after the previous node is unmounted', () => {
    StyleManager.resetForTests();
    const mgr = StyleManager.getInstance();
    mgr.register('color', 'rgb(1, 2, 3)');
    const first = document.getElementById('fibo-dynamic-styles');
    expect(first).toBeTruthy();
    first!.remove();
    expect(document.getElementById('fibo-dynamic-styles')).toBeNull();

    const cls = mgr.register('background-color', 'rgb(4, 5, 6)');
    const again = document.getElementById('fibo-dynamic-styles');
    expect(again).toBeTruthy();
    expect(again!.isConnected).toBe(true);
    expect(cls).toMatch(/^fibo-/);
    expect(liveCss()).toMatch(/background-color:\s*rgb\(4,\s*5,\s*6\)/i);
  });

  it('reset() empties the live sheet so a simulated client starts cold', () => {
    const mgr = StyleManager.getInstance();
    mgr.register('color', 'rgb(9, 8, 7)');
    expect(getCss()).toMatch(/rgb\(9,\s*8,\s*7\)/);
    expect(liveCss()).toMatch(/rgb\(9,\s*8,\s*7\)/);

    StyleManager.resetForTests();
    expect(getCss()).not.toMatch(/rgb\(9,\s*8,\s*7\)/);
    expect(liveCss()).not.toMatch(/rgb\(9,\s*8,\s*7\)/);
  });

  it('injectExtra after register keeps prior rules in the live sheet', () => {
    StyleManager.resetForTests();
    const mgr = StyleManager.getInstance();
    mgr.register('color', 'hotpink');
    ensureInteractionFxCss();
    expect(getCss()).toMatch(/hotpink/);
    expect(getCss()).toMatch(/fibo-fx-grow/);
    expect(liveCss()).toMatch(/hotpink/);
  });
});

describe('W10-05 SSR snapshot reset (do not undo)', () => {
  it('getStyleTag on the server does not leak request A rules into request B', () => {
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
    try {
      StyleManager.getInstance().register('opacity', '0.31');
      const tagA = getStyleTag();
      expect(tagA).toMatch(/opacity:\s*0\.31/);
      expect(getCss()).not.toMatch(/opacity:\s*0\.31/);

      StyleManager.getInstance().register('opacity', '0.87');
      const tagB = getStyleTag();
      expect(tagB).toMatch(/opacity:\s*0\.87/);
      expect(tagB).not.toMatch(/opacity:\s*0\.31/);
    } finally {
      if (desc) Object.defineProperty(globalThis, 'document', desc);
    }
  });

  it('endSsrRequest clears collected extras', () => {
    StyleManager.getInstance().register('z-index', '17');
    expect(getCss()).toMatch(/z-index:\s*17/);
    endSsrRequest();
    expect(getCss()).not.toMatch(/z-index:\s*17/);
  });
});

describe('W10-05 effect() resting transform', () => {
  it('hoverEffect does not stamp inline translate3d rest', () => {
    StyleManager.resetForTests();
    const { container } = render(
      Box().id('fx-rest').hoverEffect('bob').children('x').build(),
    );
    const el = container.querySelector('#fx-rest') as HTMLElement;
    expect(el.style.transform).toBe('');
    expect(el.className).toMatch(/fibo-fx-bob/);
  });
});

describe('W10-05 createRipple', () => {
  it('is a no-op without a button (SSR / unmounted)', () => {
    expect(() =>
      createRipple({ clientX: 0, clientY: 0 }, null as unknown as HTMLElement),
    ).not.toThrow();
  });
});
