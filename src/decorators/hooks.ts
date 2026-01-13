import 'reflect-metadata';
import { container } from '../core/di';
import { Token } from '../core/di/types';

export function useInject<T>(token: Token<T>): T {
  return container.resolve(token);
}

export function Inject<T>(...tokens: Token<T>[]): any {
  return function (target: Function): any {
    return function (...args: any[]) {

      const dependencies = tokens.map(token => container.resolve(token));

      return target(...dependencies, ...args);
    };
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

export function OnMount(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.onMount = hooks.onMount || [];
    hooks.onMount.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

export function OnUnmount(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.onUnmount = hooks.onUnmount || [];
    hooks.onUnmount.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

export function BeforeMount(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.beforeMount = hooks.beforeMount || [];
    hooks.beforeMount.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

export function OnUpdate(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.onUpdate = hooks.onUpdate || [];
    hooks.onUpdate.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

export function BeforeUnmount(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.beforeUnmount = hooks.beforeUnmount || [];
    hooks.beforeUnmount.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

export function OnError(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.onError = hooks.onError || [];
    hooks.onError.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

export function getLifecycleHooks(target: any): LifecycleHooks {
  return Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
}
