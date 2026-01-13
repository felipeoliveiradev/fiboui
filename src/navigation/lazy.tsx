import { Suspense, ReactNode, ComponentType, lazy } from 'react';

interface LazyRouteOptions {
  loading?: ReactNode;
}

export function lazyRoute<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
  options?: LazyRouteOptions
): ComponentType {
  const LazyComponent = lazy(loader);

  return (props: any) => {
    return (
      <Suspense fallback= { options?.loading || null
  }>
    <LazyComponent { ...props } />
    </Suspense>
    );
};
}

export function preloadRoute(loader: () => Promise<{ default: ComponentType<any> }>): void {
  loader();
}
