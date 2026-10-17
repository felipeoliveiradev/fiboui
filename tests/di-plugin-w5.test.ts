import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { container, Inject, Injectable } from '../src/core/di';
import { PluginManager } from '../src/core/plugin/PluginManager';
import { endSsrRequest } from '../src/core/styleManager';
import type { FiboPlugin } from '../src/core/plugin/types';
import type { FiboBuilder } from '../src/core/builder';
import { createElement } from 'react';

function dummyBuilder(): FiboBuilder {
  return { build: () => createElement('div') } as unknown as FiboBuilder;
}

afterEach(() => {
  PluginManager.resetForTests();
  container.clear();
});

describe('DI leftover P0/P1', () => {
  it('caches singleton factory results that are falsy (0 / false / empty / null)', () => {
    let n = 0;
    container.registerSingleton('zero', () => {
      n += 1;
      return 0;
    });
    container.registerSingleton('nope', () => false);
    container.registerSingleton('empty', () => '');
    container.registerSingleton('nil', () => null);

    expect(container.resolve('zero')).toBe(0);
    expect(container.resolve('zero')).toBe(0);
    expect(n).toBe(1);
    expect(container.resolve('nope')).toBe(false);
    expect(container.resolve('empty')).toBe('');
    expect(container.resolve('nil')).toBeNull();
  });

  it('resolves @Injectable after container.clear() (tests / HMR re-register)', () => {
    @Injectable({ singleton: true })
    class Clock {
      readonly stamp = Math.random();
    }

    const first = container.resolve(Clock);
    expect(first).toBeInstanceOf(Clock);
    container.clear();
    const second = container.resolve(Clock);
    expect(second).toBeInstanceOf(Clock);
    expect(second).not.toBe(first);
  });

  it('clear() finishes and drops other tokens when one dispose() throws', () => {
    const later = vi.fn();
    container.registerSingleton('boom', () => ({
      dispose() {
        throw new Error('dispose boom');
      },
    }));
    container.registerSingleton('ok', () => ({ dispose: later }));
    container.resolve('boom');
    container.resolve('ok');

    expect(() => container.clear()).toThrow(/dispose boom/);
    expect(later).toHaveBeenCalledTimes(1);
    expect(container.has('boom')).toBe(false);
    expect(container.has('ok')).toBe(false);
  });

  it('still injects constructor tokens after clear()', () => {
    @Injectable()
    class Logger {
      ping() {
        return 'pong';
      }
    }

    @Injectable()
    class Greeter {
      constructor(@Inject(Logger) readonly logger: Logger) {}
    }

    container.clear();
    const greeter = container.resolve(Greeter);
    expect(greeter.logger.ping()).toBe('pong');
  });
});

describe('PluginManager leftover P0/P1', () => {
  it('resetForTests keeps going when one teardown throws (no leftover services)', () => {
    const pm = PluginManager.getInstance();
    pm.use({
      name: 'bad',
      setup(ctx) {
        ctx.registerService('bad-svc', () => 1);
      },
      teardown() {
        throw new Error('teardown boom');
      },
    });
    pm.use({
      name: 'good',
      setup(ctx) {
        ctx.registerService('good-svc', () => 2);
        ctx.registerRoute({ path: '/good', component: dummyBuilder });
      },
    });

    expect(() => PluginManager.resetForTests()).not.toThrow();
    const next = PluginManager.getInstance();
    expect(next.has('bad')).toBe(false);
    expect(next.has('good')).toBe(false);
    expect(next.getRoutes()).toEqual([]);
    expect(container.has('bad-svc')).toBe(false);
    expect(container.has('good-svc')).toBe(false);
  });

  it('uninstall does not drop a service token owned by another plugin', () => {
    const pm = PluginManager.getInstance();
    pm.use({
      name: 'owner',
      setup(ctx) {
        ctx.registerService('shared-svc', () => 'from-owner');
      },
    });
    pm.use({
      name: 'other',
      setup(ctx) {
        ctx.registerService('shared-svc', () => 'from-other');
      },
    });

    expect(container.resolve('shared-svc')).toBe('from-owner');
    expect(pm.uninstall('other')).toBe(true);
    expect(container.has('shared-svc')).toBe(true);
    expect(container.resolve('shared-svc')).toBe('from-owner');
  });

  it('uninstall does not delete a named store overwritten by a later plugin', () => {
    const pm = PluginManager.getInstance();
    const first = { n: 1 };
    const second = { n: 2 };
    pm.use({
      name: 'a',
      setup(ctx) {
        ctx.registerStore(first, 'main');
      },
    });
    pm.use({
      name: 'b',
      setup(ctx) {
        ctx.registerStore(second, 'main');
      },
    });
    expect(pm.getStore('main')).toBe(second);
    pm.uninstall('a');
    expect(pm.getStore('main')).toBe(second);
    pm.uninstall('b');
    expect(pm.getStore('main')).toBeUndefined();
  });

  it('run() isolates plugins from the process singleton (SSR per request)', () => {
    const root = PluginManager.getInstance();
    root.use({
      name: 'client-plug',
      setup(ctx) {
        ctx.registerRoute({ path: '/client', component: dummyBuilder });
      },
    });

    const isolated = PluginManager.run(() => {
      const scoped = PluginManager.getInstance();
      expect(scoped).not.toBe(root);
      expect(scoped.getRoutes()).toEqual([]);
      scoped.use({
        name: 'ssr-plug',
        setup(ctx) {
          ctx.registerRoute({ path: '/ssr', component: dummyBuilder });
        },
      });
      return scoped.getRoutes().map((r) => r.path);
    });

    expect(isolated).toEqual(['/ssr']);
    expect(PluginManager.getInstance()).toBe(root);
    expect(PluginManager.getInstance().getRoutes().map((r) => r.path)).toEqual(['/client']);
    expect(PluginManager.getInstance().has('ssr-plug')).toBe(false);
  });

  it('run() restores the process singleton when the callback throws', () => {
    const root = PluginManager.getInstance();
    expect(() =>
      PluginManager.run(() => {
        throw new Error('ssr fail');
      }),
    ).toThrow('ssr fail');
    expect(PluginManager.getInstance()).toBe(root);
  });

  it('reset() is the production alias of resetForTests', () => {
    PluginManager.getInstance().use({
      name: 'tmp',
      setup(ctx) {
        ctx.registerRoute({ path: '/tmp', component: dummyBuilder });
      },
    });
    PluginManager.reset();
    expect(PluginManager.getInstance().has('tmp')).toBe(false);
    expect(PluginManager.getInstance().getRoutes()).toEqual([]);
  });
});

describe('W3-08 no-regress smoke', () => {
  it('duplicate use() is still a no-op', () => {
    const setup = vi.fn();
    const plugin: FiboPlugin = { name: 'once', setup };
    PluginManager.getInstance().use(plugin).use(plugin);
    expect(setup).toHaveBeenCalledTimes(1);
  });
});

describe('W6-05 PluginManager SSR auto-reset', () => {
  it('endSsrRequest resets plugins when window is missing (Node SSR)', () => {
    PluginManager.getInstance().use({
      name: 'ssr-leak',
      setup(ctx) {
        ctx.registerRoute({ path: '/leak', component: dummyBuilder });
        ctx.registerStore({ n: 1 }, 'ssr-store');
      },
    });
    expect(PluginManager.getInstance().has('ssr-leak')).toBe(true);

    vi.stubGlobal('window', undefined);
    try {
      endSsrRequest();
      expect(PluginManager.getInstance().has('ssr-leak')).toBe(false);
      expect(PluginManager.getInstance().getRoutes()).toEqual([]);
      expect(PluginManager.getInstance().getStore('ssr-store')).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('endSsrRequest does not reset plugins on the client (window present)', () => {
    PluginManager.getInstance().use({
      name: 'client-keep',
      setup(ctx) {
        ctx.registerRoute({ path: '/keep', component: dummyBuilder });
      },
    });
    endSsrRequest();
    expect(PluginManager.getInstance().has('client-keep')).toBe(true);
    expect(PluginManager.getInstance().getRoutes().map((r) => r.path)).toEqual(['/keep']);
  });
});
