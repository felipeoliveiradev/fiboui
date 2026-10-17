import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { Searchable } from '../src/structure/Searchable';

afterEach(cleanup);

describe('Searchable', () => {
  it('filters visible rows while typing and shows every row when the query is empty', async () => {
    const user = userEvent.setup();
    render(
      Searchable().items(['Alpha', 'Beta']).placeholder('Find').build() as React.ReactElement,
    );

    const field = screen.getByPlaceholderText('Find');
    expect(field).toHaveAttribute('type', 'search');
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    await user.type(field, 'Be');
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();

    await user.clear(field);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
