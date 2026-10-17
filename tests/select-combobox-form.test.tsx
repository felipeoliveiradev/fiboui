import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button, Combobox, Form, required, Select } from '../src';
import { createFormControl } from '../src/interactive/Form';

afterEach(() => {
  cleanup();
});

const FRUIT = [
  { label: 'Apple', value: 'a' },
  { label: 'Banana', value: 'b' },
];

const LIBS = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'Angular', value: 'angular' },
];

function hiddenNamed(name: string): HTMLInputElement {
  const el = document.querySelector(`input[name="${name}"]`);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`missing named input ${name}`);
  }
  return el;
}

function hiddenNamedAll(name: string): HTMLInputElement[] {
  return [...document.querySelectorAll(`input[name="${name}"]`)].filter(
    (el): el is HTMLInputElement => el instanceof HTMLInputElement
  );
}

describe('Select / Combobox FormData + disabled', () => {
  it('named Select submits the committed value via hidden input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('fruit').options(FRUIT).placeholder('Pick'),
          Button('Go').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    await user.click(screen.getByRole('button', { name: 'Go' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({ fruit: 'b' });
  });

  it('disabled named Select omits the field from FormData', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    render(
      Form()
        .validation({ fruit: required() })
        .onSubmit(onSubmit)
        .onInvalid(onInvalid)
        .children([
          Select().name('fruit').disabled().value('a').options(FRUIT),
          Button('Go').submit(),
        ])
        .build()
    );

    expect(hiddenNamed('fruit').disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onInvalid).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({});
  });

  it('disabled named Combobox omits the field from FormData', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').disabled().value('react').options(LIBS),
          Button('Go').submit(),
        ])
        .build()
    );

    expect(hiddenNamed('lib').disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({});
  });
});

describe('Select / Combobox form.reset / form.set', () => {
  it('Select form.reset restores trigger text and hidden default', async () => {
    const user = userEvent.setup();
    render(
      Form()
        .afterSubmit((_values, form) => {
          form.reset();
        })
        .children([
          Select().name('fruit').value('a').options(FRUIT),
          Button('Save').submit(),
        ])
        .build()
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveTextContent('Apple');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(trigger).toHaveTextContent('Banana');
    expect(hiddenNamed('fruit').value).toBe('b');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => expect(trigger).toHaveTextContent('Apple'));
    expect(hiddenNamed('fruit').value).toBe('a');
  });

  it('Select form.set updates trigger text from the hidden node', () => {
    render(
      Form()
        .children([Select().name('fruit').options(FRUIT).placeholder('Pick')])
        .build()
    );
    const form = document.querySelector('form');
    if (!form) throw new Error('missing form');
    const control = createFormControl(form);

    act(() => {
      control.set('fruit', 'b');
    });

    expect(hiddenNamed('fruit').value).toBe('b');
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });

  it('Combobox form.reset restores searchTerm to the default label', async () => {
    const user = userEvent.setup();
    render(
      Form()
        .afterSubmit((_values, form) => {
          form.reset();
        })
        .children([
          Combobox().name('lib').value('react').options(LIBS),
          Button('Save').submit(),
        ])
        .build()
    );

    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input).toHaveValue('React');
    await user.click(input);
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    expect(input).toHaveValue('Vue');
    expect(hiddenNamed('lib').value).toBe('vue');

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() => expect(input).toHaveValue('React'));
    expect(hiddenNamed('lib').value).toBe('react');
  });
});

describe('Combobox reopen shows all options', () => {
  it('opening a committed single Combobox lists every option', async () => {
    const user = userEvent.setup();
    render(Combobox().options(LIBS).value('react').build());

    await user.click(screen.getByRole('combobox'));
    const options = screen.getAllByRole('option').map((el) => el.textContent);
    expect(options).toEqual(['React', 'Vue', 'Angular']);
  });
});

describe('Select / Combobox listbox dismiss', () => {
  it('Tab closes the Select listbox', async () => {
    const user = userEvent.setup();
    render(
      <>
        {Select().options(FRUIT).build()}
        <input data-testid="after" />
      </>
    );

    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Tab closes the Combobox listbox', async () => {
    const user = userEvent.setup();
    render(
      <>
        {Combobox().options(LIBS).build()}
        <input data-testid="after" />
      </>
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('Select / Combobox live-clear + disabled select', () => {
  it('Select commit dispatches input on the hidden field so Form live-clear runs', async () => {
    const user = userEvent.setup();
    render(
      Form()
        .validation({ fruit: required('Need fruit') })
        .children([
          Select().name('fruit').options(FRUIT),
          Button('Save').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Need fruit')).toBeTruthy();

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    expect(screen.queryByText('Need fruit')).toBeNull();
  });

  it('Combobox handleSelect ignores clicks while the control is disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    function Host() {
      const [locked, setLocked] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setLocked(true)}>
            lock
          </button>
          {Combobox().disabled(locked).options(LIBS).onChange(onChange).build()}
        </>
      );
    }

    render(<Host />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    // fireEvent skips mousedown-outside so the open list stays mounted.
    fireEvent.click(screen.getByRole('button', { name: 'lock' }));
    await user.click(screen.getByRole('option', { name: 'Vue' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('Combobox Enter vs form submit', () => {
  it('Enter with the list closed submits the form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).value('react'),
          Button('Go').submit(),
        ])
        .build()
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.keyboard('{Enter}');
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ lib: 'react' });
  });

  it('Enter with the list open commits the highlight and does not submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onChange = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).onChange(onChange),
          Button('Go').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(hiddenNamed('lib').value).toBe('vue');
  });

  it('Enter with the list open and no option to commit submits the form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('lib').options(LIBS).value('react'),
          Button('Go').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.keyboard('zzzz');
    expect(screen.getByText('No results found.')).toBeTruthy();
    await user.keyboard('{Enter}');
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });
});

describe('multiple Select / Combobox FormData is string[]', () => {
  it('named multiple Select submits repeated hidden inputs as string[]', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('tags').multiple().value(['a', 'b']).options(FRUIT),
          Button('Go').submit(),
        ])
        .build()
    );

    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a', 'b']);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ tags: ['a', 'b'] });
  });

  it('picking two Select options writes two hidden inputs', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select().name('tags').multiple().options(FRUIT),
          Button('Go').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Apple' }));
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a', 'b']);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ tags: ['a', 'b'] });
  });

  it('named multiple Combobox submits repeated hidden inputs as string[]', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Combobox().name('libs').multiple().value(['react', 'vue']).options(LIBS),
          Button('Go').submit(),
        ])
        .build()
    );

    expect(hiddenNamedAll('libs').map((el) => el.value)).toEqual(['react', 'vue']);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ libs: ['react', 'vue'] });
  });

  it('comma in a selected value is not split', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          Select()
            .name('tags')
            .multiple()
            .value(['a,b', 'c'])
            .options([
              { label: 'A,B', value: 'a,b' },
              { label: 'C', value: 'c' },
            ]),
          Button('Go').submit(),
        ])
        .build()
    );

    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a,b', 'c']);
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({ tags: ['a,b', 'c'] });
  });

  it('multiple Select form.reset restores each hidden default', async () => {
    const user = userEvent.setup();
    render(
      Form()
        .afterSubmit((_values, form) => {
          form.reset();
        })
        .children([
          Select().name('tags').multiple().value(['a']).options(FRUIT),
          Button('Save').submit(),
        ])
        .build()
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Banana' }));
    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a', 'b']);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await vi.waitFor(() =>
      expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['a'])
    );
  });

  it('Select form.set with multiple replaces the hidden group', () => {
    render(
      Form()
        .children([Select().name('tags').multiple().value(['a', 'b']).options(FRUIT)])
        .build()
    );
    const form = document.querySelector('form');
    if (!form) throw new Error('missing form');
    const control = createFormControl(form);

    act(() => {
      control.set('tags', 'b');
    });

    expect(hiddenNamedAll('tags').map((el) => el.value)).toEqual(['b']);
    expect(screen.getByRole('combobox')).toHaveTextContent('Banana');
  });
});
