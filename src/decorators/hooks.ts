import 'reflect-metadata';
import { container } from '../core/di';
import { Inject as injectParam } from '../core/di/decorators';
import { Token } from '../core/di/types';

export function useInject<T>(token: Token<T>): T {
  return container.resolve(token);
}

function isClassConstructor(fn: Function): boolean {
  if (fn.prototype == null) return false;
  try {
    return /^\s*class\b/.test(Function.prototype.toString.call(fn));
  } catch {
    return fn.prototype.constructor === fn;
  }
}

function copyOwnMetadata(from: object, to: object): void {
  if (typeof Reflect.getOwnMetadataKeys !== 'function') return;
  for (const key of Reflect.getOwnMetadataKeys(from)) {
    Reflect.defineMetadata(key, Reflect.getOwnMetadata(key, from), to);
  }
}

function wrapWithTokens<T>(tokens: Token<T>[], target: Function): Function {
  function wrapped(this: unknown, ...args: unknown[]) {
    const dependencies = tokens.map((token) => container.resolve(token));
    const params = [...dependencies, ...args];
    if (isClassConstructor(target)) {
      // `new.target` keeps instanceof / subclass identity. Omitting it
      // constructs the hidden original class, so `new Child()` is not a Child.
      return Reflect.construct(target, params, new.target || wrapped);
    }
    return target.apply(this, params);
  }
  Object.defineProperty(wrapped, 'name', {
    value: target.name,
    configurable: true,
  });
  Object.setPrototypeOf(wrapped, target);
  copyOwnMetadata(target, wrapped);
  const targetProto = (target as { prototype?: object }).prototype;
  if (Object.prototype.hasOwnProperty.call(wrapped, 'prototype') && wrapped.prototype && targetProto) {
    Object.setPrototypeOf(wrapped.prototype, targetProto);
    copyOwnMetadata(targetProto, wrapped.prototype);
  }
  return wrapped;
}

/**
 * Dual-purpose `Inject`:
 * - Parameter decorator (`constructor(@Inject(Token) x)`) — same metadata as `fiboui/core` DI `Inject`.
 * - Class/function decorator (`@Inject(Token) class C`) — prepends resolved deps (`new` for classes).
 */
export function Inject<T>(...tokens: Token<T>[]): any {
  return function (target: any, propertyKey?: string | symbol, parameterIndex?: number) {
    if (typeof parameterIndex === 'number') {
      const token = tokens[0];
      if (token !== undefined) {
        injectParam(token)(target, propertyKey, parameterIndex);
      }
      return;
    }
    return wrapWithTokens(tokens, target);
  };
}

const LIFECYCLE_HOOKS = Symbol('lifecycleHooks');

interface LifecycleHooks {
  beforeMount?: Function[];
  onMount?: Function[];
  onUpdate?: Function[];
  beforeUnmount?: Function[];
  onUnmount?: Function[];
  onError?: Function[];
}

const HOOK_KINDS: (keyof LifecycleHooks)[] = [
  'beforeMount',
  'onMount',
  'onUpdate',
  'beforeUnmount',
  'onUnmount',
  'onError',
];

function appendHook(target: object, kind: keyof LifecycleHooks, fn: Function): void {
  const own: LifecycleHooks = Reflect.getOwnMetadata(LIFECYCLE_HOOKS, target) || {};
  const list = [...(own[kind] || [])];
  list.push(fn);
  Reflect.defineMetadata(LIFECYCLE_HOOKS, { ...own, [kind]: list }, target);
}

function lifecycleDecorator(kind: keyof LifecycleHooks): MethodDecorator {
  return function (target: object, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    if (typeof descriptor.value === 'function') {
      appendHook(target, kind, descriptor.value);
    }
    return descriptor;
  };
}

export function OnMount(): MethodDecorator {
  return lifecycleDecorator('onMount');
}

export function OnUnmount(): MethodDecorator {
  return lifecycleDecorator('onUnmount');
}

export function BeforeMount(): MethodDecorator {
  return lifecycleDecorator('beforeMount');
}

export function OnUpdate(): MethodDecorator {
  return lifecycleDecorator('onUpdate');
}

export function BeforeUnmount(): MethodDecorator {
  return lifecycleDecorator('beforeUnmount');
}

export function OnError(): MethodDecorator {
  return lifecycleDecorator('onError');
}

export function getLifecycleHooks(target: any): LifecycleHooks {
  if (!target) return {};
  const chain: LifecycleHooks[] = [];
  const seen = new Set<object>();

  const walk = (start: object | null) => {
    let current: object | null = start;
    while (
      current &&
      current !== Object.prototype &&
      current !== Function.prototype &&
      !seen.has(current)
    ) {
      seen.add(current);
      const own: LifecycleHooks | undefined = Reflect.getOwnMetadata(LIFECYCLE_HOOKS, current);
      if (own) chain.unshift(own);
      current = Object.getPrototypeOf(current);
    }
  };

  if (typeof target === 'function') {
    walk(target.prototype);
    let ctor: object | null = target;
    while (ctor && ctor !== Function.prototype && ctor !== Object.prototype) {
      walk(ctor);
      const proto = (ctor as { prototype?: object }).prototype;
      if (proto) walk(proto);
      ctor = Object.getPrototypeOf(ctor);
    }
  } else {
    walk(target);
  }

  const merged: LifecycleHooks = {};
  for (const hooks of chain) {
    for (const kind of HOOK_KINDS) {
      const list = hooks[kind];
      if (!list?.length) continue;
      const acc = merged[kind] || [];
      for (const fn of list) {
        if (!acc.includes(fn)) acc.push(fn);
      }
      merged[kind] = acc;
    }
  }
  if (typeof target !== 'function') {
    for (const kind of HOOK_KINDS) {
      const list = merged[kind];
      if (list?.length) {
        merged[kind] = list.map((fn) => fn.bind(target));
      }
    }
  }
  return merged;
}
