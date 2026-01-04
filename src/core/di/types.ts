// Dependency Injection Container Types
export type Constructor<T = any> = new (...args: any[]) => T;
export type Factory<T = any> = () => T;
export type Provider<T = any> = Constructor<T> | Factory<T> | T;
export type Token<T = any> = string | symbol | Constructor<T>;

export interface DIOptions {
  singleton?: boolean;
}

export interface ServiceMetadata {
  token: Token;
  provider: Provider;
  singleton: boolean;
  instance?: any;
}
