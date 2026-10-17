import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OtpField } from '../src/interactive/OtpField';

afterEach(cleanup);

describe('OtpField', () => {
  it('types digits into separate inputs and reports the joined code', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(OtpField().length(4).onChange(onChange).build());

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
    for (const input of inputs) {
      expect(input).toHaveAttribute('inputmode', 'numeric');
      expect(input).toHaveAttribute('maxlength', '1');
    }
    expect(inputs[0]).toHaveAttribute('autocomplete', 'one-time-code');

    await user.type(inputs[0], '1');
    expect(inputs[1]).toHaveFocus();
    await user.type(inputs[1], '2');

    const codes = onChange.mock.calls.map((call) => String(call[0]));
    expect(codes.some((code) => code.startsWith('12'))).toBe(true);
  });
});
