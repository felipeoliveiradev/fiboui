import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AsyncImage } from '../src/content/AsyncImage';

afterEach(cleanup);

function placeholder() {
  return React.createElement('span', { 'data-testid': 'ph' }, 'fallback');
}

describe('AsyncImage memory cache', () => {
  it('shows the image and swaps to the placeholder on error', () => {
    const { container } = render(
      AsyncImage()
        .src('https://example.com/async-cache-error-once.png')
        .alt('A')
        .placeholder(placeholder())
        .build(),
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.alt).toBe('A');
    expect(img.getAttribute('src')).toBe('https://example.com/async-cache-error-once.png');
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-testid="ph"]')?.textContent).toBe('fallback');
  });

  it('a second AsyncImage with the same src skips the placeholder after load', () => {
    const src = 'https://example.com/async-cache-ok.png';
    const first = render(
      AsyncImage().src(src).alt('A').placeholder(placeholder()).build(),
    );
    expect(first.container.querySelector('[data-testid="ph"]')).toBeTruthy();
    const img = first.container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(src);
    fireEvent.load(img);
    expect(first.container.querySelector('[data-testid="ph"]')).toBeNull();
    expect(first.container.querySelector('img')?.getAttribute('alt')).toBe('A');

    const second = render(
      AsyncImage().src(src).alt('B').placeholder(placeholder()).build(),
    );
    expect(second.container.querySelector('[data-testid="ph"]')).toBeNull();
    const img2 = second.container.querySelector('img') as HTMLImageElement;
    expect(img2).toBeTruthy();
    expect(img2.getAttribute('src')).toBe(src);
    expect(img2.alt).toBe('B');
  });

  it('cache(false) still shows the placeholder for a src that already loaded', () => {
    const src = 'https://example.com/async-cache-off.png';
    const first = render(
      AsyncImage().src(src).alt('A').cache(true).placeholder(placeholder()).build(),
    );
    fireEvent.load(first.container.querySelector('img') as HTMLImageElement);

    const second = render(
      AsyncImage().src(src).alt('B').cache(false).placeholder(placeholder()).build(),
    );
    expect(second.container.querySelector('[data-testid="ph"]')).toBeTruthy();
    const img = second.container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(src);
    expect(img.alt).toBe('B');
  });

  it('a cached error shows the placeholder without mounting another img', () => {
    const src = 'https://example.com/async-cache-error-shared.png';
    const first = render(
      AsyncImage().src(src).alt('A').placeholder(placeholder()).build(),
    );
    fireEvent.error(first.container.querySelector('img') as HTMLImageElement);
    expect(first.container.querySelector('img')).toBeNull();

    const second = render(
      AsyncImage().src(src).alt('B').placeholder(placeholder()).build(),
    );
    expect(second.container.querySelector('img')).toBeNull();
    expect(second.container.querySelector('[data-testid="ph"]')?.textContent).toBe('fallback');
  });
});
