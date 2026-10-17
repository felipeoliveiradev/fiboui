import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PdfView } from '../src/content/PdfView';

afterEach(cleanup);

function hostOf(node: ReturnType<typeof PdfView>): HTMLElement {
  const { container } = render(node.build());
  const el = container.querySelector('iframe, embed') as HTMLElement | null;
  expect(el).toBeTruthy();
  return el!;
}

describe('PdfView', () => {
  it('keeps an https src on an iframe or embed of type application/pdf', () => {
    const el = hostOf(PdfView().src('https://example.com/spec.pdf').title('Spec'));
    const tag = el.tagName;
    expect(tag === 'IFRAME' || tag === 'EMBED').toBe(true);
    if (tag === 'EMBED') {
      expect(el.getAttribute('type')).toBe('application/pdf');
    }
    expect(el.getAttribute('src')).toBe('https://example.com/spec.pdf');
    expect(el.getAttribute('title')).toBe('Spec');
  });

  it('rejects javascript: and data: urls', () => {
    for (const src of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>']) {
      const el = hostOf(PdfView().src(src).title('Spec'));
      expect(el.getAttribute('src') ?? '').not.toMatch(/javascript:|data:/i);
    }
  });
});
