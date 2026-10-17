import 'reflect-metadata';
import { createFiboComponent } from '../core/component';

export interface ComponentOptions {
  memo?: boolean | ((prev: any, next: any) => boolean);
  displayName?: string;
}

function copyOwnMetadata(from: object, to: object): void {
  if (typeof Reflect.getOwnMetadataKeys !== 'function') return;
  for (const key of Reflect.getOwnMetadataKeys(from)) {
    Reflect.defineMetadata(key, Reflect.getOwnMetadata(key, from), to);
  }
}

export function Component(options: ComponentOptions = {}): any {
  return function <T extends Function>(target: T): any {
    const memoOption =
      options.memo === false
        ? false
        : typeof options.memo === 'function'
          ? options.memo
          : undefined;
    const wrapped = createFiboComponent(target as any, memoOption);
    const name = options.displayName || target.name;

    Object.defineProperty(wrapped, 'name', {
      value: name,
      writable: false,
      configurable: true,
    });
    (wrapped as { displayName?: string }).displayName = name;

    Object.setPrototypeOf(wrapped, target);
    copyOwnMetadata(target, wrapped);
    const targetProto = (target as { prototype?: object }).prototype;
    if (Object.prototype.hasOwnProperty.call(wrapped, 'prototype') && wrapped.prototype && targetProto) {
      Object.setPrototypeOf(wrapped.prototype, targetProto);
      copyOwnMetadata(targetProto, wrapped.prototype);
    }

    return wrapped;
  };
}
