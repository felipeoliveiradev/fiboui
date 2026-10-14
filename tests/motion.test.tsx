import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createElement, type ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Box, Button, Column, Text } from '../src';
import {
  MOTION_PRESETS,
  compileMotion,
  createMotionSpec,
  getMotionCss,
  resetMotionCssForTests,
  specFromPreset,
  springEase,
  startViewTransition,
  Presence,
} from '../src/motion';

function injectedCss(): string {
  const nodes = Array.from(document.querySelectorAll('style'));
  return nodes
    .map((node) => {
      const el = node as HTMLStyleElement;
      const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : '';
      return `${el.textContent ?? ''}\n${rules}`;
    })
    .join('\n');
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

afterEach(() => {
  resetMotionCssForTests();
});

describe('motion compile', () => {
  it('lists typed presets and aliases fade/scale/blur', () => {
    expect(MOTION_PRESETS).toContain('fadeIn');
    expect(specFromPreset('fade').preset).toBe('fadeIn');
    expect(specFromPreset('scale').preset).toBe('scaleIn');
    expect(specFromPreset('blur').preset).toBe('blurIn');
  });

  it('throws on an unknown preset', () => {
    expect(() => specFromPreset('not-a-preset')).toThrow(/Unknown motion preset/);
  });

  it('springEase is cached CSS linear() with no rAF', () => {
    const a = springEase();
    const b = springEase();
    expect(a).toBe(b);
    expect(a.startsWith('linear(')).toBe(true);
    expect(a).toContain('%');
  });

  it('compiles a preset to classes + CSS variables', () => {
    const compiled = compileMotion(createMotionSpec('fadeIn', { duration: 300, ease: 'spring' }));
    expect(compiled.className).toContain('fibo-anim');
    expect(compiled.className).toContain('fibo-anim-fadeIn');
    expect(compiled.style['--fibo-dur']).toBe('300ms');
    expect(compiled.style['--fibo-ease'].startsWith('linear(')).toBe(true);
  });

  it('deduplicates custom keyframes', () => {
    const custom = {
      from: { opacity: 0, transform: 'translateY(8px)' },
      to: { opacity: 1, transform: 'none' },
    };
    const first = compileMotion(createMotionSpec(custom));
    const second = compileMotion(createMotionSpec(custom));
    expect(first.className).toBe(second.className);
    const css = getMotionCss();
    const matches = css.match(/@keyframes fibo-c-/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('pop defaults to spring easing', () => {
    const spec = specFromPreset('pop');
    expect(spec.ease.startsWith('linear(')).toBe(true);
  });
});

describe('builder fluent API', () => {
  it('animate().duration().ease() stamps classes and variables', () => {
    const { container } = render(
      Box().animate('fadeIn').duration(300).ease('spring').id('fade-box').children([Text('Hi')])
    );
    const el = container.querySelector('#fade-box') as HTMLElement;
    expect(el.className).toContain('fibo-anim-fadeIn');
    expect(el.style.getPropertyValue('--fibo-dur')).toBe('300ms');
    expect(el.style.getPropertyValue('--fibo-ease')).toContain('linear(');
  });

  it('transition({ opacity: 200 }) registers a CSS transition', () => {
    const { container } = render(
      Box().transition({ opacity: 200, transform: '0.3s spring' }).id('tr').children('x')
    );
    const html = container.innerHTML;
    expect(html).toMatch(/opacity/);
    expect(injectedCss()).toMatch(/transition/i);
  });

  it('hover + press add CSS :hover/:active transforms', () => {
    render(
      Box()
        .hover((s) => s.scale(1.03))
        .press()
        .id('hp')
        .children('card')
    );
    const sheet = injectedCss();
    expect(sheet).toContain('scale(1.03)');
    expect(sheet).toContain('scale(0.97)');
    expect(sheet).toMatch(/:hover|:active|transform/);
  });

  it('stagger writes --fibo-stagger and --fibo-i', () => {
    const { container } = render(
      Column()
        .stagger(40)
        .id('stagger-col')
        .children([
          Text('a').animate('fadeIn'),
          Text('b').animate('fadeIn'),
        ])
    );
    expect(container.innerHTML).toContain('--fibo-stagger');
    expect(container.innerHTML).toContain('--fibo-i');
    expect(container.querySelectorAll('.fibo-stagger-item').length).toBe(2);
  });

  it('reveal wraps with data-fibo-reveal and uses IntersectionObserver (not rAF)', () => {
    const observed: Element[] = [];
    class FakeIO {
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb;
      }
      cb: IntersectionObserverCallback;
      observe(el: Element) {
        observed.push(el);
        this.cb(
          [{ isIntersecting: true, target: el } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIO);

    render(Box().reveal('fadeUp').id('rev').children([Text('shown')]));
    expect(observed.length).toBe(1);
    expect(observed[0].className).toContain('fibo-reveal-fadeUp');
    expect(observed[0].classList.contains('fibo-inview')).toBe(true);
    vi.unstubAllGlobals();
  });

  it('viewTransition sets the CSS name', () => {
    const { container } = render(
      Box().viewTransition('hero').id('vt').children('img')
    );
    const el = container.querySelector('#vt') as HTMLElement;
    expect(el.style.viewTransitionName).toBe('hero');
    expect(el.className).toContain('fibo-vt');
  });

  it('reducedMotion("never") adds fibo-motion-force', () => {
    const { container } = render(
      Box().animate('fadeIn').reducedMotion('never').id('force').children('x')
    );
    expect((container.querySelector('#force') as HTMLElement).className).toContain('fibo-motion-force');
  });
});

describe('SSR + reduced motion CSS', () => {
  it('renderToString includes classes, keyframes, and prefers-reduced-motion', () => {
    const html = renderToString(
      Box().animate('fadeIn').duration(300).ease('spring').children([Text('ssr-motion')]) as ReactElement
    );
    expect(html).toContain('ssr-motion');
    expect(html).toContain('fibo-anim-fadeIn');
    expect(html).toContain('@keyframes fibo-fadeIn');
    expect(html).toContain('prefers-reduced-motion');
    expect(html).toContain('--fibo-dur:300ms');
    expect(html).toContain('linear(');
  });

  it('shared sheet lists each preset keyframe once', () => {
    const css = getMotionCss();
    expect((css.match(/@keyframes fibo-fadeIn/g) ?? []).length).toBe(1);
    expect((css.match(/@keyframes fibo-slideUp/g) ?? []).length).toBe(1);
    expect(css).toContain('prefers-reduced-motion');
  });
});

describe('Presence + view transition helper', () => {
  it('Presence keeps the node until exit animationend', () => {
    const { rerender } = render(
      createElement(Presence, { show: true, exit: 'fadeOut' }, 'dialog')
    );
    expect(screen.getByText('dialog')).toBeInTheDocument();
    rerender(createElement(Presence, { show: false, exit: 'fadeOut' }, 'dialog'));
    const wrap = screen.getByText('dialog');
    expect(wrap.className).toContain('fibo-anim-fadeOut');
    expect(wrap.getAttribute('data-fibo-presence')).toBe('exit');
    fireEvent.animationEnd(wrap);
    expect(screen.queryByText('dialog')).toBeNull();
  });

  it('startViewTransition falls back to a sync update', () => {
    let ran = false;
    startViewTransition(() => {
      ran = true;
    });
    expect(ran).toBe(true);
  });
});

describe('no per-frame JS', () => {
  it('src/motion has no requestAnimationFrame or setInterval', () => {
    const files = walk(resolve(__dirname, '../src/motion')).filter((f) => /\.(ts|tsx)$/.test(f));
    expect(files.length).toBeGreaterThan(3);
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src, file).not.toMatch(/requestAnimationFrame/);
      expect(src, file).not.toMatch(/webkitRequestAnimationFrame/);
      expect(src, file).not.toMatch(/setInterval/);
    }
  });

  it('built motion.js (when present) stays free of rAF and kit components', () => {
    const motionJs = resolve(__dirname, '../dist/motion.js');
    if (!existsSync(motionJs)) return;
    const src = readFileSync(motionJs, 'utf8');
    expect(src).not.toMatch(/requestAnimationFrame/);
    expect(src).not.toMatch(/function Button/);
    expect(src).not.toMatch(/createContext/);
    expect(src).toMatch(/fibo-fadeIn|fibo-anim/);
  });
});

describe('public surface', () => {
  it('builders still render after motion chaining', () => {
    render(
      Column().children([
        Text('title').animate('slideUp'),
        Button('Go').animate('pop').press(),
      ])
    );
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
  });
});
