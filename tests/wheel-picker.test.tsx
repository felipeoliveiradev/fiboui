import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WheelPicker } from '../src/interactive/WheelPicker';

afterEach(cleanup);

describe('WheelPicker', () => {
  it('click selects B', () => {
    const onChange = vi.fn();
    render(
      WheelPicker().items(['A', 'B', 'C']).value('A').onChange(onChange).build() as never
    );

    const list = screen.getByRole('listbox');
    expect(list).toBeTruthy();
    expect((list as HTMLElement).style.scrollSnapType).toBe('y mandatory');

    const a = screen.getByRole('option', { name: 'A' });
    const b = screen.getByRole('option', { name: 'B' });
    expect(a.getAttribute('aria-selected')).toBe('true');
    expect(b.getAttribute('aria-selected')).toBe('false');

    fireEvent.click(b);
    expect(onChange).toHaveBeenCalledWith('B');
    expect(b.getAttribute('aria-selected')).toBe('true');
    expect(a.getAttribute('aria-selected')).toBe('false');
  });
});
