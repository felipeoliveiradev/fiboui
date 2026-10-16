'use client';

import { ReactNode, memo, useCallback, useSyncExternalStore } from 'react';

interface SignalLike<T> {
  value: T;
  subscribe: (listener: (val: T) => void) => () => void;
}

function ValueBinderInner<T>({
  signal,
  builder,
  loading,
  error,
}: {
  signal: SignalLike<T>;
  builder?: (val: T) => ReactNode;
  loading?: () => ReactNode;
  error?: (err: Error | unknown) => ReactNode;
}) {
  const value = useSyncExternalStore(
    useCallback(
      (callback) => {
        if (signal.subscribe) {
          return signal.subscribe(callback);
        }
        return () => {};
      },
      [signal]
    ),
    () => signal.value,
    () => signal.value
  );

  const err = (value as any)?.error;
  if (err && error) {
    return error(err);
  }

  const isLoading = (value as any)?.isLoading || (value as any)?.loading;
  if (isLoading === true && loading) {
    return loading();
  }

  if (builder) {
    return builder(value);
  }

  return null;
}

export const ValueBinder = memo(ValueBinderInner) as typeof ValueBinderInner;
