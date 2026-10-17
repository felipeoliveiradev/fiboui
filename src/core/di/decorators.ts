import 'reflect-metadata';
import { container } from './Container';
import { Token, Constructor } from './types';

const INJECT_METADATA_KEY = Symbol('inject');
const INJECTABLE_METADATA_KEY = Symbol('injectable');
const INJECTABLE_OPTIONS_KEY = Symbol('injectable:options');

export function Injectable(options?: { singleton?: boolean }): ClassDecorator {
  return function <T extends Function>(target: T): T {
    const singleton = options?.singleton ?? false;
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
    Reflect.defineMetadata(INJECTABLE_OPTIONS_KEY, { singleton }, target);

    container.register(
      target as unknown as Constructor,
      target as unknown as Constructor,
      { singleton }
    );

    return target;
  };
}

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

export function getInjectionTokens(target: Constructor): Token[] {
  let current: object | null = target;
  while (current && current !== Function.prototype && current !== Object.prototype) {
    const own: Token[] | undefined = Reflect.getOwnMetadata(INJECT_METADATA_KEY, current);
    if (own && own.length > 0) return own;
    current = Object.getPrototypeOf(current);
  }
  return [];
}

export function isInjectable(target: Function): boolean {
  return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) === true;
}

export function getInjectableOptions(target: Function): { singleton: boolean } {
  const opts = Reflect.getMetadata(INJECTABLE_OPTIONS_KEY, target) as
    | { singleton?: boolean }
    | undefined;
  return { singleton: opts?.singleton ?? false };
}
