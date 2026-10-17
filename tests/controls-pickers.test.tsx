import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ColorPicker } from '../src/interactive/ColorPicker';
import { DatePicker } from '../src/interactive/DatePicker';
import { SecureField } from '../src/interactive/SecureField';
import { SegmentedButton } from '../src/interactive/SegmentedButton';
import { TimePicker } from '../src/interactive/TimePicker';

afterEach(cleanup);

describe('picker controls', () => {
  it('DatePicker renders an input type=date', () => {
    const onChange = vi.fn();
    render(
      DatePicker()
        .value('2026-10-17')
        .min('2020-01-01')
        .max('2030-12-31')
        .label('Date')
        .onChange(onChange)
        .build() as never
    );

    const input = screen.getByLabelText('Date') as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(input.value).toBe('2026-10-17');
    expect(input.min).toBe('2020-01-01');
    expect(input.max).toBe('2030-12-31');

    fireEvent.change(input, { target: { value: '2026-11-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-11-01');
  });

  it('TimePicker renders an input type=time', () => {
    const onChange = vi.fn();
    render(
      TimePicker().value('09:30').label('Time').onChange(onChange).build() as never
    );

    const input = screen.getByLabelText('Time') as HTMLInputElement;
    expect(input.type).toBe('time');
    expect(input.value).toBe('09:30');

    fireEvent.change(input, { target: { value: '10:15' } });
    expect(onChange).toHaveBeenCalledWith('10:15');
  });

  it('ColorPicker renders an input type=color', () => {
    const onChange = vi.fn();
    render(
      ColorPicker().value('#c8ff00').label('Color').onChange(onChange).build() as never
    );

    const input = screen.getByLabelText('Color') as HTMLInputElement;
    expect(input.type).toBe('color');
    expect(input.value).toBe('#c8ff00');

    fireEvent.change(input, { target: { value: '#112233' } });
    expect(onChange).toHaveBeenCalledWith('#112233');
  });

  it('SegmentedButton marks the selected option', () => {
    const onChange = vi.fn();
    render(
      SegmentedButton()
        .options([
          { value: 'a', label: 'Day' },
          { value: 'b', label: 'Week' },
        ])
        .value('a')
        .onChange(onChange)
        .build() as never
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toBeTruthy();
    const day = screen.getByRole('radio', { name: 'Day' });
    const week = screen.getByRole('radio', { name: 'Week' });
    expect(day.getAttribute('aria-checked')).toBe('true');
    expect(week.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(week);
    expect(week.getAttribute('aria-checked')).toBe('true');
    expect(day.getAttribute('aria-checked')).toBe('false');
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('SecureField stays a password input until reveal is toggled', () => {
    const onChange = vi.fn();
    render(
      SecureField()
        .value('')
        .placeholder('Password')
        .reveal(true)
        .onChange(onChange)
        .build() as never
    );

    const input = screen.getByPlaceholderText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');

    fireEvent.click(screen.getByRole('button', { name: /reveal/i }));
    expect(input.type).toBe('text');

    fireEvent.click(screen.getByRole('button', { name: /hide/i }));
    expect(input.type).toBe('password');

    fireEvent.change(input, { target: { value: 'secret' } });
    expect(onChange).toHaveBeenCalledWith('secret');
  });

  it('SecureField.reveal(false) has no toggle and stays type=password', () => {
    render(SecureField().value('').placeholder('Password').reveal(false).build() as never);
    const input = screen.getByPlaceholderText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(screen.queryByRole('button', { name: /reveal/i })).toBeNull();
  });
});
