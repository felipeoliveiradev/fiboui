import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Column, Row, Text } from '../src';

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
});
