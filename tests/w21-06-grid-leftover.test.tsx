import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Grid, GridItem, Text } from '../src';
import { StyleManager } from '../src/core/styleManager';

afterEach(() => {
  cleanup();
  StyleManager.resetForTests();
});

function hostGrid(el: ReactElement) {
  const { container } = render(el);
  return container.querySelector('.fibo-grid') as HTMLElement;
}

function liveCss(): string {
  const el = document.getElementById('fibo-dynamic-styles') as HTMLStyleElement | null;
  if (!el) return '';
  const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : '';
  return `${el.textContent ?? ''}\n${rules}`;
}

describe('W21-06 Grid columns() vs gridTemplateColumns clobber', () => {
  it("gridTemplateColumns('repeat(auto-fit, minmax(200px, 1fr))') stamps that template inline", () => {
    const grid = hostGrid(
      Grid()
        .gridTemplateColumns('repeat(auto-fit, minmax(200px, 1fr))')
        .children([Text('a'), Text('b')])
        .build()
    );
    expect(grid.style.gridTemplateColumns).toMatch(/auto-fit/);
    expect(grid.style.gridTemplateColumns).toMatch(/minmax\(200px/);
    expect(grid.style.gridTemplateColumns).not.toMatch(/repeat\(1/);
  });

  it('explicit gridTemplateColumns overrides numeric columns() (no clobber)', () => {
    const grid = hostGrid(
      Grid()
        .columns(4)
        .gridTemplateColumns('repeat(auto-fit, minmax(160px, 1fr))')
        .children(Text('cell'))
        .build()
    );
    expect(grid.style.gridTemplateColumns).toMatch(/auto-fit/);
    expect(grid.style.gridTemplateColumns).toMatch(/minmax\(160px/);
    expect(grid.style.gridTemplateColumns).not.toMatch(/repeat\(4/);
  });

  it('auto-fit minmax is valid CSS (not dropped / not rewritten)', () => {
    const grid = hostGrid(
      Grid()
        .templateColumns('repeat(auto-fit, minmax(200px, 1fr))')
        .children(Text('cell'))
        .build()
    );
    const value = grid.style.gridTemplateColumns;
    expect(value).toBe('repeat(auto-fit, minmax(200px, 1fr))');
    expect(value).not.toMatch(/minmax\(\s*auto-fit/);
    expect(value).not.toMatch(/repeat\(\s*minmax/);
  });
});

describe('W21-06 Grid gap vs rowGap/columnGap leftover', () => {
  it('rowGap + columnGap stamp longhands; default gap does not force 16px on both axes', () => {
    const grid = hostGrid(
      Grid()
        .columns(2)
        .rowGap(8)
        .columnGap(24)
        .children([Text('a'), Text('b')])
        .build()
    );
    expect(grid.style.rowGap).toBe('8px');
    expect(grid.style.columnGap).toBe('24px');
    expect(grid.style.gap).not.toBe('16px');
  });

  it("style({ rowGap, columnGap }) is not clobbered by Grid's default gap shorthand", () => {
    const grid = hostGrid(
      Grid()
        .columns(2)
        .style({ rowGap: '10px', columnGap: '30px' })
        .children(Text('cell'))
        .build()
    );
    expect(grid.style.rowGap).toBe('10px');
    expect(grid.style.columnGap).toBe('30px');
  });

  it("gap(12) still sets a unified gap when row/column gap are unset", () => {
    const grid = hostGrid(
      Grid().columns(2).gap(12).children([Text('a'), Text('b')]).build()
    );
    expect(grid.style.gap).toBe('12px');
  });
});

describe('W21-06 Grid children are grid items', () => {
  it('plain children are direct grid items (not wrapped in a leftover shell)', () => {
    const grid = hostGrid(
      Grid()
        .columns(3)
        .children([Text('one'), Text('two'), Text('three')])
        .build()
    );
    expect(grid.style.display).toBe('grid');
    const items = Array.from(grid.children) as HTMLElement[];
    expect(items.length).toBe(3);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();
    expect(items.some((el) => el.classList.contains('fibo-grid'))).toBe(false);
  });

  it('GridItem children sit on the grid (direct .fibo-grid-item)', () => {
    const grid = hostGrid(
      Grid()
        .columns(2)
        .children([
          GridItem().colSpan(1).children(Text('A')),
          GridItem().children(Text('B')),
        ])
        .build()
    );
    const items = Array.from(grid.querySelectorAll(':scope > .fibo-grid-item')) as HTMLElement[];
    expect(items.length).toBe(2);
    expect(items[0].parentElement).toBe(grid);
    expect(items[0].style.gridColumn).toMatch(/span 1/);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});

describe('W21-06 Grid responsive columns leftover Tailwind', () => {
  it('does not stamp sm:grid-cols / md:grid-cols leftover classes', () => {
    const grid = hostGrid(
      Grid()
        .columns({ sm: 1, md: 2, lg: 3 })
        .children(Text('cell'))
        .build()
    );
    expect(grid.className).not.toMatch(/sm:grid-cols-/);
    expect(grid.className).not.toMatch(/md:grid-cols-/);
    expect(grid.className).not.toMatch(/lg:grid-cols-/);
    expect(grid.className).not.toMatch(/(^|\s)grid-cols-\d/);
    expect(grid.className).toMatch(/fibo-mq-/);
  });

  it('responsive media CSS keeps valid minmax(0, 1fr) tracks', () => {
    hostGrid(
      Grid()
        .columns({ sm: 1, md: 2, lg: 3 })
        .children(Text('cell'))
        .build()
    );
    const css = liveCss();
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)/);
    expect(css).not.toMatch(/minmax\(\s*auto-fit/);
  });
});

describe('W21-06 Grid leftover SSR', () => {
  it('renderToString does not throw for auto-fit, rowGap, columnGap', () => {
    expect(() =>
      renderToString(
        Grid()
          .gridTemplateColumns('repeat(auto-fit, minmax(200px, 1fr))')
          .rowGap(8)
          .columnGap(24)
          .children([Text('a'), GridItem().colSpan(2).children(Text('b'))])
          .build() as ReactElement
      )
    ).not.toThrow();
  });
});
