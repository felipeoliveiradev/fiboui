import React, { ReactElement, ReactNode } from 'react';
import type { FiboChild, FiboChildren } from './types';

export function isBuildable(child: unknown): child is { build: () => ReactElement } {
  return (
    !!child &&
    typeof child === 'object' &&
    'build' in (child as object) &&
    typeof (child as { build?: unknown }).build === 'function'
  );
}

export function buildChild(child: unknown): ReactNode {
  // Prefer assemble() over treating stamped builders as opaque elements.
  // Stamped proxies expose a fluent `.key` function when unset — Flight/RSC
  // rejects that as "Functions cannot be passed to Client Components".
  // Assembling yields host elements (div/p/…) with real string|null keys.
  if (isBuildable(child)) {
    return child.build();
  }
  if (React.isValidElement(child)) {
    return child;
  }
  return child as ReactNode;
}

/**
 * True when React can use `child.key` as a list key.
 * Unset Fibo builders expose a fluent `.key()` function — that must not be
 * stringified into a duplicate key (`"" + fn` is the same for every builder).
 */
export function isUsableReactKey(key: unknown): key is string | number {
  return typeof key === 'string' || typeof key === 'number';
}

export function reactListKey(child: ReactNode, index: number): string | number {
  if (React.isValidElement(child) && isUsableReactKey(child.key) && child.key !== '') {
    return child.key;
  }
  return `.$fibo-${index}`;
}

/** Clone with a string/number key so list wrappers never inherit a fluent `.key` function. */
export function withListKey(child: ReactNode, index: number): ReactNode {
  if (!React.isValidElement(child)) {
    return child;
  }
  if (isUsableReactKey(child.key) && child.key !== '') {
    return child;
  }
  return React.cloneElement(child, { key: reactListKey(child, index) });
}

export function normalizeFiboChildren(children: FiboChildren | undefined | null): ReactNode[] {
  if (children === undefined || children === null) {
    return [];
  }
  const raw = typeof children === 'function'
    ? (children as () => FiboChild | FiboChild[])()
    : children;
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((item, index) => withListKey(buildChild(item), index));
}
