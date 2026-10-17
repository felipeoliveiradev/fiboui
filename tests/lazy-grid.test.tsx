import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LazyGrid } from '../src/structure/LazyGrid';

afterEach(cleanup);

function host(el: ReturnType<typeof LazyGrid>) {
  const { container } = render(el.build());
  return container.querySelector('.fibo-lazy-grid') as HTMLElement;
}

describe('LazyGrid', () => {
  it('vertical grid style contains repeat(3', () => {
    const grid = host(
      LazyGrid().direction('vertical').columns(3).spacing(8).children(['a', 'b', 'c']),
    );
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(3/);
    expect(grid.style.gridAutoFlow).toMatch(/row/);
    expect(grid.style.gap).toBe('8px');
  });

  it('horizontal sets overflowX auto', () => {
    const grid = host(
      LazyGrid().direction('horizontal').columns(3).spacing(8).children(['a', 'b']),
    );
    expect(grid.style.overflowX).toBe('auto');
    expect(grid.style.gridTemplateRows).toMatch(/repeat\(3/);
    expect(grid.style.gridAutoFlow).toMatch(/column/);
  });
});
