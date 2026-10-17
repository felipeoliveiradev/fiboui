import { describe, expect, it } from 'vitest';
import { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { Box, Button, Observer, Text, computed, signal, useSignal } from '../src';

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

  it('Observer still updates after StrictMode effect remount', () => {
    const count = signal(0);

    render(
      <StrictMode>
        <Observer>{() => <span data-testid="obs-sm">{`SM:${count.value}`}</span>}</Observer>
      </StrictMode>
    );

    expect(screen.getByTestId('obs-sm')).toHaveTextContent('SM:0');

    act(() => {
      count.value = 5;
    });

    expect(screen.getByTestId('obs-sm')).toHaveTextContent('SM:5');
  });

  it('.observer() children stay live under StrictMode', () => {
    const count = signal(0);

    render(
      <StrictMode>
        {Box()
          .observer()
          .children(() => Text(`D:${count.value}`))
          .build()}
      </StrictMode>
    );

    expect(screen.getByText('D:0')).toBeInTheDocument();

    act(() => {
      count.value = 6;
    });

    expect(screen.getByText('D:6')).toBeInTheDocument();
  });
});

describe('ComputedSignal.dispose', () => {
  it('drops the internal effect so source updates stop notifying', () => {
    const src = signal(1);
    const doubled = computed(() => src.value * 2);
    const seen: number[] = [];
    doubled.subscribe((v) => {
      seen.push(v);
    });

    expect(doubled.value).toBe(2);
    src.value = 3;
    expect(doubled.value).toBe(6);
    expect(seen.length).toBeGreaterThan(0);

    const afterRead = seen.length;
    doubled.dispose();
    src.value = 4;
    expect(seen.length).toBe(afterRead);
    expect(doubled.value).toBe(6);
  });
});
