import 'reflect-metadata';
import { act, createElement, useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  bindHotkeys,
  goHash,
  open,
  openExternal,
  writeClipboard,
} from '../src/core/platform';
import { FiboApp } from '../src/core/FiboApp';
import { PluginManager } from '../src/core/plugin/PluginManager';
import type { FiboPlugin } from '../src/core/plugin/types';
import type { FiboBuilder } from '../src/core/builder';
import { container, Inject, Injectable } from '../src/core/di';
import { useProvider, useStateContext } from '../src/core/StateWrapper';

function dummyBuilder(): FiboBuilder {
  return { build: () => createElement('div') } as unknown as FiboBuilder;
}

describe('platform facade', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writeClipboard uses navigator.clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    await expect(writeClipboard('hi')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('hi');
  });

  it('writeClipboard returns false when clipboard API is missing (SSR / insecure)', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    await expect(writeClipboard('hi')).resolves.toBe(false);
  });

  it('writeClipboard returns false when writeText rejects', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    await expect(writeClipboard('hi')).resolves.toBe(false);
  });

  it('open is canonical; openExternal is the same function (no break)', () => {
    expect(openExternal).toBe(open);
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    open('https://example.com');
    expect(spy).toHaveBeenCalledWith(
      'https://example.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('open refuses javascript: / data: / vbscript: URLs', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    open('javascript:alert(1)');
    open('JAVASCRIPT:alert(1)');
    open('data:text/html,<script>alert(1)</script>');
    open('vbscript:msgbox(1)');
    expect(spy).not.toHaveBeenCalled();
  });

  it('open no-ops when window is undefined (SSR)', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.stubGlobal('window', undefined);
    expect(() => open('https://example.com')).not.toThrow();
    expect(spy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('goHash delegates to scrollTo({ hash: true })', () => {
    const el = document.createElement('div');
    el.id = 'architecture';
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    goHash('architecture');
    expect(window.location.hash).toBe('#architecture');
    expect(el.scrollIntoView).toHaveBeenCalled();
    el.remove();
  });

  it('bindHotkeys listens for metaOrCtrl+k', () => {
    const run = vi.fn();
    const unbind = bindHotkeys([{ key: 'k', metaOrCtrl: true, run }]);
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
    expect(run).toHaveBeenCalledTimes(1);
    unbind();
  });

  it('bindHotkeys unsubscribe removes the listener and is idempotent', () => {
    const run = vi.fn();
    const unbind = bindHotkeys([{ key: 'k', metaOrCtrl: true, run }]);
    unbind();
    unbind();
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
    );
    expect(run).not.toHaveBeenCalled();
  });

  it('bindHotkeys no-ops when window is undefined (SSR)', () => {
    const run = vi.fn();
    vi.stubGlobal('window', undefined);
    const unbind = bindHotkeys([{ key: 'k', metaOrCtrl: true, run }]);
    expect(typeof unbind).toBe('function');
    expect(() => unbind()).not.toThrow();
    vi.unstubAllGlobals();
  });
});

describe('PluginManager leaks', () => {
  afterEach(() => {
    PluginManager.resetForTests();
    container.clear();
  });

  it('resetForTests drops routes, stores, sidebar, and plugins', () => {
    const pm = PluginManager.getInstance();
    pm.use({
      name: 'alpha',
      setup(ctx) {
        ctx.registerRoute({ path: '/a', component: dummyBuilder });
        ctx.registerStore({ n: 1 }, 'alpha-store');
        ctx.registerSidebarItem({ label: 'A', path: '/a' });
      },
    });
    expect(pm.getRoutes()).toHaveLength(1);
    PluginManager.resetForTests();
    const next = PluginManager.getInstance();
    expect(next.getRoutes()).toEqual([]);
    expect(next.getStore('alpha-store')).toBeUndefined();
    expect(next.getSidebarItems()).toEqual([]);
    expect(next.has('alpha')).toBe(false);
  });

  it('getRoutes / getStores / getSidebarItems return copies (no live leak)', () => {
    const pm = PluginManager.getInstance();
    pm.registerRoute({ path: '/live', component: dummyBuilder });
    pm.registerStore({ n: 1 }, 's');
    pm.registerSidebarItem({ label: 'L', path: '/live', order: 2 });

    pm.getRoutes().push({ path: '/ghost', component: dummyBuilder });
    pm.getStores().set('hack', 1);
    pm.getSidebarItems().push({ label: 'ghost', path: '/g' });
    pm.getTopbarActions().push(dummyBuilder);
    pm.getOverlays().push(dummyBuilder);

    expect(pm.getRoutes().map((r) => r.path)).toEqual(['/live']);
    expect(pm.getStore('hack')).toBeUndefined();
    expect(pm.getSidebarItems().map((i) => i.label)).toEqual(['L']);
    expect(pm.getTopbarActions()).toEqual([]);
    expect(pm.getOverlays()).toEqual([]);
  });

  it('getSidebarItems sorts a copy, not the internal insertion list', () => {
    const pm = PluginManager.getInstance();
    pm.registerSidebarItem({ label: 'b', path: '/b', order: 2 });
    pm.registerSidebarItem({ label: 'a', path: '/a', order: 1 });
    expect(pm.getSidebarItems().map((i) => i.label)).toEqual(['a', 'b']);
    pm.getSidebarItems().reverse();
    expect(pm.getSidebarItems().map((i) => i.label)).toEqual(['a', 'b']);
  });

  it('uninstall runs teardown and drops that plugin’s routes, stores, and services', () => {
    const pm = PluginManager.getInstance();
    const teardown = vi.fn();
    container.register('from-plugin', () => 'svc');
    pm.use({
      name: 'mod',
      setup(ctx) {
        ctx.registerRoute({ path: '/mod', component: dummyBuilder });
        ctx.registerStore({ ok: true }, 'mod-store');
        ctx.registerService('from-plugin', () => 'svc');
        ctx.registerSidebarItem({ label: 'Mod', path: '/mod' });
        ctx.registerTopbarAction(dummyBuilder);
        ctx.registerOverlay(dummyBuilder);
      },
      teardown,
    });
    expect(pm.has('mod')).toBe(true);
    expect(container.has('from-plugin')).toBe(true);

    expect(pm.uninstall('mod')).toBe(true);
    expect(teardown).toHaveBeenCalledTimes(1);
    expect(pm.has('mod')).toBe(false);
    expect(pm.getRoutes()).toEqual([]);
    expect(pm.getStore('mod-store')).toBeUndefined();
    expect(pm.getSidebarItems()).toEqual([]);
    expect(pm.getTopbarActions()).toEqual([]);
    expect(pm.getOverlays()).toEqual([]);
    expect(container.has('from-plugin')).toBe(false);
  });

  it('use() of the same name does not run setup twice', () => {
    const pm = PluginManager.getInstance();
    const setup = vi.fn();
    const plugin: FiboPlugin = { name: 'once', setup };
    pm.use(plugin).use(plugin);
    expect(setup).toHaveBeenCalledTimes(1);
  });

  it('failed setup rolls back registrations (no half-installed plugin)', () => {
    const pm = PluginManager.getInstance();
    expect(() =>
      pm.use({
        name: 'boom',
        setup(ctx) {
          ctx.registerRoute({ path: '/boom', component: dummyBuilder });
          ctx.registerStore({ x: 1 }, 'boom-store');
          throw new Error('setup failed');
        },
      }),
    ).toThrow('setup failed');
    expect(pm.has('boom')).toBe(false);
    expect(pm.getRoutes()).toEqual([]);
    expect(pm.getStore('boom-store')).toBeUndefined();
  });
});

describe('DI container', () => {
  afterEach(() => {
    container.clear();
  });

  it('resolves @Inject constructor tokens (not new Ctor() with zero args)', () => {
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

    const greeter = container.resolve(Greeter);
    expect(greeter.logger).toBeInstanceOf(Logger);
    expect(greeter.logger.ping()).toBe('pong');
  });

  it('calls factory functions instead of constructing them (primitive return)', () => {
    container.register('num', function makeNum() {
      return 42;
    });
    expect(container.resolve<number>('num')).toBe(42);
  });

  it('throws on circular constructor injection', () => {
    class A {
      constructor(@Inject('B') readonly b: unknown) {}
    }
    class B {
      constructor(@Inject('A') readonly a: unknown) {}
    }
    container.register('A', A);
    container.register('B', B);
    expect(() => container.resolve('A')).toThrow(/circular/i);
  });

  it('clear() disposes singleton instances that expose dispose()', () => {
    const dispose = vi.fn();
    container.registerSingleton('res', () => ({ dispose }));
    container.resolve('res');
    container.clear();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(container.has('res')).toBe(false);
  });

  it('unregister drops a token and disposes its singleton', () => {
    const dispose = vi.fn();
    container.registerSingleton('res', () => ({ dispose }));
    container.resolve('res');
    expect(container.unregister('res')).toBe(true);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(container.has('res')).toBe(false);
  });
});

describe('FiboApp mount / SSR / plugin leak', () => {
  afterEach(() => {
    PluginManager.resetForTests();
    container.clear();
    document.getElementById('fibo-app-root')?.remove();
  });

  it('mount throws when the root element is missing', () => {
    expect(() =>
      FiboApp()
        .root(() => createElement('div'))
        .mount('missing-root'),
    ).toThrow(/missing-root/);
  });

  it('mount returns unmount that removes plugins this app installed', () => {
    const host = document.createElement('div');
    host.id = 'fibo-app-root';
    document.body.appendChild(host);

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp()
        .use({
          name: 'app-plug',
          setup(ctx) {
            ctx.registerRoute({ path: '/app', component: dummyBuilder });
            ctx.registerStore({ from: 'plugin' }, 'app-store');
          },
        })
        .root(() => createElement('div', { id: 'app-inner' }, 'ok'))
        .mount('fibo-app-root');
    });

    expect(typeof unmount).toBe('function');
    expect(PluginManager.getInstance().has('app-plug')).toBe(true);
    expect(PluginManager.getInstance().getRoutes().map((r) => r.path)).toEqual(['/app']);

    act(() => {
      unmount();
    });
    expect(PluginManager.getInstance().has('app-plug')).toBe(false);
    expect(PluginManager.getInstance().getRoutes()).toEqual([]);
    expect(PluginManager.getInstance().getStore('app-store')).toBeUndefined();
  });

  it('wires plugin stores into StateWrapper / ProviderWrapper', () => {
    const host = document.createElement('div');
    host.id = 'fibo-app-root';
    document.body.appendChild(host);

    function Probe() {
      const state = useStateContext();
      const viaProvider = useProvider<{ from: string }>('app-store');
      return createElement(
        'span',
        { id: 'probe' },
        `${String(state.get('app-store') !== undefined)}:${viaProvider?.from ?? ''}`,
      );
    }

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp()
        .use({
          name: 'store-plug',
          setup(ctx) {
            ctx.registerStore({ from: 'plugin' }, 'app-store');
          },
        })
        .root(Probe)
        .mount('fibo-app-root');
    });

    expect(document.getElementById('probe')?.textContent).toBe('true:plugin');
    act(() => {
      unmount();
    });
  });

  it('mount is a no-op when document is undefined (SSR)', () => {
    vi.stubGlobal('document', undefined);
    const unmount = FiboApp()
      .root(() => createElement('div'))
      .mount('nope');
    expect(typeof unmount).toBe('function');
    expect(() => unmount()).not.toThrow();
    vi.unstubAllGlobals();
  });

  it('wraps StrictMode by default like mount()', () => {
    const host = document.createElement('div');
    host.id = 'fibo-app-root';
    document.body.appendChild(host);

    let effects = 0;
    function Probe() {
      useEffect(() => {
        effects += 1;
      }, []);
      return createElement('span', { id: 'strict-probe' }, 'ok');
    }

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp().root(Probe).mount('fibo-app-root');
    });
    expect(document.getElementById('strict-probe')?.textContent).toBe('ok');
    expect(effects).toBe(2);
    act(() => {
      unmount();
    });
  });

  it('mount({ strict: false }) skips StrictMode', () => {
    const host = document.createElement('div');
    host.id = 'fibo-app-root';
    document.body.appendChild(host);

    let effects = 0;
    function Probe() {
      useEffect(() => {
        effects += 1;
      }, []);
      return createElement('span', { id: 'loose-probe' }, 'ok');
    }

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp().root(Probe).mount('fibo-app-root', { strict: false });
    });
    expect(document.getElementById('loose-probe')?.textContent).toBe('ok');
    expect(effects).toBe(1);
    act(() => {
      unmount();
    });
  });
});
