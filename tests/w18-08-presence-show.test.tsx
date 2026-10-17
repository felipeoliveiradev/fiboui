import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Presence } from '../src/server-shims/passthrough';

function withUndefinedDocument<T>(fn: () => T): T {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
  try {
    return fn();
  } finally {
    if (desc) Object.defineProperty(globalThis, 'document', desc);
  }
}

describe('W18-08 RSC Presence .show()', () => {
  it('fluent .show() overrides constructor flag without reading document', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        Presence(true)
          .show(false)
          .enter('fadeIn')
          .children(createElement('span', { id: 'panel' }, 'secret')),
      ),
    );
    expect(html).not.toContain('secret');
  });

  it('fluent .show(true) paints children after Presence() default', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        Presence().show(true).children(createElement('span', null, 'hello')),
      ),
    );
    expect(html).toContain('hello');
  });

  it('fluent .show() reads signal.value on the server', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        Presence(false)
          .show({ value: true })
          .children(createElement('em', null, 'live')),
      ),
    );
    expect(html).toContain('live');
  });
});
