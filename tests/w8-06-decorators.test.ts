import 'reflect-metadata'
import { createElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { container, getInjectionTokens, Injectable, Inject } from '../src/core/di'
import { Signal as CoreSignal } from '../src/core/state'
import { Component } from '../src/decorators/Component'
import {
  Signal,
  getSignals,
  initializeSignals,
} from '../src/decorators/Signal'
import {
  Page,
  getRegisteredRoutes,
  clearRoutes,
  registerRoute,
} from '../src/decorators/Page'
import { OnMount, OnUnmount, getLifecycleHooks, Inject as DecoratorInject } from '../src/decorators/hooks'

afterEach(() => {
  cleanup()
  clearRoutes()
  container.clear()
})

describe('W8-06 @Signal wiring', () => {
  it('turns a decorated field into a live Signal (declare / no own initializer)', () => {
    class Counter {
      @Signal(2)
      declare count: CoreSignal<number>
    }

    const c = new Counter()
    expect(c.count).toBeInstanceOf(CoreSignal)
    expect(c.count.value).toBe(2)
    const seen: number[] = []
    c.count.subscribe((n) => seen.push(n))
    c.count.value = 5
    expect(seen).toEqual([5])
    expect(getSignals(Counter).count).toEqual({ initialValue: 2 })
    expect(getSignals(c).count).toEqual({ initialValue: 2 })
  })

  it('initializeSignals rewires class-field own properties that shadow the prototype accessor', () => {
    class Counter {
      @Signal(0)
      count: CoreSignal<number> | undefined
    }

    const c = new Counter()
    initializeSignals(c)
    expect(c.count).toBeInstanceOf(CoreSignal)
    expect(c.count!.value).toBe(0)
    c.count!.value = 9
    expect(c.count!.value).toBe(9)
  })

  it('getSignals merges parent + child metadata', () => {
    class Parent {
      @Signal(1)
      declare parentN: CoreSignal<number>
    }
    class Child extends Parent {
      @Signal('x')
      declare childS: CoreSignal<string>
    }

    const meta = getSignals(Child)
    expect(meta.parentN).toEqual({ initialValue: 1 })
    expect(meta.childS).toEqual({ initialValue: 'x' })
    const child = new Child()
    initializeSignals(child)
    expect(child.parentN.value).toBe(1)
    expect(child.childS.value).toBe('x')
  })
})

describe('W8-06 lifecycle this + wrapper metadata', () => {
  it('getLifecycleHooks(instance) invokes with the instance as this', () => {
    class Widget {
      label = 'mounted'
      @OnMount()
      mounted() {
        return this.label
      }
      @OnUnmount()
      gone() {
        return this.label
      }
    }

    const w = new Widget()
    const hooks = getLifecycleHooks(w)
    expect(hooks.onMount).toHaveLength(1)
    expect(hooks.onMount![0]()).toBe('mounted')
    expect(hooks.onUnmount![0]()).toBe('mounted')
  })

  it('@Component wrapper still exposes OnMount metadata (prototype not dropped)', () => {
    @Component({ displayName: 'DecoratedWidget' })
    class Widget {
      @OnMount()
      mounted() {}
    }

    expect(getLifecycleHooks(Widget).onMount?.length).toBe(1)
    expect((Widget as { displayName?: string }).displayName).toBe('DecoratedWidget')
  })

  it('@Component wrapper keeps constructor @Inject tokens as own metadata', () => {
    @Injectable()
    class Logger {
      ping() {
        return 'pong'
      }
    }

    class Greeter {
      constructor(@Inject(Logger) readonly logger: Logger) {}
    }

    const Wrapped = Component({ displayName: 'Greeter' })(Greeter)
    expect(getInjectionTokens(Wrapped as typeof Greeter).length).toBeGreaterThan(0)
  })

  it('@Inject class wrapper still finds OnMount on the original prototype', () => {
    @Injectable()
    class Dep {
      n = 1
    }

    @DecoratorInject(Dep)
    class Consumer {
      constructor(readonly dep: Dep) {}
      @OnMount()
      mounted() {
        return this.dep.n
      }
    }

    expect(getLifecycleHooks(Consumer).onMount?.length).toBe(1)
    const instance = new (Consumer as unknown as new () => { dep: Dep; mounted: () => number })()
    expect(instance.dep.n).toBe(1)
    expect(getLifecycleHooks(instance).onMount![0]()).toBe(1)
  })
})

describe('W8-06 @Page registry', () => {
  it('registers a function component that renders', () => {
    function Home() {
      return createElement('div', { 'data-testid': 'w8-06-home' }, 'Home')
    }
    const Registered = Page('/w8-06')(Home)

    const routes = getRegisteredRoutes()
    expect(routes).toHaveLength(1)
    expect(routes[0].path).toBe('/w8-06')
    expect(routes[0].component).toBe(Registered)

    render(createElement(Registered))
    expect(screen.getByTestId('w8-06-home').textContent).toBe('Home')
  })

  it('Page() around @Component still stores a renderable wrapper', () => {
    function MemoHome() {
      return createElement('div', { 'data-testid': 'w8-06-memo' }, 'Memo')
    }
    const Registered = Page('/w8-06-memo')(Component()(MemoHome))

    expect(Registered).toBeTypeOf('function')
    render(createElement(getRegisteredRoutes()[0].component))
    expect(screen.getByTestId('w8-06-memo').textContent).toBe('Memo')
  })

  it('throws instead of registering a non-function or empty path (Router would crash later)', () => {
    expect(() => Page('')(function Empty() { return null })).toThrow(/path/)
    expect(() => Page('/ok')({} as unknown as Function)).toThrow(/component/)
    expect(() => registerRoute('/ok', null as never)).toThrow(/component/)
  })
})
