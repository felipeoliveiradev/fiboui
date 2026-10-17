import { act, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Column,
  FineGrainText,
  ReactivityRoot,
  Text,
  bindText,
  createReactivityRoot,
  getCurrentScope,
  materialTheme,
  runInScope,
  signal,
} from '../src';
import { Effect } from '../src/core/state';
import {
  FineGrainText as ShimFineGrainText,
  bindText as shimBindText,
} from '../src/server-shims/FineGrain';
import pkg from '../package.json';
import * as publicApi from '../src';

describe('2.0 Column default', () => {
  it('centers children on the cross axis', () => {
    const { container } = render(Column().children([Text('x')]).build());
    expect(container.querySelector('.fibo-column')?.className).toMatch(/items-center/);
  });
});

describe('2.0 per-root activeEffect', () => {
  it('isolates effect tracking across reactivity roots', () => {
    const a = signal(1);
    const b = signal(10);
    const scopeA = createReactivityRoot();
    const scopeB = createReactivityRoot();
    const seenA: number[] = [];
    const seenB: number[] = [];

    runInScope(scopeA, () => {
      new Effect(() => {
        seenA.push(a.value);
      });
    });
    runInScope(scopeB, () => {
      new Effect(() => {
        seenB.push(b.value);
      });
    });

    expect(seenA).toEqual([1]);
    expect(seenB).toEqual([10]);

    runInScope(scopeA, () => {
      a.value = 2;
    });
    expect(seenA).toEqual([1, 2]);
    expect(seenB).toEqual([10]);

    runInScope(scopeB, () => {
      b.value = 20;
    });
    expect(seenA).toEqual([1, 2]);
    expect(seenB).toEqual([10, 20]);
  });

  it('restores the previous scope after nested runInScope', () => {
    const outer = createReactivityRoot();
    const inner = createReactivityRoot();
    runInScope(outer, () => {
      expect(getCurrentScope()).toBe(outer);
      runInScope(inner, () => {
        expect(getCurrentScope()).toBe(inner);
      });
      expect(getCurrentScope()).toBe(outer);
    });
  });

  it('ReactivityRoot provides an isolated scope to FineGrainText', () => {
    const sig = signal('alpha');
    render(
      <ReactivityRoot>
        <FineGrainText compute={() => sig.value} data-testid="fg" />
      </ReactivityRoot>
    );
    expect(screen.getByTestId('fg')).toHaveTextContent('alpha');
    act(() => {
      sig.value = 'beta';
    });
    expect(screen.getByTestId('fg')).toHaveTextContent('beta');
  });
});

describe('2.0 fine-grained DOM writes', () => {
  it('updates textContent without remounting the host node', () => {
    const sig = signal(0);
    const { container } = render(Text(() => `n=${sig.value}`).build());
    const node = container.querySelector('.fibo-text');
    expect(node?.textContent).toBe('n=0');
    act(() => {
      sig.value = 7;
    });
    expect(container.querySelector('.fibo-text')).toBe(node);
    expect(node?.textContent).toBe('n=7');
  });

  it('bindText writes the signal into a live text node', () => {
    const sig = signal('hello');
    const { container } = render(bindText(sig));
    const node = container.firstElementChild;
    expect(node?.textContent).toBe('hello');
    act(() => {
      sig.value = 'world';
    });
    expect(container.firstElementChild).toBe(node);
    expect(node?.textContent).toBe('world');
  });
});

describe('2.0 FineGrain SSR shim matches client host tag', () => {
  it('shim FineGrainText renders the same tag+text as the client (not a Fragment)', () => {
    const sig = signal('ssr-hi');
    const compute = () => sig.value;
    const client = renderToString(
      createElement(FineGrainText, { compute, as: 'p', className: 'fibo-text fibo-text-body' })
    );
    const shim = renderToString(
      createElement(ShimFineGrainText, { compute, as: 'p', className: 'fibo-text fibo-text-body' })
    );
    expect(client).toContain('ssr-hi');
    expect(shim).toContain('ssr-hi');
    expect(shim).toMatch(/<p\b/);
    expect(client).toMatch(/<p\b/);
    expect(shim).toBe(client);
  });

  it('shim bindText emits a span host like the client, not a raw string', () => {
    const sig = signal('bound');
    const client = renderToString(bindText(sig));
    const shim = renderToString(shimBindText(sig) as never);
    expect(client).toMatch(/<span\b/);
    expect(shim).toMatch(/<span\b/);
    expect(shim).toContain('bound');
    expect(shim).toBe(client);
  });
});

describe('2.0 theme token unification', () => {
  it('Material JS + CSS agree on M3 primary #6750A4', () => {
    expect(materialTheme.colors.primary).toBe('#6750A4');
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8');
    const material = readFileSync(resolve(__dirname, '../src/styles/themes/material.css'), 'utf8');
    expect(material).toContain('--fibo-primary: #6750A4');
    expect(base).not.toContain('#1976d2');
    expect(base).not.toContain('#6200EE');
    expect(base).not.toMatch(/\.fibo-theme-material\s*\{[^}]*--fibo-primary\s*:/);
  });

  it('base.css default --fibo-theme is material', () => {
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8');
    expect(base).toMatch(/--fibo-theme:\s*'material'/);
  });

  it('web.css publishes --fibo-error matching the web JS token', () => {
    const web = readFileSync(resolve(__dirname, '../src/styles/themes/web.css'), 'utf8');
    expect(web).toMatch(/--fibo-error:\s*#EF4444/i);
  });
});

describe('2.0 curated exports', () => {
  it('exports the public surface and not Stakent demo helpers', () => {
    expect(publicApi.Button).toBeTypeOf('function');
    expect(publicApi.Column).toBeTypeOf('function');
    expect(publicApi.signal).toBeTypeOf('function');
    expect(publicApi.ListTile).toBeTypeOf('function');
    expect(publicApi.mount).toBeTypeOf('function');
    expect(publicApi.Fibo).toBeTypeOf('function');
    expect(publicApi).not.toHaveProperty('StakentButton');
    expect(publicApi).not.toHaveProperty('_styleManager');
    expect(publicApi).not.toHaveProperty('createBuilder');
  });
});

describe('2.0 pack / module flags', () => {
  it('drops src/ from files and is type=module', () => {
    expect(pkg.type).toBe('module');
    expect(pkg.files).not.toContain('src');
    expect(pkg.files).toEqual(['dist']);
  });

  it('root JS entry does not import CSS', () => {
    const source = readFileSync(resolve(__dirname, '../src/index.ts'), 'utf8');
    expect(source).not.toMatch(/\.css['"]/);
  });
});

describe('2.0 leftover public export surface', () => {
  it('root exports GridItem, Form, listSignal, Outlet; not Chip/IconButton', () => {
    expect(publicApi.GridItem).toBeTypeOf('function');
    expect(publicApi.Form).toBeTypeOf('function');
    expect(publicApi.listSignal).toBeTypeOf('function');
    expect(publicApi.collection).toBe(publicApi.listSignal);
    expect(publicApi.Outlet).toBeTypeOf('function');
    expect(publicApi).not.toHaveProperty('Chip');
    expect(publicApi).not.toHaveProperty('IconButton');
  });

  it('FormErrorMode is a root type union', () => {
    type Mode = import('../src').FormErrorMode;
    const modes: Mode[] = ['field', 'below', 'manual'];
    expect(modes).toEqual(['field', 'below', 'manual']);
  });

  it('root navigation names match the navigation barrel extras', () => {
    expect(publicApi.lazyRoute).toBeTypeOf('function');
    expect(publicApi.preloadRoute).toBeTypeOf('function');
    expect(publicApi.useRouteMeta).toBeTypeOf('function');
  });
});

