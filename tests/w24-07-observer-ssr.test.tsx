import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { signal } from '../src';
import { Observer } from '../src/core/StateWrapper';
import type { Effect } from '../src/core/state';

afterEach(() => {
  cleanup();
});

function countSubscribeEffect(sig: { subscribeEffect(effect: Effect): void }): {
  tracks: { n: number };
} {
  const tracks = { n: 0 };
  const orig = sig.subscribeEffect.bind(sig);
  sig.subscribeEffect = (effect: Effect) => {
    tracks.n += 1;
    orig(effect);
  };
  return { tracks };
}

describe('W24-07 Observer SSR does not leak trackers', () => {
  it('renderToString does not subscribeEffect on signals read by children', () => {
    const sig = signal(7);
    const { tracks } = countSubscribeEffect(sig);

    const html = renderToString(
      createElement(Observer, {
        children: () => createElement('span', { id: 'obs' }, String(sig.value)),
      }),
    );

    expect(html).toContain('>7<');
    expect(tracks.n).toBe(0);
  });

  it('client Observer still re-renders after a signal write', () => {
    const sig = signal('a');

    render(
      createElement(Observer, {
        children: () => createElement('span', { 'data-testid': 'obs' }, sig.value),
      }),
    );

    expect(screen.getByTestId('obs')).toHaveTextContent('a');
    act(() => {
      sig.value = 'b';
    });
    expect(screen.getByTestId('obs')).toHaveTextContent('b');
  });
});

describe('W24-07 Observer does not swallow render errors', () => {
  it('lets children throw so the error is visible', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => {
      render(
        createElement(Observer, {
          children: () => {
            throw new Error('obs-boom');
          },
        }),
      );
    }).toThrow('obs-boom');

    spy.mockRestore();
  });
});
