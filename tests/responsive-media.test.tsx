import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { applyResponsiveStyles } from '../src/core/component';
import { FIBO_BREAKPOINTS, toMediaQuery } from '../src/core/breakpoints';
import { Box, Text } from '../src';

function injectedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => {
      const el = node as HTMLStyleElement;
      const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : '';
      return `${el.textContent ?? ''}\n${rules}`;
    })
    .join('\n');
}

describe('breakpoint helpers', () => {
  it('maps named keys to Tailwind-aligned min-width queries', () => {
    expect(FIBO_BREAKPOINTS).toEqual({ sm: 640, md: 768, lg: 1024, xl: 1280 });
    expect(toMediaQuery('sm')).toBe('(min-width: 640px)');
    expect(toMediaQuery('md')).toBe('(min-width: 768px)');
    expect(toMediaQuery('(prefers-color-scheme: dark)')).toBe('(prefers-color-scheme: dark)');
    expect(toMediaQuery('@media (min-width: 900px)')).toBe('(min-width: 900px)');
  });
});

describe('builder .media() / .md()', () => {
  it('injects CSS @media rules and stamps classes', () => {
    const { container } = render(
      Box().padding(8).media('md', { padding: 16 }).lg({ padding: 24 }).id('mq').children('x')
    );
    const el = container.querySelector('#mq') as HTMLElement;
    expect(el.className).toMatch(/fibo-mq-/);
    const css = injectedCss();
    expect(css).toMatch(/@media \(min-width: 768px\)/);
    expect(css).toMatch(/@media \(min-width: 1024px\)/);
    expect(css).toMatch(/padding:\s*16px/i);
    expect(css).toMatch(/padding:\s*24px/i);
  });

  it('accepts a raw query including prefers-color-scheme', () => {
    render(
      Box()
        .media('(prefers-color-scheme: dark)', { backgroundColor: '#111', color: '#eee' })
        .id('dark')
        .children('night')
    );
    const css = injectedCss();
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toMatch(/background-color:\s*#111/i);
  });

  it('deduplicates the same media + property + value', () => {
    const { container } = render(
      Box().children([
        Box().md({ padding: 16 }).id('a').children('a'),
        Box().md({ padding: 16 }).id('b').children('b'),
      ])
    );
    const a = (container.querySelector('#a') as HTMLElement).className;
    const b = (container.querySelector('#b') as HTMLElement).className;
    const classA = a.split(/\s+/).find((c) => c.startsWith('fibo-mq-'));
    const classB = b.split(/\s+/).find((c) => c.startsWith('fibo-mq-'));
    expect(classA).toBeTruthy();
    expect(classA).toBe(classB);
    const matches = injectedCss().match(/@media \(min-width: 768px\)/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('works on Text and keeps .responsive() JS path', () => {
    const { container } = render(
      Text('Hi').id('t').md({ fontSize: '2rem' }).responsive({
        mobile: { color: 'red' },
        desktop: { color: 'blue' },
      })
    );
    expect((container.querySelector('#t') as HTMLElement).className).toMatch(/fibo-mq-/);
    expect(applyResponsiveStyles({ color: 'black' }, {
      mobile: { color: 'red' },
      tablet: { color: 'green' },
      desktop: { color: 'blue' },
    }, 400).color).toBe('red');
  });
});
