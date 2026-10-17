import { act, createElement, useEffect } from 'react';
import { render, cleanup } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FiboApp, mount, page, Text } from '../src';
import { PluginManager } from '../src/core/plugin/PluginManager';

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
  PluginManager.resetForTests();
  document.getElementById('root')?.remove();
  document.getElementById('w18-05-host')?.remove();
  document.head.querySelectorAll('meta[name="description"]').forEach((n) => n.remove());
  document.title = '';
});

describe('W18-05 leftover: FiboApp #root strip + document guard + StrictMode', () => {
  it('FiboApp.mount("#root") finds id=root', () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);

    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp()
        .root(() => createElement('span', { id: 'w18-05-ok' }, 'hi'))
        .mount('#root');
    });
    expect(document.getElementById('w18-05-ok')?.textContent).toBe('hi');
    act(() => {
      unmount();
    });
  });

  it('FiboApp.mount is a no-op when document is undefined (SSR)', () => {
    vi.stubGlobal('document', undefined);
    const unmount = FiboApp()
      .root(() => createElement('div'))
      .mount('#root');
    expect(typeof unmount).toBe('function');
    expect(() => unmount()).not.toThrow();
  });

  it('FiboApp StrictMode double-invokes effects by default', () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);
    let effects = 0;
    function Probe() {
      useEffect(() => {
        effects += 1;
      }, []);
      return createElement('span', { id: 'w18-05-strict' }, 'ok');
    }
    let unmount: () => void = () => undefined;
    act(() => {
      unmount = FiboApp().root(Probe).mount('#root');
    });
    expect(effects).toBe(2);
    act(() => {
      unmount();
    });
  });
});

describe('W18-05 leftover: mount() #root + document guard + StrictMode', () => {
  it('mount("#root") finds id=root', () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);
    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount('#root', () => Text('mounted-hash'));
    });
    expect(host.textContent).toContain('mounted-hash');
    act(() => {
      root.unmount();
    });
  });

  it('mount("root") without hash still finds id=root', () => {
    const host = document.createElement('div');
    host.id = 'root';
    document.body.appendChild(host);
    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount('root', () => Text('mounted-id'));
    });
    expect(host.textContent).toContain('mounted-id');
    act(() => {
      root.unmount();
    });
  });

  it('mount(".class") still accepts a CSS selector', () => {
    const host = document.createElement('div');
    host.className = 'w18-05-css';
    document.body.appendChild(host);
    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount('.w18-05-css', () => Text('mounted-css'));
    });
    expect(host.textContent).toContain('mounted-css');
    act(() => {
      root.unmount();
    });
    host.remove();
  });

  it('mount is a no-op when document is undefined (SSR)', () => {
    vi.stubGlobal('document', undefined);
    try {
      const root = mount('#root', () => Text('ssr'));
      expect(typeof root.unmount).toBe('function');
      expect(() => root.unmount()).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('mount still throws on the client when #root is missing', () => {
    expect(() => mount('#root', () => Text('nope'))).toThrow(/#root/);
  });
});

describe('W18-05 leftover: page() metadata', () => {
  it('SSR HTML includes title + description', () => {
    const Page = page(() => Text('Body'), {
      styles: false,
      meta: { title: 'W18 Home', description: 'W18 hello' },
    });
    const html = renderToString(createElement(Page));
    expect(html).toMatch(/<title[^>]*>W18 Home<\/title>/);
    expect(html).toMatch(/name="description"/);
    expect(html).toContain('W18 hello');
  });

  it('client render stamps document.title and description meta', () => {
    const Page = page(() => Text('Body'), {
      styles: false,
      meta: { title: 'W18 Home', description: 'W18 hello' },
    });
    render(createElement(Page));
    expect(document.title).toBe('W18 Home');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'W18 hello',
    );
  });
});
