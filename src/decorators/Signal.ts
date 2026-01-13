import 'reflect-metadata';

export const SIGNAL_METADATA_KEY = Symbol('signal');

export function getSignals(target: any): Record<string, any> {
  return Reflect.getMetadata(SIGNAL_METADATA_KEY, target) || {};
}

export function initializeSignals(_instance: any): void {

}
