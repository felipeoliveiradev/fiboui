import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box, Button, Column, Text } from '../src';
import type { FiboChild, FiboChildren } from '../src';

describe('builders are valid children', () => {
  it('accepts builders whose last call is a typed method', () => {
    const pressed: string[] = [];

    const kids: FiboChildren = [
      Button('press-me').onPress(() => {
        pressed.push('ok');
      }),
      Text('typed-id').id('typed-id'),
      Column().spacing(8).children([Text('spaced')]),
    ];

    const child: FiboChild = Button('solo').onPress(() => undefined);

    render(
      Box()
        .children(kids)
        .build()
    );

    render(Box().children(child).build());

    expect(screen.getByRole('button', { name: 'press-me' })).toBeInTheDocument();
    expect(screen.getByText('typed-id')).toHaveAttribute('id', 'typed-id');
    expect(screen.getByText('spaced')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'solo' })).toBeInTheDocument();
  });
});
