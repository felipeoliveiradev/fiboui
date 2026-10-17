import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { Box } from '../src';
import { PluginManager } from '../src/core/plugin/PluginManager';
import { StyleManager, getCss, getStyleTag } from '../src/core/styleManager';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withUndefinedDocument<T>(fn: () => Promise<T> | T): Promise<T> {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
  try {
    return await fn();
  } finally {
    if (desc) Object.defineProperty(globalThis, 'document', desc);
  }
}

afterEach(() => {
  StyleManager.resetForTests();
  PluginManager.resetForTests();
});

describe('W18-03 concurrent SSR StyleManager isolation', () => {
  it('overlapping renderToString + getStyleTag do not mix CSS across PluginManager.run requests', async () => {
    const [tagA, tagB] = await withUndefinedDocument(() =>
      Promise.all([
        PluginManager.run(async () => {
          renderToString(
            Box()
              .id('ssr-a')
              .hover((h) => h.opacity(0.31))
              .children('a') as ReactElement,
          );
          await delay(25);
          return getStyleTag();
        }),
        PluginManager.run(async () => {
          await delay(5);
          renderToString(
            Box()
              .id('ssr-b')
              .hover((h) => h.opacity(0.87))
              .children('b') as ReactElement,
          );
          await delay(25);
          return getStyleTag();
        }),
      ]),
    );

    expect(tagA).toMatch(/opacity:\s*0\.31/);
    expect(tagA).not.toMatch(/opacity:\s*0\.87/);
    expect(tagB).toMatch(/opacity:\s*0\.87/);
    expect(tagB).not.toMatch(/opacity:\s*0\.31/);
  });

  it('overlapping register() + getCss do not leak extras across PluginManager.run', async () => {
    const [cssA, cssB] = await withUndefinedDocument(() =>
      Promise.all([
        PluginManager.run(async () => {
          StyleManager.getInstance().register('z-index', '17');
          await delay(20);
          return getCss();
        }),
        PluginManager.run(async () => {
          await delay(5);
          StyleManager.getInstance().register('z-index', '42');
          await delay(20);
          return getCss();
        }),
      ]),
    );

    expect(cssA).toMatch(/z-index:\s*17/);
    expect(cssA).not.toMatch(/z-index:\s*42/);
    expect(cssB).toMatch(/z-index:\s*42/);
    expect(cssB).not.toMatch(/z-index:\s*17/);
  });
});
