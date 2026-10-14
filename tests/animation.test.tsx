import { act, fireEvent, render, screen } from '@testing-library/react';
import { isValidElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Box,
  Button,
  Column,
  MOTION_PRESETS,
  MotionStyles,
  Presence,
  Reveal,
  getMotionCss,
  normalizePreset,
  resolveCssEase,
  scrollTo,
  signal,
  springEase,
  useSpring,
  useStagger,
  useTransition,
} from '../src';

function injectedCss(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((node) => {
      const el = node as HTMLStyleElement;
      const rules = el.sheet ? Array.from(el.sheet.cssRules).map((r) => r.cssText).join('\n') : '';
      return `${el.textContent ?? ''}\n${rules}`;
    })
    .join('\n');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('easing + spring', () => {
  it('maps camelCase easing names to CSS', () => {
    expect(resolveCssEase('easeIn')).toBe('ease-in');
    expect(resolveCssEase('easeOut')).toBe('ease-out');
    expect(resolveCssEase('easeInOut')).toBe('ease-in-out');
    expect(resolveCssEase('ease-in')).toBe('ease-in');
  });

  it('compiles spring to CSS linear() and honors stiffness/damping', () => {
    const soft = springEase({ stiffness: 80, damping: 20 });
    const tight = springEase({ stiffness: 400, damping: 28 });
    expect(soft.startsWith('linear(')).toBe(true);
    expect(tight.startsWith('linear(')).toBe(true);
    expect(soft).not.toBe(tight);
    expect(resolveCssEase('spring', { stiffness: 80, damping: 20 })).toBe(soft);
  });
});

describe('CSS presets', () => {
  it('injects deduped keyframes (SSR-safe getMotionCss)', () => {
    render(<MotionStyles />);
    const css = `${getMotionCss()}\n${injectedCss()}`;
    for (const name of ['fibo-fadeIn', 'fibo-slideUp', 'fibo-scaleIn', 'fibo-blurIn', 'fibo-pop', 'stripes']) {
      expect(css).toContain(name);
    }
    expect(css).toContain('prefers-reduced-motion');
    expect(MOTION_PRESETS).toContain('fadeIn');
    expect(normalizePreset('fade')).toBe('fadeIn');
  });

  it('stamps preset classes and CSS variables without rAF', () => {
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    const { container } = render(
      Box().animate('fadeIn').duration(420).ease('easeIn').id('enter').children('hi')
    );
    const el = container.querySelector('#enter') as HTMLElement;
    expect(el.className).toMatch(/fibo-anim/);
    expect(el.className).toMatch(/fibo-anim-fadeIn/);
    expect(el.getAttribute('data-fibo-anim')).toBe('fadeIn');
    expect(el.style.getPropertyValue('--fibo-dur')).toBe('420ms');
    expect(el.style.getPropertyValue('--fibo-ease')).toBe('ease-in');
    expect(raf).not.toHaveBeenCalled();
  });

  it('pop defaults to a spring linear() curve', () => {
    const { container } = render(Box().animate('pop').id('pop').children('p'));
    const el = container.querySelector('#pop') as HTMLElement;
    expect(el.style.getPropertyValue('--fibo-ease')).toMatch(/^linear\(/);
  });

  it('registers custom from/to keyframes once', () => {
    render(
      Box().children([
        Box()
          .animate({ from: { opacity: 0 }, to: { opacity: 1 } })
          .id('a')
          .children('a'),
        Box()
          .animate({ from: { opacity: 0 }, to: { opacity: 1 } })
          .id('b')
          .children('b'),
      ])
    );
    const a = (document.querySelector('#a') as HTMLElement).className;
    const b = (document.querySelector('#b') as HTMLElement).className;
    const nameA = a.split(/\s+/).find((c) => c.startsWith('fibo-c-'));
    const nameB = b.split(/\s+/).find((c) => c.startsWith('fibo-c-'));
    expect(nameA).toBeTruthy();
    expect(nameA).toBe(nameB);
    expect(injectedCss()).toMatch(/@keyframes fibo-c-/);
  });
});

describe('duration stacking + hover compose', () => {
  it('replaces the transition class instead of stacking durations', () => {
    const { container } = render(
      Box().duration(120).duration(360).id('dur').children('x')
    );
    const el = container.querySelector('#dur') as HTMLElement;
    const transitionClasses = el.className.split(/\s+/).filter((c) => c.includes('transition'));
    expect(transitionClasses.length).toBe(1);
    expect(injectedCss()).toMatch(/360ms/);
  });

  it('composes hover scale + translate into one transform', () => {
    render(
      Box()
        .id('hover')
        .hover((h) => {
          h.scale(1.05).translateY(-4);
        })
        .children('card')
    );
    const css = injectedCss();
    expect(css).toMatch(/scale\(1\.05\).*translateY\(-4px\)|translateY\(-4px\).*scale\(1\.05\)/);
  });
});

describe('stagger / press / focus / scroll helpers', () => {
  it('stamps --fibo-i on staggered children', () => {
    const { container } = render(
      Column()
        .stagger(80)
        .id('list')
        .children([
          Box().animate('fadeIn').id('c0').children('0'),
          Box().animate('fadeIn').id('c1').children('1'),
        ])
    );
    const items = container.querySelectorAll('.fibo-stagger-item');
    expect(items.length).toBe(2);
    expect((items[0] as HTMLElement).style.getPropertyValue('--fibo-i')).toBe('0');
    expect((items[1] as HTMLElement).style.getPropertyValue('--fibo-i')).toBe('1');
    expect((container.querySelector('#list') as HTMLElement).style.getPropertyValue('--fibo-stagger')).toBe(
      '80ms'
    );
  });

  it('adds press, focus-visible, snap, sticky, smooth-scroll, progress classes', () => {
    const { container } = render(
      Box()
        .id('scroll-host')
        .press()
        .focusRing()
        .smoothScroll()
        .scrollSnap('y')
        .scrollSnapAlign('start')
        .sticky(12)
        .scrollProgress()
        .viewTransition('hero')
        .children('body')
    );
    const el = container.querySelector('#scroll-host') as HTMLElement;
    expect(el.className).toMatch(/fibo-snap-y/);
    expect(el.className).toMatch(/fibo-snap-start/);
    expect(el.className).toMatch(/fibo-scroll-progress/);
    expect(el.style.viewTransitionName).toBe('hero');
    expect(injectedCss()).toMatch(/position:\s*sticky/i);
    expect(injectedCss()).toMatch(/scroll-behavior:\s*smooth/i);
  });

  it('onScroll / reveal wraps with IntersectionObserver class', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = observe;
        unobserve = vi.fn();
        disconnect = disconnect;
        constructor(public cb: IntersectionObserverCallback) {}
      }
    );
    const { container } = render(Box().onScroll('fadeIn').id('rev').children('later'));
    const wrap = container.querySelector('[data-fibo-reveal="fadeIn"]') as HTMLElement;
    expect(wrap.className).toMatch(/fibo-reveal/);
    expect(observe).toHaveBeenCalled();
  });
});

function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

describe('Presence + Button.onHover + hooks', () => {
  it('component form keeps children through exit then unmounts', () => {
    const { rerender } = render(
      <Presence show>
        <span>panel</span>
      </Presence>
    );
    expect(screen.getByText('panel')).toBeTruthy();
    rerender(
      <Presence show={false} exit="fadeOut">
        <span>panel</span>
      </Presence>
    );
    const wrap = document.querySelector('[data-fibo-presence="exit"]') as HTMLElement;
    expect(wrap).toBeTruthy();
    expect(wrap.className).toMatch(/fibo-anim-fadeOut/);
    fireEvent.animationEnd(wrap);
    expect(screen.queryByText('panel')).toBeNull();
  });

  it('fluent builder is a React element and plays exit on signal toggle', () => {
    const open = signal(true);
    const tree = Presence(open).enter('fadeIn').exit('fadeOut').duration(200).children('panel');
    expect(isValidElement(tree)).toBe(true);
    render(tree);
    expect(screen.getByText('panel')).toBeTruthy();
    act(() => {
      open.value = false;
    });
    const wrap = document.querySelector('[data-fibo-presence="exit"]') as HTMLElement;
    expect(wrap).toBeTruthy();
    expect(wrap.className).toMatch(/fibo-anim-fadeOut/);
    fireEvent.animationEnd(wrap);
    expect(screen.queryByText('panel')).toBeNull();
  });

  it('fluent builder unmounts immediately when reduced-motion is set', () => {
    stubReducedMotion(true);
    const open = signal(true);
    render(Presence(open).exit('fadeOut').children('panel'));
    expect(screen.getByText('panel')).toBeTruthy();
    act(() => {
      open.value = false;
    });
    expect(screen.queryByText('panel')).toBeNull();
    expect(document.querySelector('[data-fibo-presence="exit"]')).toBeNull();
  });

  it('fluent builder accepts a boolean show', () => {
    render(Presence(true).enter('fadeIn').children('shown'));
    expect(screen.getByText('shown')).toBeTruthy();
  });

  it('fires Button.onHover on mouseenter', () => {
    const onHover = vi.fn();
    render(Button('Hover me').onHover(onHover));
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Hover me' }));
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it('exports typed hooks', () => {
    expect(typeof useSpring).toBe('function');
    expect(typeof useTransition).toBe('function');
    expect(typeof useStagger).toBe('function');
    expect(useStagger(3, 40)).toEqual([0, 40, 80]);
  });

  it('scrollTo queries the anchor', () => {
    render(Box().anchor('sec').children('here'));
    const el = document.getElementById('sec') as HTMLElement;
    const spy = vi.fn();
    el.scrollIntoView = spy;
    scrollTo('#sec');
    expect(spy).toHaveBeenCalled();
  });
});

describe('Signal.spring uses stiffness/damping (rAF path, opt-in)', () => {
  it('cancels the previous rAF when a new spring starts', () => {
    vi.stubGlobal('requestAnimationFrame', () => 7);
    const cancel = vi.fn();
    vi.stubGlobal('cancelAnimationFrame', cancel);
    const s = signal(0);
    s.spring(10, { stiffness: 200, damping: 22 });
    s.spring(20, { stiffness: 90, damping: 18 });
    expect(cancel).toHaveBeenCalledWith(7);
  });
});

describe('legacy .animation() camelCase easing', () => {
  it('writes ease-in-out on the CSS transition', () => {
    const { container } = render(
      Box().animation({ duration: 240, curve: 'easeInOut' }).id('legacy').children('x')
    );
    const el = container.querySelector('#legacy') as HTMLElement;
    expect(el.style.transition).toMatch(/240ms/);
    expect(el.style.transition).toMatch(/ease-in-out/);
  });
});

describe('stripes keyframes live in the static sheet', () => {
  it('defines @keyframes stripes for Progress', () => {
    render(<Reveal preset="fade" />);
    expect(`${getMotionCss()}\n${injectedCss()}`).toMatch(/@keyframes stripes/);
  });
});

