import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box, Column, Grid, ScrollView, Text } from '../src';

describe('function children auto-build', () => {
  it('builds builders returned from .children(() => ...)', () => {
    render(
      Box()
        .children(() => Text('hello-fn'))
        .build()
    );

    expect(screen.getByText('hello-fn')).toBeInTheDocument();
  });

  it('builds an array of builders returned from a function', () => {
    render(
      Box()
        .children(() => [Text('one'), Text('two')])
        .build()
    );

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('still auto-builds array children without a function', () => {
    render(
      Column()
        .children([Text('col-a'), Text('col-b')])
        .build()
    );

    expect(screen.getByText('col-a')).toBeInTheDocument();
    expect(screen.getByText('col-b')).toBeInTheDocument();
  });

  it('ScrollView uses processChildren so builders render', () => {
    render(
      ScrollView()
        .children([Text('scroll-child')])
        .build()
    );

    expect(screen.getByText('scroll-child')).toBeInTheDocument();
  });

  it('Grid auto-builds children (no longer shadows FiboBuilder.children)', () => {
    render(
      Grid()
        .columns(1)
        .children([Text('grid-child')])
        .build()
    );

    expect(screen.getByText('grid-child')).toBeInTheDocument();
  });
});
