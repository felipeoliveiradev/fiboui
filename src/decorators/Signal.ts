import 'reflect-metadata';
import { signal, Signal as SignalType } from '../core/state';

export const SIGNAL_METADATA_KEY = Symbol('signal');

type SignalMeta = { initialValue?: unknown };

function isBindableSignal(value: unknown): value is SignalType<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as SignalType<unknown>).subscribe === 'function' &&
    'value' in (value as object)
  );
}

function walkSignalMeta(
  start: object | null,
  seen: Set<object>,
  layers: Record<string, SignalMeta>[],
): void {
  let current: object | null = start;
  while (
    current &&
    current !== Object.prototype &&
    current !== Function.prototype &&
    !seen.has(current)
  ) {
    seen.add(current);
    const own = Reflect.getOwnMetadata(SIGNAL_METADATA_KEY, current) as Record<string, SignalMeta> | undefined;
    if (own) layers.unshift(own);
    current = Object.getPrototypeOf(current);
  }
}

/**
 * `@Signal(initial)` — property decorator that stores a live `signal(initial)` on the instance.
 *
 * Prefer `declare count: Signal<number>` so `useDefineForClassFields` does not shadow the accessor.
 * For own class fields, call `initializeSignals(this)` in the constructor.
 */
export function Signal<T = unknown>(initialValue?: T): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const key = String(propertyKey);
    const own: Record<string, SignalMeta> = {
      ...(Reflect.getOwnMetadata(SIGNAL_METADATA_KEY, target) || {}),
    };
    own[key] = { initialValue };
    Reflect.defineMetadata(SIGNAL_METADATA_KEY, own, target);

    const slot = Symbol(`fibo.signal.${key}`);

    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      get(this: Record<PropertyKey, unknown>) {
        if (!Object.prototype.hasOwnProperty.call(this, slot)) {
          Object.defineProperty(this, slot, {
            configurable: true,
            writable: true,
            value: signal(initialValue as T),
          });
        }
        return this[slot];
      },
      set(this: Record<PropertyKey, unknown>, value: unknown) {
        Object.defineProperty(this, slot, {
          configurable: true,
          writable: true,
          value,
        });
      },
    });
  };
}

export function getSignals(target: any): Record<string, SignalMeta> {
  if (!target) return {};
  const layers: Record<string, SignalMeta>[] = [];
  const seen = new Set<object>();
  if (typeof target === 'function') {
    walkSignalMeta(target.prototype, seen, layers);
    walkSignalMeta(target, seen, layers);
  } else {
    walkSignalMeta(target, seen, layers);
  }
  return Object.assign({}, ...layers);
}

export function initializeSignals(instance: any): void {
  if (!instance || (typeof instance !== 'object' && typeof instance !== 'function')) return;
  const meta = getSignals(instance);
  for (const [key, info] of Object.entries(meta)) {
    const current = instance[key];
    if (isBindableSignal(current)) continue;
    const initial = info && 'initialValue' in info ? info.initialValue : current;
    Object.defineProperty(instance, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: signal(initial),
    });
  }
}
