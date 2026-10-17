import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilePicker } from '../src/interactive/FilePicker';

afterEach(cleanup);

describe('FilePicker', () => {
  it('sets accept on a hidden file input and passes the chosen file to onChange', () => {
    const onChange = vi.fn();
    const { container } = render(
      FilePicker()
        .accept('.pdf,image/*')
        .multiple(true)
        .label('Files')
        .onChange(onChange)
        .build() as never
    );

    const input = container.querySelector('input.fibo-file-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe('file');
    expect(input.hidden).toBe(true);
    expect(input.accept).toBe('.pdf,image/*');
    expect(input.multiple).toBe(true);
    expect(input.accept).not.toBe('image/*');

    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button', { name: 'Files' }));
    expect(click).toHaveBeenCalled();

    const file = new File(['%PDF'], 'report.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual([file]);
    expect(onChange.mock.calls[0][0][0]).toBe(file);
  });
});
