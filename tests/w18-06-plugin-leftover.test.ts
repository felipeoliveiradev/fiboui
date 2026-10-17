import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { container } from '../src/core/di';
import { PluginManager } from '../src/core/plugin/PluginManager';
import type { FiboPlugin } from '../src/core/plugin/types';
import type { FiboBuilder } from '../src/core/builder';
import { createElement } from 'react';

function dummyBuilder(): FiboBuilder {
  return { build: () => createElement('div') } as unknown as FiboBuilder;
}

afterEach(() => {
  PluginManager.resetForTests();
  try {
    container.clear();
  } catch {
    // dispose threw
  }
});

describe('W18-06 PluginManager leftover — duplicate install during setup', () => {
  it('use() of the same plugin object during its own setup is a no-op (no stack overflow)', () => {
    const setup = vi.fn((ctx) => {
      PluginManager.getInstance().use(plugin);
      ctx.registerService('self-svc', () => 1);
    });
    const plugin: FiboPlugin = { name: 'self', setup };
    PluginManager.getInstance().use(plugin);
    expect(setup).toHaveBeenCalledTimes(1);
    expect(PluginManager.getInstance().has('self')).toBe(true);
    expect(container.has('self-svc')).toBe(true);
  });

  it('use() of a different plugin with the same name during setup throws (no leaked services)', () => {
    const innerSetup = vi.fn((ctx) => {
      ctx.registerService('dup-inner-svc', () => 'inner');
      ctx.registerRoute({ path: '/inner', component: dummyBuilder });
    });
    expect(() =>
      PluginManager.getInstance().use({
        name: 'dup',
        setup(ctx) {
          ctx.registerService('dup-outer-svc', () => 'outer');
          PluginManager.getInstance().use({ name: 'dup', setup: innerSetup });
        },
      }),
    ).toThrow(/already registered/i);
    expect(innerSetup).not.toHaveBeenCalled();
    expect(PluginManager.getInstance().has('dup')).toBe(false);
    expect(PluginManager.getInstance().getRoutes()).toEqual([]);
    expect(container.has('dup-inner-svc')).toBe(false);
    expect(container.has('dup-outer-svc')).toBe(false);
  });
});

describe('W18-06 PluginManager leftover — uninstall LIFO', () => {
  it('nested use() during setup tears down the parent before the child it installed', () => {
    const order: string[] = [];
    PluginManager.getInstance().use({
      name: 'parent',
      setup() {
        order.push('setup-parent');
        PluginManager.getInstance().use({
          name: 'child',
          setup() {
            order.push('setup-child');
          },
          teardown() {
            order.push('teardown-child');
          },
        });
      },
      teardown() {
        order.push('teardown-parent');
      },
    });

    PluginManager.reset();
    expect(order).toEqual([
      'setup-parent',
      'setup-child',
      'teardown-parent',
      'teardown-child',
    ]);
  });

  it('run() tears down scoped plugins LIFO (dependents first)', () => {
    const order: string[] = [];
    PluginManager.run(() => {
      const pm = PluginManager.getInstance();
      pm.use({
        name: 'base',
        setup() {
          order.push('setup-base');
        },
        teardown() {
          order.push('teardown-base');
        },
      });
      pm.use({
        name: 'dep',
        setup() {
          order.push('setup-dep');
        },
        teardown() {
          order.push('teardown-dep');
        },
      });
    });
    expect(order).toEqual(['setup-base', 'setup-dep', 'teardown-dep', 'teardown-base']);
  });
});

describe('W18-06 PluginManager leftover — run/reset + SSR vs DI', () => {
  it('reset() drops process DI singletons that no plugin owns', () => {
    container.registerSingleton('orphan-w18-06', () => ({ id: 1 }));
    expect(container.resolve('orphan-w18-06')).toEqual({ id: 1 });
    PluginManager.reset();
    expect(container.has('orphan-w18-06')).toBe(false);
  });

  it('run() of a rejected thenable still uninstalls scoped services', async () => {
    const leaked = PluginManager.run(() => {
      PluginManager.getInstance().use({
        name: 'reject-svc',
        setup(ctx) {
          ctx.registerService('reject-svc', () => 1);
        },
      });
      return Promise.reject(new Error('ssr fail'));
    });
    await expect(leaked).rejects.toThrow('ssr fail');
    expect(container.has('reject-svc')).toBe(false);
    expect(PluginManager.getInstance().has('reject-svc')).toBe(false);
  });

  it('use() after uninstall of that name runs setup again', () => {
    const setup = vi.fn();
    const plugin: FiboPlugin = { name: 'again', setup };
    const pm = PluginManager.getInstance();
    pm.use(plugin);
    pm.uninstall('again');
    pm.use(plugin);
    expect(setup).toHaveBeenCalledTimes(2);
  });
});
