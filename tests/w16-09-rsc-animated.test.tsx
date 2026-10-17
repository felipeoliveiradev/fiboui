import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AnimatedWrapper } from '../src/server-shims/passthrough';

function withUndefinedDocument<T>(fn: () => T): T {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
  try {
    return fn();
  } finally {
    if (desc) Object.defineProperty(globalThis, 'document', desc);
  }
}

describe('W16-09 RSC AnimatedWrapper', () => {
  it('does not crash cloneElement on text children', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        createElement(AnimatedWrapper, {
          animatedProps: new Map([['scale', { value: 1.5 }]]),
          children: 'hi' as never,
        }),
      ),
    );
    expect(html).toContain('hi');
    expect(html).toMatch(/scale\(1\.5\)/);
  });

  it('omits NaN and Infinity transform tokens so finite ones still apply', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        createElement(AnimatedWrapper, {
          animatedProps: new Map<string, { value: unknown }>([
            ['scale', { value: Number.NaN }],
            ['translateX', { value: 10 }],
            ['rotate', { value: Number.POSITIVE_INFINITY }],
          ]),
          children: createElement('div', { id: 'box' }, 'box') as never,
        }),
      ),
    );
    expect(html).not.toMatch(/NaN/i);
    expect(html).not.toMatch(/Infinity/);
    expect(html).toMatch(/translateX\(10px\)/);
    expect(html).not.toMatch(/scale\(/);
    expect(html).not.toMatch(/rotate\(/);
  });
});
