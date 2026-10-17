import { act, createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiboApp } from '../src/core/FiboApp';
import { PluginManager } from '../src/core/plugin/PluginManager';

afterEach(() => {
  vi.unstubAllGlobals();
  PluginManager.resetForTests();
  document.getElementById('w27-07-host')?.remove();
});

function host(): HTMLElement {
  const el = document.createElement('div');
  el.id = 'w27-07-host';
  document.body.appendChild(el);
  return el;
}

describe('W27-07 leftover: FiboApp remount / plugin uninstall vs W18-05', () => {
  it('remount then unmount uninstalls plugins this app installed', () => {
    host();
    const setup = vi.fn();
    const teardown = vi.fn();

    const app = FiboApp()
      .use({ name: 'w27-07-plug', setup, teardown })
      .root(() => createElement('span', { id: 'w27-07-ok' }, 'hi'));

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = app.mount('w27-07-host');
    });
    expect(document.getElementById('w27-07-ok')?.textContent).toBe('hi');
    expect(PluginManager.getInstance().has('w27-07-plug')).toBe(true);
    expect(setup).toHaveBeenCalledTimes(1);

    act(() => {
      unmount = app.mount('w27-07-host');
    });
    expect(PluginManager.getInstance().has('w27-07-plug')).toBe(true);
    expect(setup).toHaveBeenCalledTimes(2);

    act(() => {
      unmount();
    });
    expect(PluginManager.getInstance().has('w27-07-plug')).toBe(false);
    expect(teardown).toHaveBeenCalled();
  });

  it('failed plugin.use during mount uninstalls plugins already installed by this app', () => {
    host();
    expect(() =>
      FiboApp()
        .use({ name: 'w27-07-ok', setup() {} })
        .use({
          name: 'w27-07-boom',
          setup() {
            throw new Error('setup boom');
          },
        })
        .root(() => createElement('div'))
        .mount('w27-07-host'),
    ).toThrow(/setup boom/);
    expect(PluginManager.getInstance().has('w27-07-ok')).toBe(false);
    expect(PluginManager.getInstance().has('w27-07-boom')).toBe(false);
  });

  it('unmount still uninstalls later plugins when one teardown throws', () => {
    host();
    const later = vi.fn();
    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp()
        .use({
          name: 'w27-07-bad',
          setup() {},
          teardown() {
            throw new Error('teardown boom');
          },
        })
        .use({
          name: 'w27-07-good',
          setup() {},
          teardown: later,
        })
        .root(() => createElement('div'))
        .mount('w27-07-host');
    });

    expect(() => {
      act(() => {
        unmount();
      });
    }).not.toThrow();
    expect(later).toHaveBeenCalledTimes(1);
    expect(PluginManager.getInstance().has('w27-07-bad')).toBe(false);
    expect(PluginManager.getInstance().has('w27-07-good')).toBe(false);
  });

  it('unmount runs teardown LIFO (dependents first)', () => {
    host();
    const order: string[] = [];
    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp()
        .use({
          name: 'w27-07-base',
          setup() {
            order.push('setup-base');
          },
          teardown() {
            order.push('teardown-base');
          },
        })
        .use({
          name: 'w27-07-dep',
          setup() {
            order.push('setup-dep');
          },
          teardown() {
            order.push('teardown-dep');
          },
        })
        .root(() => createElement('div'))
        .mount('w27-07-host');
    });
    act(() => {
      unmount();
    });
    expect(order).toEqual(['setup-base', 'setup-dep', 'teardown-dep', 'teardown-base']);
  });
});
