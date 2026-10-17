import { Suspense, ReactNode, ComponentType, lazy, useMemo, useState } from 'react';
import { DefaultErrorPage } from './DefaultErrorPage';
import { DefaultLoader } from './DefaultLoader';
import { RouteErrorBoundary } from './ErrorBoundary';

interface LazyRouteOptions {
  loading?: ReactNode;
}

const preloadCache = new WeakMap<
  () => Promise<{ default: ComponentType<any> }>,
  Promise<{ default: ComponentType<any> }>
>();

function asLoadError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === 'string' && err.trim()) return new Error(err);
  return new Error('Failed to load route');
}

function cachedLoader(
  loader: () => Promise<{ default: ComponentType<any> }>
): Promise<{ default: ComponentType<any> }> {
  let pending = preloadCache.get(loader);
  if (!pending) {
    pending = loader().then(
      (mod) => mod,
      (err) => {
        preloadCache.delete(loader);
        throw asLoadError(err);
      }
    );
    preloadCache.set(loader, pending);
  }
  return pending;
}

export function lazyRoute<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options?: LazyRouteOptions
): ComponentType {
  function LazyRoute(props: Record<string, unknown>) {
    const [retry, setRetry] = useState(0);
    const LazyComponent = useMemo(
      () => lazy(() => cachedLoader(loader)),
      [retry]
    );

    return (
      <RouteErrorBoundary
        key={retry}
        fallback={(error) => (
          <DefaultErrorPage
            error={error}
            onReset={() => {
              preloadCache.delete(loader);
              setRetry((n) => n + 1);
            }}
          />
        )}
      >
        <Suspense fallback={options?.loading ?? <DefaultLoader />}>
          <LazyComponent {...props} />
        </Suspense>
      </RouteErrorBoundary>
    );
  }

  return LazyRoute;
}

export function preloadRoute(loader: () => Promise<{ default: ComponentType<any> }>): void {
  void cachedLoader(loader);
}
