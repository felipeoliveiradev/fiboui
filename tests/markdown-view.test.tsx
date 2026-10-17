import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Markdown } from '../src/content/Markdown';

afterEach(cleanup);

describe('Markdown', () => {
  it('renders **bold** as strong and keeps javascript links as text', () => {
    const { container } = render(
      Markdown()
        .text(
          'Hello **bold** and *em* [click](javascript:alert(1)) [ok](https://example.com) `code`'
        )
        .build()
    );

    const strong = container.querySelector('strong');
    expect(strong).toBeTruthy();
    expect(strong?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('em');
    expect(container.querySelector('code')?.textContent).toBe('code');

    const anchors = [...container.querySelectorAll('a')];
    expect(anchors).toHaveLength(1);
    expect(anchors[0].getAttribute('href')).toMatch(/^https:\/\/example\.com\/?$/);
    expect(anchors[0].textContent).toBe('ok');
    expect(container.querySelector('a[href^="javascript"]')).toBeNull();
    expect(container.textContent).toContain('[click](javascript:alert(1))');
  });

  it('escapes raw HTML and renders headings', () => {
    const { container } = render(
      Markdown().text('# Title\n<img src=x onerror=alert(1)>').build()
    );
    expect(container.querySelector('h1')?.textContent).toBe('Title');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(container.innerHTML).not.toContain('dangerouslySetInnerHTML');
  });
});
