import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReorderableList } from '../src/structure/ReorderableList';

afterEach(cleanup);

describe('ReorderableList drag', () => {
  it('drag row 0 onto row 1 calls onReorder with swapped ids', () => {
    const onReorder = vi.fn();
    render(
      ReorderableList()
        .items([
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ])
        .onReorder(onReorder)
        .build() as React.ReactElement,
    );

    const rows = screen.getAllByRole('listitem');
    fireEvent.dragStart(rows[0]);
    fireEvent.dragOver(rows[1]);
    fireEvent.drop(rows[1]);

    expect(onReorder).toHaveBeenCalledWith(['b', 'a']);
  });
});
