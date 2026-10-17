import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Grid, GridItem, Text } from '../src';

afterEach(cleanup);

function hostGrid(el: ReactElement) {
  const { container } = render(el);
  return container.querySelector('.fibo-grid') as HTMLElement;
}

describe('Grid W7 template / rows / autoFlow CSS', () => {
  it("templateColumns('200px 1fr 1fr') stamps gridTemplateColumns", () => {
    const grid = hostGrid(
      Grid().templateColumns('200px 1fr 1fr').children([Text('a'), Text('b'), Text('c')]).build()
    );
    expect(grid).toBeTruthy();
    expect(grid.style.gridTemplateColumns).toBe('200px 1fr 1fr');
  });

  it('templateColumns overrides numeric columns() repeat', () => {
    const grid = hostGrid(
      Grid().columns(3).templateColumns('200px 1fr 1fr').children(Text('cell')).build()
    );
    expect(grid.style.gridTemplateColumns).toBe('200px 1fr 1fr');
    expect(grid.style.gridTemplateColumns).not.toMatch(/repeat\(3/);
  });

  it('rows(3) stamps repeat(3, minmax(0, auto))', () => {
    const grid = hostGrid(Grid().rows(3).children([Text('a'), Text('b')]).build());
    expect(grid.style.gridTemplateRows).toMatch(/repeat\(3/);
    expect(grid.style.gridTemplateRows).toMatch(/minmax\(0,\s*auto\)/);
  });

  it('templateRows stamps gridTemplateRows', () => {
    const grid = hostGrid(Grid().templateRows('80px 1fr').children(Text('cell')).build());
    expect(grid.style.gridTemplateRows).toBe('80px 1fr');
  });

  it("autoFlow('dense') stamps gridAutoFlow dense", () => {
    const grid = hostGrid(Grid().autoFlow('dense').children(Text('cell')).build());
    expect(grid.style.gridAutoFlow).toMatch(/dense/);
  });

  it("autoFlow('row'|'column') stamps the keyword", () => {
    expect(hostGrid(Grid().autoFlow('row').children(Text('r')).build()).style.gridAutoFlow).toMatch(
      /row/
    );
    expect(
      hostGrid(Grid().autoFlow('column').children(Text('c')).build()).style.gridAutoFlow
    ).toMatch(/column/);
  });

  it('columns(n) still uses repeat(n, minmax(0, 1fr)) when templateColumns is unset', () => {
    const grid = hostGrid(Grid().columns(4).children(Text('cell')).build());
    expect(grid.style.display).toBe('grid');
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(4/);
    expect(grid.style.gridTemplateColumns).toMatch(/minmax\(0,\s*1fr\)/);
  });
});

describe('GridItem W7 placement CSS', () => {
  it('colStart/colEnd/rowStart stamp gridColumnStart/End and gridRowStart', () => {
    const { container } = render(
      Grid()
        .columns(4)
        .children(
          GridItem().colStart(2).colEnd(4).rowStart(1).children(Text('placed'))
        )
        .build()
    );
    const item = container.querySelector('.fibo-grid-item') as HTMLElement;
    expect(item).toBeTruthy();
    expect(item.style.gridColumnStart).toBe('2');
    expect(item.style.gridColumnEnd).toBe('4');
    expect(item.style.gridRowStart).toBe('1');
  });

  it('rowEnd stamps gridRowEnd', () => {
    const { container } = render(
      GridItem().rowStart(1).rowEnd(3).children(Text('tall')).build()
    );
    const item = container.querySelector('.fibo-grid-item') as HTMLElement;
    expect(item.style.gridRowStart).toBe('1');
    expect(item.style.gridRowEnd).toBe('3');
  });

  it('colSpan still stamps gridColumn span 2', () => {
    const { container } = render(
      Grid()
        .columns(4)
        .children(GridItem().colSpan(2).children(Text('wide')))
        .build()
    );
    const item = container.querySelector('.fibo-grid-item') as HTMLElement;
    expect(item.style.gridColumn).toMatch(/span 2/);
  });
});

describe('Grid W7 SSR', () => {
  it('renderToString does not throw for template/placement APIs', () => {
    expect(() =>
      renderToString(
        Grid()
          .templateColumns('200px 1fr 1fr')
          .rows(3)
          .autoFlow('dense')
          .children([
            GridItem().colStart(2).colEnd(4).rowStart(1).colSpan(2).children(Text('a')),
            Text('b'),
          ])
          .build() as ReactElement
      )
    ).not.toThrow();
  });
});
