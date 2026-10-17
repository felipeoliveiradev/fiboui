import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { renderButtonHost } from '../src/interactive/Button/host';

const ROOT = resolve(__dirname, '..');

describe('RSC Button host', () => {
  it('omits event handlers so Next prerender can serialize the tree', () => {
    const el = renderButtonHost(
      { text: 'Go', id: 'go', type: 'button' },
      false,
    ) as ReactElement<Record<string, unknown>>;
    expect(el.type).toBe('button');
    expect(el.props.onClick).toBeUndefined();
    expect(el.props.onMouseEnter).toBeUndefined();
    expect(el.props.id).toBe('go');
    expect(el.props.type).toBe('button');
    expect(renderToString(el)).toContain('Go');
  });

  it('strips function props from rest on the server host', () => {
    const el = renderButtonHost(
      {
        text: 'Go',
        onMouseEnter: () => undefined,
        onFocus: () => undefined,
      },
      false,
    ) as ReactElement<Record<string, unknown>>;
    expect(el.props.onMouseEnter).toBeUndefined();
    expect(el.props.onFocus).toBeUndefined();
  });

  it('client host keeps click for ripple and onPress', () => {
    const el = renderButtonHost(
      { text: 'Go', onPress: () => undefined },
      true,
    ) as ReactElement<Record<string, unknown>>;
    expect(typeof el.props.onClick).toBe('function');
  });

  it('RSC vite config remaps ButtonInner to the server shim', () => {
    const src = readFileSync(resolve(ROOT, 'vite.server.config.ts'), 'utf8');
    expect(src).toContain("src/server-shims/ButtonInner.tsx");
    expect(src).toContain('/interactive/Button/');
  });

  it('RSC ButtonInner shim paints without a use-client boundary', () => {
    const src = readFileSync(resolve(ROOT, 'src/server-shims/ButtonInner.tsx'), 'utf8');
    expect(src.trimStart()).not.toMatch(/^['"]use client['"]/);
    expect(src).toContain('renderButtonHost(props, false)');
  });
});
