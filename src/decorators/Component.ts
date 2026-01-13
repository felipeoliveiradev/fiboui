import { createFiboComponent } from '../core/component';

export interface ComponentOptions {
  memo?: boolean | ((prev: any, next: any) => boolean);
  displayName?: string;
}

export function Component(options: ComponentOptions = {}): any {
  return function <T extends Function>(target: T): any {

    const memoOption = typeof options.memo === 'function' ? options.memo : undefined;
    const wrapped = createFiboComponent(target as any, memoOption);

    Object.defineProperty(wrapped, 'name', {
      value: options.displayName || target.name,
      writable: false,
    });

    Object.setPrototypeOf(wrapped, target);

    return wrapped;
  };
}
