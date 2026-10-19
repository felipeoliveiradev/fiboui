import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box, Column, Row, Text } from '../src';

describe('Column / Row cross-axis defaults', () => {
  it('defaults Column cross-axis to center (Flutter / SwiftUI)', () => {
    const { container } = render(
      Column()
        .children([Text('c')])
        .build()
    );

    const column = container.querySelector('.fibo-column');
    expect(column?.className).toMatch(/items-center/);
    expect(column?.className).not.toMatch(/items-stretch/);
    expect(column?.className).not.toMatch(/items-start/);
  });

  it('lets Row.hug() opt out of the full-width stretch', () => {
    const { container } = render(
      Column()
        .children([
          Row()
            .hug()
            .children([Text('chip')]),
        ])
        .build()
    );
    const row = container.querySelector('.fibo-row');
    expect(row?.className).toMatch(/w-auto/);
    expect(row?.className).not.toMatch(/self-stretch/);
  });

  it('makes Row self-stretch so spaceBetween works inside a Column', () => {
    const { container } = render(
      Column()
        .children([
          Row()
            .mainAxisAlignment('spaceBetween')
            .children([Text('L'), Text('R')]),
        ])
        .build()
    );

    const row = container.querySelector('.fibo-row');
    expect(row?.className).toMatch(/self-stretch/);
    expect(row?.className).toMatch(/justify-between/);
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('alignX / alignY use screen axes on Row and Column', () => {
    const { container } = render(
      Column()
        .children([
          Row()
            .alignX('between')
            .alignY('center')
            .children([Text('L'), Text('R')]),
          Column()
            .alignX('start')
            .alignY('between')
            .children([Text('T'), Text('B')]),
        ])
        .build()
    );

    const row = container.querySelector('.fibo-row');
    expect(row?.className).toMatch(/justify-between/);
    expect(row?.className).toMatch(/items-center/);

    const columns = container.querySelectorAll('.fibo-column');
    const inner = columns[1];
    expect(inner?.className).toMatch(/items-start/);
    expect(inner?.className).toMatch(/justify-between/);
  });

  it('alignX / alignY on Box follow flexDirection', () => {
    const { container } = render(
      Box()
        .flexDirection('column')
        .alignX('end')
        .alignY('between')
        .children([Text('a'), Text('b')])
        .build()
    );
    const host = container.firstElementChild as HTMLElement;
    expect(host.style.alignItems).toBe('flex-end');
    expect(host.style.justifyContent).toBe('space-between');
  });
});
