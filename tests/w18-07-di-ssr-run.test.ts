import 'reflect-metadata';
import { afterEach, describe, expect, it } from 'vitest';
import { container, DIContainer, Inject, Injectable } from '../src/core/di';
import { PluginManager } from '../src/core/plugin/PluginManager';

afterEach(() => {
  try {
    container.clear();
  } catch {
    // dispose threw in a test body
  }
  PluginManager.resetForTests();
});

function tick(ms = 15): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('W18-07 DI: overlapping SSR run() isolation', () => {
  it('overlapping DIContainer.run() scopes do not share @Injectable singletons', async () => {
    @Injectable({ singleton: true })
    class Session {
      user = 'anon';
    }

    const seen: string[] = [];

    const a = DIContainer.run(async () => {
      const s = container.resolve(Session);
      s.user = 'alice';
      await tick();
      seen.push(container.resolve(Session).user);
      return container.resolve(Session);
    });

    const b = DIContainer.run(async () => {
      const s = container.resolve(Session);
      s.user = 'bob';
      await tick();
      seen.push(container.resolve(Session).user);
      return container.resolve(Session);
    });

    const [instA, instB] = await Promise.all([a, b]);
    expect(instA).not.toBe(instB);
    expect(instA.user).toBe('alice');
    expect(instB.user).toBe('bob');
    expect(seen.sort()).toEqual(['alice', 'bob']);
  });

  it('overlapping PluginManager.run() requests do not share registerSingleton', async () => {
    const a = PluginManager.run(async () => {
      container.registerSingleton('session', () => ({ user: 'anon' }));
      const s = container.resolve<{ user: string }>('session');
      s.user = 'alice';
      await tick();
      return container.resolve<{ user: string }>('session').user;
    });

    const b = PluginManager.run(async () => {
      container.registerSingleton('session', () => ({ user: 'anon' }));
      const s = container.resolve<{ user: string }>('session');
      s.user = 'bob';
      await tick();
      return container.resolve<{ user: string }>('session').user;
    });

    const [userA, userB] = await Promise.all([a, b]);
    expect(userA).toBe('alice');
    expect(userB).toBe('bob');
    expect(container.has('session')).toBe(false);
  });

  it('run() does not clobber a process singleton already resolved outside the scope', async () => {
    @Injectable({ singleton: true })
    class Clock {
      n = 1;
    }

    const root = container.resolve(Clock);
    root.n = 7;

    await DIContainer.run(async () => {
      const scoped = container.resolve(Clock);
      scoped.n = 99;
      await tick();
      expect(container.resolve(Clock)).toBe(scoped);
      expect(scoped).not.toBe(root);
    });

    expect(container.resolve(Clock)).toBe(root);
    expect(root.n).toBe(7);
  });

  it('run() restores the process container when the callback throws', () => {
    container.registerSingleton('root-svc', () => 'root');
    expect(() =>
      DIContainer.run(() => {
        container.registerSingleton('scoped-svc', () => 'scoped');
        throw new Error('ssr fail');
      }),
    ).toThrow('ssr fail');
    expect(container.has('root-svc')).toBe(true);
    expect(container.resolve('root-svc')).toBe('root');
    expect(container.has('scoped-svc')).toBe(false);
  });

  it('constructor @Inject still resolves inside a run() scope', () => {
    @Injectable()
    class Logger {
      ping() {
        return 'pong';
      }
    }

    @Injectable()
    class Greeter {
      constructor(@Inject(Logger) readonly logger: Logger) {}
    }

    const g = DIContainer.run(() => container.resolve(Greeter));
    expect(g.logger.ping()).toBe('pong');
  });
});
