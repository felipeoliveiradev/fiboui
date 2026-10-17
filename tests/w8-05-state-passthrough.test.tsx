import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  FineGrainText,
  bindText,
} from '../src/server-shims/FineGrain';
import {
  ProviderWrapper,
  StateWrapper,
  useBuilderState,
  useProvider,
  useStateContext,
} from '../src/server-shims/StateWrapper';

function withUndefinedDocument<T>(fn: () => T): T {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
  try {
    return fn();
  } finally {
    if (desc) Object.defineProperty(globalThis, 'document', desc);
  }
}

describe('W8-05 RSC StateWrapper passthrough', () => {
  it('reads .state() initial values from stateMap (not always undefined)', () => {
    function Child() {
      const [count] = useBuilderState<number>('count');
      return createElement('span', { id: 'count' }, String(count ?? 'none'));
    }

    const html = renderToString(
      createElement(StateWrapper, {
        stateMap: new Map<string, unknown>([['count', 3]]),
        children: createElement(Child),
      }),
    );
    expect(html).toContain('>3<');
    expect(html).not.toContain('none');
  });

  it('useStateContext sees the provided stateMap', () => {
    function Child() {
      const map = useStateContext();
      return createElement('span', { id: 'ctx' }, String(map.get('open')));
    }

    const html = renderToString(
      createElement(StateWrapper, {
        stateMap: new Map<string, unknown>([['open', true]]),
        children: createElement(Child),
      }),
    );
    expect(html).toContain('>true<');
  });

  it('ProviderWrapper passthrough exposes provide() values via useProvider', () => {
    function Child() {
      const store = useProvider<{ from: string }>('app-store');
      return createElement('span', { id: 'prov' }, store?.from ?? 'missing');
    }

    const html = renderToString(
      createElement(ProviderWrapper, {
        providers: new Map<string, unknown>([['app-store', { from: 'plugin' }]]),
        children: createElement(Child),
      }),
    );
    expect(html).toContain('plugin');
    expect(html).not.toContain('missing');
  });

  it('does not throw without a wrapper and does not read document', () => {
    function Child() {
      const [v] = useBuilderState<string>('k');
      const p = useProvider<string>('x');
      return createElement('span', null, `${v ?? 'none'}:${p ?? 'empty'}`);
    }

    const html = withUndefinedDocument(() =>
      renderToString(createElement(Child)),
    );
    expect(html).toContain('none:empty');
  });
});

describe('W8-05 FineGrain RSC host', () => {
  it('compute() paints into the host tag without window/document', () => {
    const html = withUndefinedDocument(() =>
      renderToString(
        createElement(FineGrainText, {
          compute: () => 'grain-ssr',
          as: 'p',
          className: 'fibo-text',
        }),
      ),
    );
    expect(html).toContain('grain-ssr');
    expect(html).toMatch(/<p\b/);
  });

  it('bindText does not throw when document is missing', () => {
    const html = withUndefinedDocument(() =>
      renderToString(bindText({ value: 'live' }, 'em') as never),
    );
    expect(html).toContain('live');
    expect(html).toMatch(/<em\b/);
  });
});
