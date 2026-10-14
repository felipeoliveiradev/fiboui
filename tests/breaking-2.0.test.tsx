import { act, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

describe('2.0 theme token unification', () => {
  it('Material JS + CSS agree on M3 primary #6750A4', () => {
    expect(materialTheme.colors.primary).toBe('#6750A4');
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8');
    const material = readFileSync(resolve(__dirname, '../src/styles/themes/material.css'), 'utf8');
    expect(base).toContain('--fibo-primary: #6750A4');
    expect(material).toContain('--fibo-primary: #6750A4');
    expect(base).not.toContain('#1976d2');
    expect(base).not.toContain('#6200EE');
  });
});

describe('2.0 curated exports', () => {
  it('exports the public surface and not Stakent demo helpers', () => {
    expect(publicApi.Button).toBeTypeOf('function');
    expect(publicApi.Column).toBeTypeOf('function');
    expect(publicApi.signal).toBeTypeOf('function');
    expect(publicApi.ListTile).toBeTypeOf('function');
    expect(publicApi.mount).toBeTypeOf('function');
    expect(publicApi.Section).toBeTypeOf('function');
    expect(publicApi.Anchor).toBeTypeOf('function');
    expect(publicApi.Code).toBeTypeOf('function');
    expect(publicApi.Svg).toBeTypeOf('function');
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
