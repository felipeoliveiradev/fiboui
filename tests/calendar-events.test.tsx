import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Calendar } from '../src/interactive/Calendar';

afterEach(cleanup);

describe('Calendar events', () => {
  it('shows the event title and selects the day as YYYY-MM-DD', () => {
    const onSelect = vi.fn();
    render(
      Calendar()
        .month('2026-10')
        .events([{ date: '2026-10-17', title: 'Ship' }])
        .onSelect(onSelect)
        .build() as never
    );

    expect(screen.getByRole('grid')).toBeTruthy();
    expect(screen.getByText('Ship')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Ship/ }));
    expect(onSelect).toHaveBeenCalledWith('2026-10-17');
  });
});
