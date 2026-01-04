import 'reflect-metadata';
import { container } from './Container';
import { Token, Constructor } from './types';

// Metadata keys
const INJECT_METADATA_KEY = Symbol('inject');
const INJECTABLE_METADATA_KEY = Symbol('injectable');

/**
 * @Injectable decorator
 * Marks a class as injectable and registers it with the DI container
 */
export function Injectable(options?: { singleton?: boolean }): ClassDecorator {
  return function <T extends Function>(target: T): T {
    // Mark as injectable
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);

    // Auto-register with container
    container.register(
      target as unknown as Constructor,
      target as unknown as Constructor,
      { singleton: options?.singleton ?? false }
    );

    return target;
  };
}

/**
 * @Inject decorator for constructor parameters
 * Injects a dependency into a constructor parameter
 */
export function Inject<T>(token: Token<T>): ParameterDecorator {
  return function (
    target: Object,
    _propertyKey: string | symbol | undefined,
    parameterIndex: number
  ): void {
    const existingInjections: Token[] =
      Reflect.getOwnMetadata(INJECT_METADATA_KEY, target) || [];

    existingInjections[parameterIndex] = token;

    Reflect.defineMetadata(INJECT_METADATA_KEY, existingInjections, target);
  };
}

/**
 * Get injection tokens for a constructor
 */
export function getInjectionTokens(target: Constructor): Token[] {
  return Reflect.getOwnMetadata(INJECT_METADATA_KEY, target) || [];
}

/**
 * Check if a class is injectable
 */
export function isInjectable(target: Function): boolean {
  return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) === true;
}
