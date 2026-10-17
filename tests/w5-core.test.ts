import 'reflect-metadata'
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { isBreakpointKey, toMediaQuery, FIBO_BREAKPOINTS } from '../src/core/breakpoints'
import {
  applyResponsiveStyles,
  createFiboComponent,
  processChildren,
} from '../src/core/component'
import {
  isUsableReactKey,
  normalizeFiboChildren,
  withListKey,
} from '../src/core/children'
import { springEase, resolveCssEase } from '../src/core/easing'
import { useSignal } from '../src/core/hooks'
import { nextStableId, resetStableIds } from '../src/core/ids'
import { signal } from '../src/core/state'
import { Box } from '../src/structure/Box'
import { container, getInjectionTokens, Injectable } from '../src/core/di'
import { Component } from '../src/decorators/Component'
import {
  Inject as DecoratorInject,
  OnMount,
  getLifecycleHooks,
} from '../src/decorators/hooks'
import type {
  ChildrenProps,
  CrossAxisAlignment,
  FiboChildren,
  FiboComponent,
  MainAxisAlignment,
} from '../src/core/types'

afterEach(() => {
  cleanup()
  container.clear()
  vi.unstubAllGlobals()
})

describe('breakpoints: prototype keys are not media queries', () => {
  it('isBreakpointKey rejects Object.prototype names', () => {
    expect(isBreakpointKey('sm')).toBe(true)
    expect(isBreakpointKey('md')).toBe(true)
    expect(isBreakpointKey('toString')).toBe(false)
    expect(isBreakpointKey('constructor')).toBe(false)
    expect(isBreakpointKey('valueOf')).toBe(false)
    expect(isBreakpointKey('hasOwnProperty')).toBe(false)
  })

  it('toMediaQuery(toString) does not stringify Function source as px', () => {
    const q = toMediaQuery('toString')
    expect(q).not.toMatch(/function/i)
    expect(q).not.toMatch(/native code/)
    expect(q).not.toMatch(/NaN/)
  })
})

describe('applyResponsiveStyles SSR / shared breakpoints', () => {
  const responsive = {
    mobile: { color: 'red' },
    tablet: { color: 'green' },
    desktop: { color: 'blue' },
  }

  it('does not read window.innerWidth', () => {
    const spy = vi.spyOn(window, 'innerWidth', 'get')
    applyResponsiveStyles({ color: 'black' }, responsive)
    applyResponsiveStyles({ color: 'black' }, responsive, undefined)
    expect(spy).not.toHaveBeenCalled()
  })

  it('keeps base style when width is omitted (SSR)', () => {
    expect(applyResponsiveStyles({ color: 'black' }, responsive).color).toBe('black')
  })

  it('uses FIBO_BREAKPOINTS.md / lg, not magic numbers', () => {
    expect(applyResponsiveStyles({ color: 'black' }, responsive, FIBO_BREAKPOINTS.md - 1).color).toBe(
      'red',
    )
    expect(applyResponsiveStyles({ color: 'black' }, responsive, FIBO_BREAKPOINTS.md).color).toBe(
      'green',
    )
    expect(applyResponsiveStyles({ color: 'black' }, responsive, FIBO_BREAKPOINTS.lg - 1).color).toBe(
      'green',
    )
    expect(applyResponsiveStyles({ color: 'black' }, responsive, FIBO_BREAKPOINTS.lg).color).toBe(
      'blue',
    )
  })
})

describe('children: flatten + keys + spread-safe array', () => {
  it('returns a real dense Array that is safe to spread into createElement', () => {
    const el = createElement('span', null, 'x')
    expect(() => createElement('div', null, ...(el as unknown as ReactNode[]))).toThrow()
    expect(() => createElement('div', null, ...normalizeFiboChildren(el))).not.toThrow()
    expect(() => createElement('div', null, ...normalizeFiboChildren(undefined))).not.toThrow()
    expect(() => createElement('div', null, ...normalizeFiboChildren(null))).not.toThrow()
    expect(() => createElement('div', null, ...processChildren(undefined))).not.toThrow()
  })

  it('flattens nested arrays and stamps usable keys on every host element', () => {
    const a = createElement('span', null, 'a')
    const b = createElement('span', null, 'b')
    const c = createElement('span', { key: 'keep' }, 'c')
    const nodes = normalizeFiboChildren([a, [b, c], null, false, true])
    expect(nodes).toHaveLength(3)
    expect(nodes.every((n) => !Array.isArray(n))).toBe(true)
    const keys = nodes.map((n) => (isValidElement(n) ? n.key : null))
    expect(keys[0]).toBeTruthy()
    expect(keys[1]).toBeTruthy()
    expect(String(keys[2])).toContain('keep')
    expect(new Set(keys.map(String)).size).toBe(3)
  })

  it('does not spread a string into characters', () => {
    const nodes = normalizeFiboChildren('hi')
    expect(nodes).toEqual(['hi'])
  })

  it('invokes lazy factories and flattens their nested result', () => {
    const nodes = normalizeFiboChildren(() => [
      createElement('span', null, 'one'),
      [createElement('span', null, 'two')],
    ])
    expect(nodes).toHaveLength(2)
    expect(nodes.every((n) => isValidElement(n))).toBe(true)
  })

  it('withListKey never copies a fluent function .key onto the cloned element', () => {
    const el = Box().children('k') as ReactElement
    expect(typeof el.key === 'function' || el.key == null || el.key === '').toBe(true)
    const keyed = withListKey(el, 3)
    expect(isValidElement(keyed)).toBe(true)
    expect(typeof (keyed as ReactElement).key).not.toBe('function')
    expect(isUsableReactKey((keyed as ReactElement).key) || (keyed as ReactElement).key == null).toBe(true)
  })
})

describe('easing: invalid spring options must not emit NaN/Infinity', () => {
  it('mass 0 / negative / NaN still returns a finite linear() curve', () => {
    for (const spring of [{ mass: 0 }, { mass: -2 }, { mass: Number.NaN }, { stiffness: 0 }, { stiffness: Number.NaN }]) {
      const css = springEase(spring)
      expect(css.startsWith('linear(')).toBe(true)
      expect(css).not.toMatch(/NaN/i)
      expect(css).not.toMatch(/Infinity/)
    }
  })

  it('resolveCssEase(spring) with mass 0 is finite', () => {
    const css = resolveCssEase('spring', { mass: 0 })
    expect(css).not.toMatch(/NaN/i)
    expect(css).not.toMatch(/Infinity/)
  })
})

describe('hooks SSR', () => {
  it('useSignal renderToString does not throw or read window', () => {
    const count = signal(4)
    function Probe() {
      const v = useSignal(count)
      return createElement('span', null, String(v))
    }
    const spy = vi.spyOn(window, 'innerWidth', 'get')
    expect(renderToString(createElement(Probe))).toContain('4')
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('ids', () => {
  it('nextStableId is sequential and resettable (not for React keys)', () => {
    resetStableIds()
    expect(nextStableId('g')).toBe('g-1')
    expect(nextStableId('g')).toBe('g-2')
    resetStableIds()
    expect(nextStableId('g')).toBe('g-1')
  })
})

describe('createFiboComponent / @Component memo:false', () => {
  it('memo:false re-renders when parent re-renders with the same props', () => {
    let renders = 0
    function Raw(_props: { n: number }) {
      renders += 1
      return createElement('span', { 'data-testid': 'n' }, 'x')
    }
    const Open = Component({ memo: false })(Raw)
    function Host({ n }: { n: number }) {
      return createElement(Open, { n })
    }
    const { rerender } = render(createElement(Host, { n: 1 }))
    const first = renders
    rerender(createElement(Host, { n: 1 }))
    expect(renders).toBeGreaterThan(first)
  })

  it('default memo skips re-render when props are referentially equal', () => {
    let renders = 0
    function Raw(_props: { n: number }) {
      renders += 1
      return createElement('span', null, 'x')
    }
    const Closed = createFiboComponent(Raw)
    function Host({ n }: { n: number }) {
      return createElement(Closed, { n })
    }
    const { rerender } = render(createElement(Host, { n: 1 }))
    const first = renders
    rerender(createElement(Host, { n: 1 }))
    expect(renders).toBe(first)
  })
})

describe('decorator Inject vs di Inject', () => {
  it('decorator Inject used as a parameter decorator records the same tokens as di Inject', () => {
    @Injectable()
    class Logger {
      ping() {
        return 'pong'
      }
    }

    @Injectable()
    class Greeter {
      constructor(@DecoratorInject(Logger) readonly logger: Logger) {}
    }

    expect(getInjectionTokens(Greeter).length).toBeGreaterThan(0)
    const greeter = container.resolve(Greeter)
    expect(greeter.logger).toBeInstanceOf(Logger)
    expect(greeter.logger.ping()).toBe('pong')
  })

  it('decorator Inject as a class decorator constructs with `new` (does not call the class as a function)', () => {
    @Injectable()
    class Dep {
      n = 7
    }

    @DecoratorInject(Dep)
    class Consumer {
      constructor(
        readonly dep: Dep,
        readonly extra: number,
      ) {}
    }

    const instance = new (Consumer as unknown as new (extra: number) => { dep: Dep; extra: number })(3)
    expect(instance).toBeInstanceOf(Object)
    expect(instance.dep).toBeInstanceOf(Dep)
    expect(instance.dep.n).toBe(7)
    expect(instance.extra).toBe(3)
  })
})

describe('lifecycle hooks metadata', () => {
  it('getLifecycleHooks(Class) finds methods stored on the prototype', () => {
    class Widget {
      @OnMount()
      mounted() {}
    }
    expect(getLifecycleHooks(Widget).onMount?.length).toBe(1)
    expect(getLifecycleHooks(new Widget()).onMount?.length).toBe(1)
  })

  it('subclass OnMount does not mutate the parent hook list', () => {
    class Parent {
      @OnMount()
      parentMount() {}
    }
    class Child extends Parent {
      @OnMount()
      childMount() {}
    }
    expect(getLifecycleHooks(Parent).onMount?.length).toBe(1)
    expect(getLifecycleHooks(Child).onMount?.length).toBe(2)
  })
})

describe('types', () => {
  it('ChildrenProps.children accepts FiboChildren factories', () => {
    expectTypeOf<ChildrenProps['children']>().toMatchTypeOf<FiboChildren | undefined>()
    const props: ChildrenProps = { children: () => 'ok' }
    expect(typeof props.children).toBe('function')
  })

  it('MainAxisAlignment keeps the Flutter-style tokens Row/Column map over', () => {
    const a: MainAxisAlignment = 'spaceBetween'
    const b: CrossAxisAlignment = 'stretch'
    expect(a).toBe('spaceBetween')
    expect(b).toBe('stretch')
  })

  it('FiboComponent may return null', () => {
    const Empty: FiboComponent = () => null
    expect(Empty()).toBeNull()
  })
})
