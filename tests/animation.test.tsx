import { act, fireEvent, render, screen } from '@testing-library/react';
import { isValidElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Box,
  Button,
  Card,
  Column,
  Header,
  MOTION_PRESETS,
  MotionStyles,
  Presence,
  Reveal,
  Text,
  getMotionCss,
  normalizePreset,
  resolveCssEase,
  scrollTo,
  signal,
  springEase,
  useMountTransition,
  useSpring,
  useStagger,
  useTransition,
} from '../src';
import type { PseudoStateBuilder } from '../src';
import { createRipple } from '../src/core/effects';

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
  vi.unstubAllGlobals();
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
    expect(css).toMatch(
      /scale\(1\.05\).*translate3d\(0,\s*-4px,\s*0\)|translate3d\(0,\s*-4px,\s*0\).*scale\(1\.05\)/,
    );
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

  it('anchor applies scroll-margin-top from the sticky CSS variable', () => {
    render(Box().anchor('sec').children('here'));
    const el = document.getElementById('sec') as HTMLElement;
    expect(el.className).toMatch(/scroll-margin-top/);
    expect(injectedCss()).toMatch(/scroll-margin-top:\s*var\(--fibo-sticky-offset/);
  });

  it('sticky(0) publishes --fibo-sticky-offset and html scroll-padding', () => {
    render(Box().sticky(0).id('bar').children('nav'));
    const css = injectedCss();
    expect(css).toMatch(/--fibo-sticky-offset:\s*64px/);
    expect(css).toMatch(/scroll-padding-top:\s*var\(--fibo-sticky-offset/);
  });

  it('scrollMargin overrides the auto anchor margin', () => {
    render(Box().scrollMargin(80).anchor('x').children('here'));
    expect(injectedCss()).toMatch(/scroll-margin-top:\s*80px/);
  });

  it('Header.sticky publishes the header height as the sticky offset', () => {
    render(Header().sticky().height(72).children('nav'));
    expect(injectedCss()).toMatch(/--fibo-sticky-offset:\s*72px/);
  });
});

describe('Text variant scale', () => {
  it('variant h1 sets the heading tag and theme CSS vars with rem fallbacks', () => {
    render(Text('Hero').variant('h1'));
    const el = screen.getByText('Hero');
    expect(el.tagName).toBe('H1');
    expect(el.className).toMatch(/fibo-text-h1/);
    expect(el.style.fontSize).toBe('var(--fibo-text-h1-size, 2.25rem)');
    expect(el.style.fontWeight).toBe('var(--fibo-text-h1-weight, 700)');
  });

  it('variant caption is smaller than h1 and user style wins', () => {
    render(
      Box().children([
        Text('Hero').variant('h1').id('h'),
        Text('Note').variant('caption').style({ fontSize: '20px' }).id('c'),
      ])
    );
    expect((document.getElementById('h') as HTMLElement).style.fontSize).toBe(
      'var(--fibo-text-h1-size, 2.25rem)',
    );
    const caption = document.getElementById('c') as HTMLElement;
    expect(caption.tagName).toBe('SPAN');
    expect(caption.style.fontSize).toBe('20px');
  });
});

describe('hover callback inference', () => {
  it('types the hover builder inside .map (not implicit any)', () => {
    const cards = ['alpha', 'beta'].map((label) =>
      Card()
        .key(label)
        .hover((h) => {
          const typed: PseudoStateBuilder = h;
          typed.scale(1.04).translateY(-2);
        })
        .children(label)
    );
    expect(cards).toHaveLength(2);
    render(Box().children(cards));
    expect(injectedCss()).toMatch(/scale\(1\.04\)/);
  });
});

describe('Signal.spring uses stiffness/damping (rAF path, opt-in)', () => {
  it('cancels the previous rAF when a new spring starts', () => {
    stubReducedMotion(false);
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

describe('Presence reduced-motion + animationend fallback', () => {
  it('stamps fibo-motion-force when reducedMotion is never', () => {
    stubReducedMotion(true);
    const { container } = render(
      <Presence show reducedMotion="never">
        <span>panel</span>
      </Presence>,
    );
    const wrap = container.querySelector('[data-fibo-presence]') as HTMLElement;
    expect(wrap.className).toMatch(/fibo-motion-force/);
    expect(wrap.className).toMatch(/fibo-anim-fadeIn/);
  });

  it('fluent reducedMotion(never) still plays enter under OS reduce', () => {
    stubReducedMotion(true);
    const { container } = render(
      Presence(true).reducedMotion('never').enter('fadeIn').children('forced'),
    );
    const wrap = container.querySelector('[data-fibo-presence]') as HTMLElement;
    expect(wrap.className).toMatch(/fibo-motion-force/);
    expect(wrap.textContent).toBe('forced');
  });

  it('unmounts on exit even if animationend never fires', () => {
    vi.useFakeTimers();
    try {
      const { rerender, container } = render(
        <Presence show duration={200}>
          <span>panel</span>
        </Presence>,
      );
      rerender(
        <Presence show={false} exit="fadeOut" duration={200}>
          <span>panel</span>
        </Presence>,
      );
      expect(container.textContent).toBe('panel');
      act(() => {
        vi.advanceTimersByTime(260);
      });
      expect(container.textContent).toBe('');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Reveal progressive enhancement', () => {
  it('is visible when scripting is none (no IntersectionObserver)', () => {
    expect(getMotionCss()).toMatch(/@media \(scripting:\s*none\)/);
    expect(getMotionCss()).toMatch(
      /@media \(scripting:\s*none\)[\s\S]*\.fibo-reveal[\s\S]*opacity:\s*1/,
    );
  });
});

describe('rAF / reduced-motion numeric animation', () => {
  it('Signal.animate snaps when requestAnimationFrame is missing (SSR)', () => {
    const raf = window.requestAnimationFrame;
    const caf = window.cancelAnimationFrame;
    // @ts-expect-error SSR has no rAF
    delete window.requestAnimationFrame;
    // @ts-expect-error
    delete window.cancelAnimationFrame;
    const done = vi.fn();
    const s = signal(0);
    s.animate(10, { duration: 400, onComplete: done });
    expect(s.value).toBe(10);
    expect(done).toHaveBeenCalledTimes(1);
    window.requestAnimationFrame = raf;
    window.cancelAnimationFrame = caf;
  });

  it('Signal.spring snaps under prefers-reduced-motion', () => {
    stubReducedMotion(true);
    const raf = vi.fn(() => 1);
    vi.stubGlobal('requestAnimationFrame', raf);
    const s = signal(0);
    s.spring(8, { stiffness: 200, damping: 22 });
    expect(s.value).toBe(8);
    expect(raf).not.toHaveBeenCalled();
  });

  it('useSpring / useTransition snap under reduced-motion', () => {
    stubReducedMotion(true);
    const raf = vi.spyOn(window, 'requestAnimationFrame');
    function Probe() {
      const spring = useSpring(42);
      const trans = useTransition(7, { duration: 400 });
      return (
        <span data-testid="probe">
          {spring}:{trans}
        </span>
      );
    }
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('probe').textContent).toBe('42:7');
    expect(raf).not.toHaveBeenCalled();
  });

  it('useMountTransition skips enter/exit delays under reduced-motion', () => {
    stubReducedMotion(true);
    function Probe({ open }: { open: boolean }) {
      const { shouldRender, stage } = useMountTransition(open, 400);
      return (
        <span data-testid="mount">
          {shouldRender ? 'yes' : 'no'}:{stage}
        </span>
      );
    }
    const { rerender, getByTestId } = render(<Probe open />);
    expect(getByTestId('mount').textContent).toBe('yes:entered');
    rerender(<Probe open={false} />);
    expect(getByTestId('mount').textContent).toBe('no:exited');
  });
});

describe('createRipple', () => {
  it('does not spawn a ripple when reduced-motion is set', () => {
    stubReducedMotion(true);
    const btn = document.createElement('button');
    btn.style.position = 'relative';
    document.body.appendChild(btn);
    createRipple({ clientX: 10, clientY: 10 }, btn);
    expect(btn.querySelectorAll('span').length).toBe(0);
    btn.remove();
  });

  it('removes the circle on animationend and does not throw without document body attach', () => {
    stubReducedMotion(false);
    const btn = document.createElement('button');
    Object.defineProperty(btn, 'clientWidth', { value: 40 });
    Object.defineProperty(btn, 'clientHeight', { value: 40 });
    btn.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 40, height: 40, right: 40, bottom: 40, x: 0, y: 0, toJSON: () => ({}) });
    document.body.appendChild(btn);
    createRipple({ clientX: 20, clientY: 20 }, btn);
    const circle = btn.querySelector('span') as HTMLElement;
    expect(circle).toBeTruthy();
    fireEvent.animationEnd(circle);
    expect(btn.querySelector('span')).toBeNull();
    btn.remove();
  });
});

