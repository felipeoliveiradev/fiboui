import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Form, required, Select } from '../src';

afterEach(() => {
  cleanup();
});

const FRUIT = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
  { label: 'Cherry', value: 'c' },
];

const WITH_DISABLED = [
  { label: 'Apple', value: 'a' },
  { label: 'Rotten', value: 'x', disabled: true },
  { label: 'Banana', value: 'b' },
];

function hiddenNamedAll(name: string): HTMLInputElement[] {
  return [...document.querySelectorAll(`input[name="${name}"]`)].filter(
    (el): el is HTMLInputElement => el instanceof HTMLInputElement
  );
}

function hiddenNamed(name: string): HTMLInputElement {
  const el = hiddenNamedAll(name)[0];
  if (!el) throw new Error(`missing named input ${name}`);
  return el;
}

describe('Select hidden vs visible after multiple reset', () => {
  it('form.reset restores every hidden when the selection count stays the same', async () => {
    const user = userEvent.setup();
    render(
      Form()
        .afterSubmit((_values, form) => {
          form.reset();
        })
        .children([
          Select().name('tags').multiple().value(['a', 'b']).options(FRUIT),
          Button('Save').submit(),
        ])
        .build()
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Apple, Banana');
    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a', 'b']);

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(trigger).toHaveTextContent('Apple, Cherry');
    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a', 'c']);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => {
      expect(trigger).toHaveTextContent('Apple, Banana');
      expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a', 'b']);
    });
  });
});

describe('Select disabled option', () => {
  it('does not commit a disabled option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(WITH_DISABLED).onChange(onChange).placeholder('Pick'),
          Button('Go').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Rotten' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick');
    expect(hiddenNamed('fruit').value).toBe('');

    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ fruit: '' });
  });

  it('ArrowDown skips a disabled option so Enter cannot steal it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(Select().options(WITH_DISABLED).onChange(onChange).build());

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    const rotten = screen.getByRole('option', { name: 'Rotten' });
    expect(rotten).toHaveAttribute('aria-disabled', 'true');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).not.toHaveBeenCalledWith('x');
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('Select empty placeholder vs FormData', () => {
  it('placeholder is not submitted as a value when nothing is picked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(FRUIT).placeholder('Pick a fruit'),
          Button('Go').submit(),
        ])
        .build()
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('Pick a fruit');
    expect(hiddenNamed('fruit').value).toBe('');
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ fruit: '' });
  });
});

describe('Select rules stay on the named hidden', () => {
  it('collects .rules() from the hidden after a second multiple value is picked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('tags').multiple().options(FRUIT).rules(required('Need tags')),
          Button('Save').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    await user.click(screen.getByRole('option', { name: 'Banana' }));

    const first = hiddenNamedAll('tags')[0];
    expect((first as unknown as { __fiboRules?: unknown[] }).__fiboRules?.length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ tags: ['a', 'b'] });
  });
});
