import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DateRangePicker } from '../src/interactive/DateRangePicker';

afterEach(cleanup);

describe('DateRangePicker', () => {
  it('renders two date inputs and reports changes in order', () => {
    const onChange = vi.fn();
    render(
      DateRangePicker()
        .start('2026-01-02')
        .end('2026-01-09')
        .onChange(onChange)
        .build() as never
    );

    const start = screen.getByLabelText('Start') as HTMLInputElement;
    const end = screen.getByLabelText('End') as HTMLInputElement;
    expect(start.type).toBe('date');
    expect(end.type).toBe('date');
    expect(start.value).toBe('2026-01-02');
    expect(end.value).toBe('2026-01-09');

    fireEvent.change(end, { target: { value: '2026-01-15' } });
    expect(onChange).toHaveBeenCalledWith('2026-01-02', '2026-01-15');
  });

  it('swaps start and end when the new end is before start', () => {
    const onChange = vi.fn();
    render(
      DateRangePicker()
        .start('2026-01-02')
        .end('2026-01-09')
        .onChange(onChange)
        .build() as never
    );

    const start = screen.getByLabelText('Start') as HTMLInputElement;
    const end = screen.getByLabelText('End') as HTMLInputElement;

    fireEvent.change(end, { target: { value: '2026-01-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-01-01', '2026-01-02');
    expect(start.value).toBe('2026-01-01');
    expect(end.value).toBe('2026-01-02');

    fireEvent.change(start, { target: { value: '2026-01-20' } });
    expect(onChange).toHaveBeenLastCalledWith('2026-01-02', '2026-01-20');
  });
});
