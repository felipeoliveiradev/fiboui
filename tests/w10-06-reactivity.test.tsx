import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Box, ValueBuilder, computed, signal } from '../src';
import {
  effect,
  watch,
  watchMultiple,
} from '../src/core/reactivity';
import {
  StateWrapper,
  useBuilderState,
  useStateContext,
} from '../src/core/StateWrapper';
import { ValueBinder } from '../src/core/ValueBinder';

afterEach(() => {
  cleanup();
});

describe('W10-06 watch(computed) tracks the live value', () => {
  it('watch delivers the recomputed value, not the previous snapshot', () => {
    const price = signal(100);
    const qty = signal(2);
    const total = computed(() => price.value * qty.value);
    const seen: Array<{ next: number; prev: number }> = [];

    const stop = watch(total, (next, prev) => {
      seen.push({ next, prev });
    });

    expect(total.value).toBe(200);
    qty.value = 3;

    expect(seen).toEqual([{ next: 300, prev: 200 }]);
    stop();
  });

  it('watch({ immediate }) then a dep change still passes the new value', () => {
    const n = signal(1);
    const doubled = computed(() => n.value * 2);
    const seen: number[] = [];

    const stop = watch(
      doubled,
      (next) => {
        seen.push(next);
      },
      { immediate: true },
    );

    expect(seen).toEqual([2]);
    n.value = 4;
    expect(seen).toEqual([2, 8]);
    stop();
  });

  it('watchMultiple re-reads computed sources', () => {
    const a = signal(2);
    const doubled = computed(() => a.value * 2);
    const seen: number[][] = [];

    const stop = watchMultiple([doubled], (values) => {
      seen.push([...values]);
    });

    a.value = 5;
    expect(seen).toEqual([[10]]);
    stop();
  });

  it('watch(signal) still passes the new value', () => {
    const n = signal(1);
    const seen: Array<{ next: number; prev: number }> = [];
    const stop = watch(n, (next, prev) => {
      seen.push({ next, prev });
    });
    n.value = 9;
    expect(seen).toEqual([{ next: 9, prev: 1 }]);
    stop();
  });

  it('effect re-runs when a computed dep changes', () => {
    const n = signal(3);
    const doubled = computed(() => n.value * 2);
    const seen: number[] = [];

    const stop = effect(() => {
      seen.push(doubled.value);
    });

    expect(seen).toEqual([6]);
    n.value = 5;
    expect(seen).toEqual([6, 10]);
    stop();
  });
});

describe('W10-06 ValueBinder + computed', () => {
  it('ValueBinder first-paints and tracks a computed that was never read before mount', () => {
    const base = signal(2);
    const doubled = computed(() => base.value * 2);

    render(
      ValueBuilder(doubled)
        .builder((value) => createElement('span', { 'data-testid': 'vb' }, String(value)))
        .build(),
    );

    expect(screen.getByTestId('vb')).toHaveTextContent('4');
    act(() => {
      base.value = 7;
    });
    expect(screen.getByTestId('vb')).toHaveTextContent('14');
  });

  it('ValueBinder host re-renders when the computed source changes', () => {
    const base = signal('a');
    const upper = computed(() => base.value.toUpperCase());

    render(
      createElement(ValueBinder, {
        signal: upper,
        builder: (value: unknown) => createElement('span', { 'data-testid': 'up' }, String(value)),
      }),
    );

    expect(screen.getByTestId('up')).toHaveTextContent('A');
    act(() => {
      base.value = 'hi';
    });
    expect(screen.getByTestId('up')).toHaveTextContent('HI');
  });
});

describe('W10-06 StateWrapper client first paint', () => {
  it('useBuilderState reads stateMap on the first client paint', () => {
    function Child() {
      const [count] = useBuilderState<number>('count');
      return createElement('span', { 'data-testid': 'count' }, String(count ?? 'none'));
    }

    render(
      createElement(StateWrapper, {
        stateMap: new Map<string, unknown>([['count', 3]]),
        children: createElement(Child),
      }),
    );

    expect(screen.getByTestId('count')).toHaveTextContent('3');
    expect(screen.queryByText('none')).toBeNull();
  });

  it('Box().state() first paint is the initial value', () => {
    function Inner() {
      const [count] = useBuilderState<number>('count');
      return createElement('span', { 'data-testid': 'box-count' }, String(count ?? 'none'));
    }

    render(Box().state('count', 3).children(createElement(Inner)).build());
    expect(screen.getByTestId('box-count')).toHaveTextContent('3');
  });

  it('renderToString of client StateWrapper paints stateMap (not undefined)', () => {
    function Child() {
      const [count] = useBuilderState<number>('count');
      const map = useStateContext();
      return createElement(
        'span',
        { id: 'ssr' },
        `${String(count ?? 'none')}:${String(map.get('count') ?? 'empty')}`,
      );
    }

    const html = renderToString(
      createElement(StateWrapper, {
        stateMap: new Map<string, unknown>([['count', 3]]),
        children: createElement(Child),
      }),
    );
    expect(html).toContain('3:3');
    expect(html).not.toContain('none');
  });
});

describe('W10-06 bindSignal(computed)', () => {
  it('Box.bindSignal(computed) rebuilds when the source changes', () => {
    const price = signal(10);
    const total = computed(() => price.value * 2);

    render(
      Box()
        .bindSignal(total)
        .children(() => createElement('span', { 'data-testid': 'tot' }, String(total.value)))
        .build(),
    );

    expect(screen.getByTestId('tot')).toHaveTextContent('20');
    act(() => {
      price.value = 15;
    });
    expect(screen.getByTestId('tot')).toHaveTextContent('30');
  });
});
