import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { Column, Text, page, withFiboStyles } from '../src/index';

describe('page() / withFiboStyles() SSR', () => {
  it('page() SSR HTML includes tree + dynamic style tag', () => {
    const Page = page(() =>
      Column()
        .gap(12)
        .hover((h) => h.opacity(0.9))
        .children([Text('Hello').fontSize(24)])
    );
    const html = renderToString(<Page />);
    expect(html).toContain('Hello');
    expect(html).toContain('fibo-column');
    expect(html).toContain('fibo-dynamic-styles');
    // hover registration must be in the SSR style tag (no FOUC)
    expect(html).toMatch(/fibo-ps-|opacity/);
  });

  it('page({ styles: false }) omits FiboStyles', () => {
    const Page = page(() => Text('Solo'), { styles: false });
    const html = renderToString(<Page />);
    expect(html).toContain('Solo');
    expect(html).not.toContain('fibo-dynamic-styles');
  });

  it('withFiboStyles wraps a builder for SSR', () => {
    const html = renderToString(withFiboStyles(Text('Wrapped')));
    expect(html).toContain('Wrapped');
    expect(html).toContain('fibo-dynamic-styles');
  });

  it('second SSR pass still renders (no poisoned StyleManager)', () => {
    const Page = page(() => Text('Pass'));
    const a = renderToString(<Page />);
    const b = renderToString(<Page />);
    expect(a).toContain('Pass');
    expect(b).toContain('Pass');
  });
});

