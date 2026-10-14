import { describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Box, Button, Text, signal, useSignal } from '../src';

describe('bindSignal()', () => {
  it('re-renders when the bound signal changes (function children)', () => {
    const count = signal(0);

    render(
      Box()
        .bindSignal(count)
        .children(() => Text(`A:${count.value}`))
        .build()
    );

    expect(screen.getByText('A:0')).toBeInTheDocument();

    act(() => {
      count.value = 2;
    });

    expect(screen.getByText('A:2')).toBeInTheDocument();
  });

  it('still works with .observer() and a function child', () => {
    const count = signal(0);

    render(
      Box()
        .observer()
        .children(() => Text(`B:${count.value}`))
        .build()
    );

    expect(screen.getByText('B:0')).toBeInTheDocument();

    act(() => {
      count.value = 3;
    });

    expect(screen.getByText('B:3')).toBeInTheDocument();
  });

  it('useSignal() still re-renders a React component', () => {
    const count = signal(0);

    function View() {
      const value = useSignal(count);
      return <span>{`C:${value}`}</span>;
    }

    render(<View />);
    expect(screen.getByText('C:0')).toBeInTheDocument();

    act(() => {
      count.value = 4;
    });

    expect(screen.getByText('C:4')).toBeInTheDocument();
  });

  it('README pattern: bindSignal + increment button', async () => {
    const count = signal(0);

    render(
      Box()
        .bindSignal(count)
        .children(() => [
          Text(`Count: ${count.value}`),
          Button('+').onPress(() => {
            count.value += 1;
          }),
        ])
        .build()
    );

    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    await act(async () => {
      screen.getByRole('button', { name: '+' }).click();
    });
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
