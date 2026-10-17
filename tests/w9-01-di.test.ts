import 'reflect-metadata';
import { afterEach, describe, expect, it } from 'vitest';
import {
  container,
  getInjectionTokens,
  Inject,
  Injectable,
} from '../src/core/di';

afterEach(() => {
  container.clear();
});

describe('W9-01 DI: inherited @Inject + native paramtypes', () => {
  it('subclass without constructor still receives parent @Inject tokens', () => {
    @Injectable()
    class Logger {
      ping() {
        return 'pong';
      }
    }

    @Injectable()
    class Service {
      constructor(@Inject(Logger) readonly logger: Logger) {}
    }

    @Injectable()
    class SpecialService extends Service {}

    expect(getInjectionTokens(SpecialService).length).toBeGreaterThan(0);
    const special = container.resolve(SpecialService);
    expect(special).toBeInstanceOf(SpecialService);
    expect(special.logger).toBeInstanceOf(Logger);
    expect(special.logger.ping()).toBe('pong');
  });

  it('does not resolve String/Number/Object for optional extra constructor params', () => {
    @Injectable()
    class Logger {
      ping() {
        return 'pong';
      }
    }

    @Injectable()
    class Greeter {
      constructor(
        @Inject(Logger) readonly logger: Logger,
        readonly label: string = 'hi',
      ) {}
    }

    // tsc emitDecoratorMetadata (esbuild/vite tests do not emit this).
    Reflect.defineMetadata('design:paramtypes', [Logger, String], Greeter);

    const g = container.resolve(Greeter);
    expect(g.logger.ping()).toBe('pong');
    expect(g.label).toBe('hi');
  });

  it('transient @Injectable is a new instance each resolve; singleton is cached', () => {
    @Injectable()
    class Transient {
      readonly id = Math.random();
    }
    @Injectable({ singleton: true })
    class Single {
      readonly id = Math.random();
    }
    expect(container.resolve(Transient)).not.toBe(container.resolve(Transient));
    expect(container.resolve(Single)).toBe(container.resolve(Single));
  });

  it('throws on missing token and on circular constructor injection', () => {
    @Injectable()
    class Needs {
      constructor(@Inject('missing-token') readonly x: unknown) {}
    }
    expect(() => container.resolve(Needs)).toThrow(/not found/i);

    class A {
      constructor(@Inject('B') readonly b: unknown) {}
    }
    class B {
      constructor(@Inject('A') readonly a: unknown) {}
    }
    container.register('A', A);
    container.register('B', B);
    expect(() => container.resolve('A')).toThrow(/circular/i);
  });
});
