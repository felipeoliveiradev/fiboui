import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WebView } from '../src/content/WebView';

afterEach(cleanup);

describe('WebView', () => {
  it('does not set src for javascript: URLs', () => {
    const { container } = render(WebView().src('javascript:alert(1)').title('Docs').build());
    const frame = container.querySelector('iframe') as HTMLIFrameElement;
    expect(frame).toBeTruthy();
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBeNull();
    expect(frame.getAttribute('title')).toBe('Docs');
    expect(frame.hasAttribute('sandbox')).toBe(false);
  });

  it('sets src and https sandbox', () => {
    const { container } = render(
      WebView().src('https://example.com/docs').title('Docs').build()
    );
    const frame = container.querySelector('iframe') as HTMLIFrameElement;
    expect(frame.getAttribute('src')).toBe('https://example.com/docs');
    expect(frame.getAttribute('title')).toBe('Docs');
    expect(frame.getAttribute('sandbox')).toBe(
      'allow-scripts allow-same-origin allow-popups'
    );
  });

  it('drops data: and vbscript: src', () => {
    for (const url of ['data:text/html,hi', 'vbscript:msgbox(1)']) {
      const { container, unmount } = render(WebView().src(url).build());
      const frame = container.querySelector('iframe') as HTMLIFrameElement;
      expect(frame.getAttribute('src')).toBeNull();
      expect(frame.hasAttribute('sandbox')).toBe(false);
      unmount();
    }
  });
});
