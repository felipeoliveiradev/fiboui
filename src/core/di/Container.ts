import { Token, Provider, Constructor, Factory, ServiceMetadata, DIOptions } from './types';

/**
 * Dependency Injection Container
 * Manages service registration and resolution
 */
export class DIContainer {
  private services = new Map<Token, ServiceMetadata>();
  private static instance: DIContainer;

  /**
   * Get singleton instance of the container
   */
  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Register a service with the container
   */
  register<T>(
    token: Token<T>,
    provider: Provider<T>,
    options: DIOptions = {}
  ): void {
    const metadata: ServiceMetadata = {
      token,
      provider,
      singleton: options.singleton ?? false,
    };

    this.services.set(token, metadata);
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(token: Token<T>, provider: Provider<T>): void {
    this.register(token, provider, { singleton: true });
  }

  /**
   * Resolve a service from the container
   */
  resolve<T>(token: Token<T>): T {
    const metadata = this.services.get(token);

    if (!metadata) {
      throw new Error(`Service not found for token: ${String(token)}`);
    }

    // Return cached instance for singletons
    if (metadata.singleton && metadata.instance) {
      return metadata.instance;
    }

    // Create new instance
    const instance = this.createInstance<T>(metadata.provider);

    // Cache singleton instances
    if (metadata.singleton) {
      metadata.instance = instance;
    }

    return instance;
  }

  /**
   * Check if a service is registered
   */
  has(token: Token): boolean {
    return this.services.has(token);
  }

  /**
   * Clear all registered services
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * Create an instance from a provider
   */
  private createInstance<T>(provider: Provider<T>): T {
    // If provider is already an instance
    if (typeof provider !== 'function') {
      return provider as T;
    }

    // If provider is a class constructor
    if (this.isConstructor(provider)) {
      return new (provider as Constructor<T>)();
    }

    // If provider is a factory function
    return (provider as Factory<T>)();
  }

  /**
   * Check if a function is a class constructor
   */
  private isConstructor(fn: Function): boolean {
    try {
      // Try to call it with 'new'
      Reflect.construct(String, [], fn);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Export singleton instance
export const container = DIContainer.getInstance();
