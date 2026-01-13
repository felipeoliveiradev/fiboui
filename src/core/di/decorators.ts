import 'reflect-metadata';
import { container } from './Container';
import { Token, Constructor } from './types';

const INJECT_METADATA_KEY = Symbol('inject');
const INJECTABLE_METADATA_KEY = Symbol('injectable');

export function Injectable(options?: { singleton?: boolean }): ClassDecorator {
  return function <T extends Function>(target: T): T {

    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);

    container.register(
      target as unknown as Constructor,
      target as unknown as Constructor,
      { singleton: options?.singleton ?? false }
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
  return Reflect.getOwnMetadata(INJECT_METADATA_KEY, target) || [];
}

export function isInjectable(target: Function): boolean {
  return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) === true;
}
