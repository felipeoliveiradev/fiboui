import { createFiboComponent } from '../core/component';

export interface ComponentOptions {
  memo?: boolean | ((prev: any, next: any) => boolean);
  displayName?: string;
}

/**
 * @Component decorator
 * Replaces createFiboComponent with decorator syntax
 * Works with function components
 */
export function Component(options: ComponentOptions = {}): any {
  return function <T extends Function>(target: T): any {
    // Wrap the function component with createFiboComponent
    const memoOption = typeof options.memo === 'function' ? options.memo : undefined;
    const wrapped = createFiboComponent(target as any, memoOption);

    // Preserve the original name or use custom displayName
    Object.defineProperty(wrapped, 'name', {
      value: options.displayName || target.name,
      writable: false,
    });

    // Preserve other properties
    Object.setPrototypeOf(wrapped, target);

    return wrapped;
  };
}
