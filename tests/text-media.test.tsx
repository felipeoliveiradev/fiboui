import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { AsyncImage } from '../src/content/AsyncImage';
import { RichText } from '../src/content/RichText';
import { SelectableText } from '../src/content/SelectableText';
import { Text } from '../src/content/Text';
import { VideoPlayer } from '../src/content/VideoPlayer';

afterEach(cleanup);

describe('text and media widgets', () => {
  it('Text bold and italic land on the text style', () => {
    const { container } = render(Text('Hi').bold().italic().build());
    const el = container.querySelector('p') as HTMLElement;
    expect(el.textContent).toBe('Hi');
    expect(el.style.fontWeight).toBe('700');
    expect(el.style.fontStyle).toBe('italic');
  });

  it('lineLimit, truncation, case, and decorations', () => {
    const { container } = render(
      Text('Hello world')
        .lineLimit(2)
        .truncation('tail')
        .underline()
        .strikethrough()
        .textCase('uppercase')
        .build()
    );
    const el = container.querySelector('p') as HTMLElement;
    expect(el.style.display).toBe('-webkit-box');
    expect(el.style.webkitLineClamp).toBe('2');
    expect(el.style.overflow).toBe('hidden');
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(el.style.whiteSpace).toBe('nowrap');
    expect(el.getAttribute('data-truncation')).toBe('tail');
    expect(el.style.textDecoration).toContain('underline');
    expect(el.style.textDecoration).toContain('line-through');
    expect(el.style.textTransform).toBe('uppercase');
  });

  it('truncation ellipsis uses nowrap', () => {
    const { container } = render(Text('Hello').truncation('ellipsis').build());
    const el = container.querySelector('p') as HTMLElement;
    expect(el.style.textOverflow).toBe('ellipsis');
    expect(el.style.whiteSpace).toBe('nowrap');
  });

  it('RichText renders spans', () => {
    const { container } = render(
      RichText()
        .spans([
          { text: 'Hi', bold: true },
          { text: ' there', italic: true, color: '#fff' },
        ])
        .build()
    );
    const spans = container.querySelectorAll('p > span');
    expect(spans).toHaveLength(2);
    expect(spans[0].textContent).toBe('Hi');
    expect((spans[0] as HTMLElement).style.fontWeight).toBe('700');
    expect(spans[1].textContent).toBe(' there');
    expect((spans[1] as HTMLElement).style.fontStyle).toBe('italic');
    expect((spans[1] as HTMLElement).style.color).toMatch(/#fff|rgb\(255,\s*255,\s*255\)/i);
  });

  it('SelectableText sets userSelect text', () => {
    const { container } = render(SelectableText('Hello').build());
    const el = container.querySelector('p') as HTMLElement;
    expect(el.textContent).toBe('Hello');
    expect(el.style.userSelect).toBe('text');
  });

  it('AsyncImage shows img alt and swaps to placeholder on error', () => {
    const { container } = render(
      AsyncImage()
        .src('https://example.com/a.png')
        .alt('A')
        .placeholder(React.createElement('span', { 'data-testid': 'ph' }, 'fallback'))
        .build()
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.alt).toBe('A');
    expect(img.getAttribute('src')).toBe('https://example.com/a.png');
    fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-testid="ph"]')?.textContent).toBe('fallback');
  });

  it('VideoPlayer renders a video with controls', () => {
    const { container } = render(
      VideoPlayer().src('https://example.com/a.mp4').poster('').controls(true).build()
    );
    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeTruthy();
    expect(video.tagName).toBe('VIDEO');
    expect(video.hasAttribute('controls') || video.controls).toBe(true);
    expect(video.getAttribute('src')).toBe('https://example.com/a.mp4');
  });
});
