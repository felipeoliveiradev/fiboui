import 'reflect-metadata';
import { container } from '../core/di';
import { Token } from '../core/di/types';

/**
 * useInject hook
 * Resolve a dependency from the DI container
 */
export function useInject<T>(token: Token<T>): T {
  return container.resolve(token);
}

/**
 * @Inject decorator for function components
 * Injects dependencies as function parameters
 */
export function Inject<T>(...tokens: Token<T>[]): any {
  return function (target: Function): any {
    return function (...args: any[]) {
      // Resolve all tokens
      const dependencies = tokens.map(token => container.resolve(token));

      // Call original function with resolved dependencies
      return target(...dependencies, ...args);
    };
  };
}

/**
 * Lifecycle decorators for function components
 */

// Metadata key for lifecycle hooks
const LIFECYCLE_HOOKS = Symbol('lifecycleHooks');

interface LifecycleHooks {
  onMount?: Function[];
  onUnmount?: Function[];
}

/**
 * @OnMount decorator
 * Runs a method when component mounts
 */
export function OnMount(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.onMount = hooks.onMount || [];
    hooks.onMount.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

/**
 * @OnUnmount decorator
 * Runs a method when component unmounts
 */
export function OnUnmount(): MethodDecorator {
  return function (target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const hooks: LifecycleHooks = Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
    hooks.onUnmount = hooks.onUnmount || [];
    hooks.onUnmount.push(descriptor.value);
    Reflect.defineMetadata(LIFECYCLE_HOOKS, hooks, target);
    return descriptor;
  };
}

/**
 * Get lifecycle hooks for a component
 */
export function getLifecycleHooks(target: any): LifecycleHooks {
  return Reflect.getMetadata(LIFECYCLE_HOOKS, target) || {};
}
