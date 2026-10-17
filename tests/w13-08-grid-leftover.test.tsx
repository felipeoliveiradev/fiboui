import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Grid, GridItem, Text } from '../src';

afterEach(cleanup);

function hostGrid(el: ReactElement) {
  const { container } = render(el);
  return container.querySelector('.fibo-grid') as HTMLElement;
}

describe('Grid masonry leftover Tailwind (W13-08)', () => {
  it('stamps break-inside:avoid as inline CSS, not a Tailwind class', () => {
    const grid = hostGrid(
      Grid()
        .variant('masonry')
        .columns(2)
        .gap(8)
        .children([Text('A'), Text('B')])
        .build()
    );
    const items = Array.from(grid.querySelectorAll(':scope > div')) as HTMLElement[];
    expect(items.length).toBe(2);
    for (const item of items) {
      expect(item.style.breakInside).toBe('avoid');
      expect(item.className).not.toMatch(/break-inside-avoid/);
      expect(item.className).not.toMatch(/mb-4/);
    }
  });

  it('gap(n) sets columnGap and item marginBottom to n px', () => {
    const grid = hostGrid(
      Grid()
        .variant('masonry')
        .columns(2)
        .gap(8)
        .children([Text('A'), Text('B')])
        .build()
    );
    expect(grid.style.columnGap).toBe('8px');
    const items = Array.from(grid.querySelectorAll(':scope > div')) as HTMLElement[];
    expect(items.every((el) => el.style.marginBottom === '8px')).toBe(true);
  });

  it("gap('none') zeros columnGap and vertical item margin", () => {
    const grid = hostGrid(
      Grid()
        .variant('masonry')
        .columns(2)
        .gap('none')
        .children([Text('A'), Text('B')])
        .build()
    );
    expect(grid.style.columnGap).toBe('0px');
    const items = Array.from(grid.querySelectorAll(':scope > div')) as HTMLElement[];
    expect(items.every((el) => el.style.marginBottom === '0px')).toBe(true);
  });
});

describe('Grid bento + W7 placement longhands (W13-08)', () => {
  it('does not wrap GridItem colStart/colEnd/rowStart in a bento span shell', () => {
    const { container } = render(
      Grid()
        .variant('bento')
        .columns(4)
        .children(GridItem().colStart(2).colEnd(4).rowStart(1).children(Text('placed')))
        .build()
    );
    const item = container.querySelector('.fibo-grid-item') as HTMLElement;
    expect(item).toBeTruthy();
    expect(item.style.gridColumnStart).toBe('2');
    expect(item.style.gridColumnEnd).toBe('4');
    expect(item.style.gridRowStart).toBe('1');
    expect(item.parentElement?.classList.contains('fibo-grid')).toBe(true);
    expect(screen.getByText('placed')).toBeInTheDocument();
  });

  it('still auto-spans a plain child in the bento pattern', () => {
    const grid = hostGrid(
      Grid().variant('bento').columns(4).children(Text('plain')).build()
    );
    const shell = grid.querySelector(':scope > div') as HTMLElement;
    expect(shell).toBeTruthy();
    expect(shell.style.gridColumn).toMatch(/span 2/);
    expect(shell.style.gridRow).toMatch(/span 2/);
    expect(screen.getByText('plain')).toBeInTheDocument();
  });
});

describe('Grid W13-08 SSR', () => {
  it('renderToString does not throw for masonry gap and bento placement', () => {
    expect(() =>
      renderToString(
        Grid()
          .variant('masonry')
          .columns(2)
          .gap(8)
          .children([Text('a'), Text('b')])
          .build() as ReactElement
      )
    ).not.toThrow();
    expect(() =>
      renderToString(
        Grid()
          .variant('bento')
          .columns(4)
          .children(GridItem().colStart(2).colEnd(4).children(Text('x')))
          .build() as ReactElement
      )
    ).not.toThrow();
  });
});
