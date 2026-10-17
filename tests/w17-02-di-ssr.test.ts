import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { container, Injectable } from '../src/core/di';
import { endSsrRequest } from '../src/core/styleManager';

afterEach(() => {
  try {
    container.clear();
  } catch {
    // dispose threw in a test body
  }
  vi.unstubAllGlobals();
});

describe('W17-02 DI: @Injectable singletons vs endSsrRequest', () => {
  it('endSsrRequest on Node drops process singleton instances so the next request starts cold', () => {
    @Injectable({ singleton: true })
    class Session {
      user = 'anon';
    }

    const first = container.resolve(Session);
    first.user = 'alice';
    expect(container.resolve(Session)).toBe(first);

    vi.stubGlobal('window', undefined);
    endSsrRequest();

    const second = container.resolve(Session);
    expect(second).not.toBe(first);
    expect(second.user).toBe('anon');
    expect(container.resolve(Session)).toBe(second);
  });

  it('endSsrRequest on Node drops registerSingleton instances and still re-resolves @Injectable', () => {
    let n = 0;
    container.registerSingleton('req-cache', () => {
      n += 1;
      return { n };
    });
    expect(container.resolve('req-cache')).toEqual({ n: 1 });
    expect(container.resolve('req-cache')).toEqual({ n: 1 });

    vi.stubGlobal('window', undefined);
    endSsrRequest();

    expect(container.has('req-cache')).toBe(false);

    @Injectable({ singleton: true })
    class Clock {
      readonly stamp = Math.random();
    }
    const a = container.resolve(Clock);
    const b = container.resolve(Clock);
    expect(a).toBe(b);
    expect(a).toBeInstanceOf(Clock);
  });

  it('endSsrRequest does not drop singletons on the client (window present)', () => {
    @Injectable({ singleton: true })
    class ClientStore {
      n = 1;
    }
    const first = container.resolve(ClientStore);
    first.n = 7;
    endSsrRequest();
    const second = container.resolve(ClientStore);
    expect(second).toBe(first);
    expect(second.n).toBe(7);
  });

  it('endSsrRequest on Node still finishes when a singleton dispose() throws', () => {
    container.registerSingleton('boom', () => ({
      dispose() {
        throw new Error('dispose boom');
      },
    }));
    container.resolve('boom');

    vi.stubGlobal('window', undefined);
    expect(() => endSsrRequest()).not.toThrow();
    expect(container.has('boom')).toBe(false);
  });
});
