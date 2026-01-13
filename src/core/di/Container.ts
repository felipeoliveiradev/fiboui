import { Token, Provider, Constructor, Factory, ServiceMetadata, DIOptions } from './types';

export class DIContainer {
  private services = new Map<Token, ServiceMetadata>();
  private static instance: DIContainer;

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  register<T>(
    token: Token<T>,
    provider: Provider<T>,
    options: DIOptions = {}
  ): void {

    if (this.services.has(token)) {

      if (!options.override) {
        return;
      }
    }

    const metadata: ServiceMetadata = {
      token,
      provider,
      singleton: options.singleton ?? false,
    };

    this.services.set(token, metadata);
  }

  registerSingleton<T>(token: Token<T>, provider: Provider<T>): void {
    this.register(token, provider, { singleton: true });
  }

  resolve<T>(token: Token<T>): T {
    const metadata = this.services.get(token);

    if (!metadata) {
      throw new Error(`Service not found for token: ${String(token)}`);
    }

    if (metadata.singleton && metadata.instance) {
      return metadata.instance;
    }

    const instance = this.createInstance<T>(metadata.provider);

    if (metadata.singleton) {
      metadata.instance = instance;
    }

    return instance;
  }

  has(token: Token): boolean {
    return this.services.has(token);
  }

  clear(): void {
    this.services.clear();
  }

  private createInstance<T>(provider: Provider<T>): T {

    if (typeof provider !== 'function') {
      return provider as T;
    }

    if (this.isConstructor(provider)) {
      return new (provider as Constructor<T>)();
    }

    return (provider as Factory<T>)();
  }

  private isConstructor(fn: Function): boolean {
    try {

      Reflect.construct(String, [], fn);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const container = DIContainer.getInstance();
