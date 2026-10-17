import { act, createElement, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { FiboApp, mount, page, Text } from '../src';
import { PluginManager } from '../src/core/plugin/PluginManager';

afterEach(() => {
  PluginManager.resetForTests();
  document.getElementById('root')?.remove();
  document.getElementById('w10-04-host')?.remove();
  document.title = '';
});

describe('W10-04 FiboApp #root', () => {
  it('mount("#root") finds id=root (does not false-throw)', () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp()
        .root(() => createElement('span', { id: 'w10-04-ok' }, 'hi'))
        .mount('#root');
    });

    expect(document.getElementById('w10-04-ok')?.textContent).toBe('hi');
    act(() => {
      unmount();
    });
  });

  it('mount("#root") throws when #root is missing', () => {
    expect(() =>
      FiboApp()
        .root(() => createElement('div'))
        .mount('#root'),
    ).toThrow(/#root/);
  });
});

describe('W10-04 mount() StrictMode + missing target', () => {
  it('throws when #root is missing', () => {
    expect(() => mount('#root', () => Text('nope'))).toThrow(/#root/);
  });

  it('double-invokes a factory with hooks under StrictMode', () => {
    const host = document.createElement('div');
    host.id = 'w10-04-host';
    document.body.appendChild(host);

    let effects = 0;
    function App() {
      useEffect(() => {
        effects += 1;
      }, []);
      return Text('strict-factory');
    }

    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount(host, App);
    });

    expect(host.textContent).toContain('strict-factory');
    expect(effects).toBe(2);
    act(() => {
      root.unmount();
    });
  });

  it('mount({ strict: false }) runs the factory effect once', () => {
    const host = document.createElement('div');
    host.id = 'w10-04-host';
    document.body.appendChild(host);

    let effects = 0;
    function App() {
      useEffect(() => {
        effects += 1;
      }, []);
      return Text('loose-factory');
    }

    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount(host, App, { strict: false });
    });

    expect(host.textContent).toContain('loose-factory');
    expect(effects).toBe(1);
    act(() => {
      root.unmount();
    });
  });
});

describe('W10-04 page() meta', () => {
  it('emits title + description and stamps Page.meta', () => {
    const Page = page(() => Text('Body'), {
      styles: false,
      meta: { title: 'Home', description: 'Hello world' },
    });
    const html = renderToString(createElement(Page));
    expect(html).toContain('Body');
    expect(html).toMatch(/<title[^>]*>Home<\/title>/);
    expect(html).toMatch(/name="description"/);
    expect(html).toContain('Hello world');
    expect((Page as { meta?: { title?: string; description?: string } }).meta).toEqual({
      title: 'Home',
      description: 'Hello world',
    });
  });
});
