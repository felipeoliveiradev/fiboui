import 'reflect-metadata'
import { afterEach, describe, expect, it } from 'vitest'
import { container, Injectable } from '../src/core/di'
import { Inject } from '../src/decorators/hooks'

afterEach(() => {
  container.clear()
})

describe('W26-09 @Inject class wrapper preserves new.target', () => {
  it('new Decorated() is instanceof the exported class (not a hidden original)', () => {
    @Injectable()
    class Dep {
      n = 1
    }

    @Inject(Dep)
    class Consumer {
      constructor(readonly dep: Dep) {}
      label() {
        return 'consumer'
      }
    }

    const instance = new (Consumer as unknown as new () => { dep: Dep; label: () => string })()
    expect(instance).toBeInstanceOf(Consumer)
    expect(instance.label()).toBe('consumer')
    expect(instance.dep).toBeInstanceOf(Dep)
    expect(instance.dep.n).toBe(1)
    expect(instance.constructor).toBe(Consumer)
  })

  it('subclass of an @Inject class keeps identity, child methods, and injected deps', () => {
    @Injectable()
    class Dep {
      n = 7
    }

    @Inject(Dep)
    class Consumer {
      constructor(readonly dep: Dep) {}
      label() {
        return 'consumer'
      }
    }

    class Child extends (Consumer as unknown as new () => { dep: Dep; label: () => string }) {
      extra() {
        return 'child'
      }
    }

    const child = new Child()
    expect(child).toBeInstanceOf(Child)
    expect(child).toBeInstanceOf(Consumer)
    expect(child.extra()).toBe('child')
    expect(child.label()).toBe('consumer')
    expect(child.dep).toBeInstanceOf(Dep)
    expect(child.dep.n).toBe(7)
    expect(child.constructor).toBe(Child)
  })
})
