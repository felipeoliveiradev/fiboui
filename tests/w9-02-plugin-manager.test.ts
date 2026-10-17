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
  container.clear();
});

describe('W9-02 PluginManager leftover P0/P1', () => {
  it('run() unregisters DI tokens from the scoped plugins (no process leak)', () => {
    PluginManager.run(() => {
      PluginManager.getInstance().use({
        name: 'ssr-only',
        setup(ctx) {
          ctx.registerService('ssr-only-svc', () => 'scoped');
          ctx.registerRoute({ path: '/ssr-only', component: dummyBuilder });
        },
      });
      expect(container.has('ssr-only-svc')).toBe(true);
    });

    expect(container.has('ssr-only-svc')).toBe(false);
    expect(PluginManager.getInstance().has('ssr-only')).toBe(false);
  });

  it('run() of a thenable unregisters scoped services after settle', async () => {
    await PluginManager.run(async () => {
      PluginManager.getInstance().use({
        name: 'ssr-async',
        setup(ctx) {
          ctx.registerService('ssr-async-svc', () => 1);
        },
      });
      expect(container.has('ssr-async-svc')).toBe(true);
    });
    expect(container.has('ssr-async-svc')).toBe(false);
  });

  it('run() does not unregister a token still owned by the process singleton', () => {
    PluginManager.getInstance().use({
      name: 'owner',
      setup(ctx) {
        ctx.registerService('shared-svc', () => 'from-root');
      },
    });

    PluginManager.run(() => {
      PluginManager.getInstance().use({
        name: 'ssr',
        setup(ctx) {
          ctx.registerService('shared-svc', () => 'from-ssr');
        },
      });
    });

    expect(container.has('shared-svc')).toBe(true);
    expect(container.resolve('shared-svc')).toBe('from-root');
  });

  it('reset() runs teardown in reverse setup order (dependents first)', () => {
    const order: string[] = [];
    PluginManager.getInstance().use({
      name: 'base',
      setup() {
        order.push('setup-base');
      },
      teardown() {
        order.push('teardown-base');
      },
    });
    PluginManager.getInstance().use({
      name: 'dep',
      setup() {
        order.push('setup-dep');
      },
      teardown() {
        order.push('teardown-dep');
      },
    });

    PluginManager.reset();
    expect(order).toEqual(['setup-base', 'setup-dep', 'teardown-dep', 'teardown-base']);
  });

  it('use() of a different plugin with the same name throws', () => {
    const first: FiboPlugin = { name: 'dup', setup: vi.fn() };
    const second: FiboPlugin = { name: 'dup', setup: vi.fn() };
    PluginManager.getInstance().use(first);
    expect(() => PluginManager.getInstance().use(second)).toThrow(/already registered/i);
    expect(second.setup).not.toHaveBeenCalled();
    expect(PluginManager.getInstance().has('dup')).toBe(true);
  });

  it('use() without a name throws (nameless plugins would collide)', () => {
    expect(() =>
      PluginManager.getInstance().use({ name: '', setup: vi.fn() }),
    ).toThrow(/name is required/i);
  });

  it('use() of the same plugin object is still a no-op', () => {
    const setup = vi.fn();
    const plugin: FiboPlugin = { name: 'once', setup };
    PluginManager.getInstance().use(plugin).use(plugin);
    expect(setup).toHaveBeenCalledTimes(1);
  });

  it('setup throw is not swallowed and rolls back that plugin', () => {
    const pm = PluginManager.getInstance();
    expect(() =>
      pm.use({
        name: 'boom',
        setup(ctx) {
          ctx.registerService('boom-svc', () => 1);
          ctx.registerRoute({ path: '/boom', component: dummyBuilder });
          throw new Error('setup failed');
        },
      }),
    ).toThrow('setup failed');
    expect(pm.has('boom')).toBe(false);
    expect(pm.getRoutes()).toEqual([]);
    expect(container.has('boom-svc')).toBe(false);
  });
});
