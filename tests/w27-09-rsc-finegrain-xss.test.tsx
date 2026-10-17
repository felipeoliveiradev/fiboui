import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FineGrainText, bindText } from '../src/server-shims/FineGrain';

function withUndefinedDocument<T>(fn: () => T): T {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
  try {
    return fn();
  } finally {
    if (desc) Object.defineProperty(globalThis, 'document', desc);
  }
}

describe('W27-09 RSC FineGrain XSS', () => {
  it('does not paint HTML from rest.dangerouslySetInnerHTML', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        createElement(FineGrainText, {
          compute: () => 'safe',
          dangerouslySetInnerHTML: {
            __html: '<img data-xss="1" src="x" onerror="window.__w2709=1">',
          },
        }),
      ),
    );
    expect(html).toContain('safe');
    expect(html).not.toContain('data-xss');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('onerror');
  });

  it('null compute + innerHTML is not an HTML injection hole', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        createElement(FineGrainText, {
          compute: () => null as unknown as string,
          dangerouslySetInnerHTML: { __html: '<img data-xss="1" src="x">' },
        }),
      ),
    );
    expect(html).not.toContain('data-xss');
    expect(html).not.toContain('<img');
  });

  it('HTML in compute() is text, not parsed markup', () => {
    const payload = '<img data-xss="1" src="x"><b>own</b>';
    const html = withUndefinedDocument(() =>
      renderToString(createElement(FineGrainText, { compute: () => payload })),
    );
    expect(html).toContain('&lt;img');
    expect(html).toContain('&lt;b&gt;own&lt;/b&gt;');
    expect(html).not.toMatch(/<img\b/);
    expect(html).not.toMatch(/<b>/);
  });

  it('bindText does not honor leftover innerHTML on the host', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        createElement(FineGrainText, {
          compute: () => String({ value: 'bound' }.value),
          as: 'em',
          dangerouslySetInnerHTML: { __html: '<i data-xss="1">x</i>' },
        }),
      ),
    );
    expect(html).toMatch(/<em\b/);
    expect(html).toContain('bound');
    expect(html).not.toContain('data-xss');
    expect(bindText({ value: 'bound' }, 'em')).toBeTruthy();
  });
});
