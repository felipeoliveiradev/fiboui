import 'reflect-metadata';
import { signal, Signal as SignalType } from '../core/state';

// Metadata key for signal properties
const SIGNAL_METADATA_KEY = Symbol('signal');

/**
 * @Signal decorator
 * Converts a property into a reactive Signal
 * 
 * @example
 * @Signal(0)
 * count!: Signal<number>;
 */
export function SignalDecorator<T = any>(initialValue?: T): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    // Store metadata about this signal
    const signals = Reflect.getMetadata(SIGNAL_METADATA_KEY, target) || {};
    signals[propertyKey] = { initialValue };
    Reflect.defineMetadata(SIGNAL_METADATA_KEY, signals, target);

    // Define property getter/setter
    const privateKey = Symbol(`_${String(propertyKey)}`);

    Object.defineProperty(target, propertyKey, {
      get(this: any) {
        // Lazy initialization of signal
        if (!this[privateKey]) {
          this[privateKey] = signal(initialValue);
        }
        return this[privateKey];
      },
      set(this: any, value: SignalType<T>) {
        this[privateKey] = value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}

/**
 * Get all signal properties from a class
 */
export function getSignals(target: any): Record<string, any> {
  return Reflect.getMetadata(SIGNAL_METADATA_KEY, target) || {};
}

/**
 * Initialize all signals in a class instance
 */
export function initializeSignals(instance: any): void {
  const signals = getSignals(Object.getPrototypeOf(instance));

  Object.keys(signals).forEach(key => {
    // Access the property to trigger lazy initialization
    void instance[key];
  });
}
