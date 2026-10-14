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
  if (React.isValidElement(child)) {
    return child;
  }
  if (isBuildable(child)) {
    return child.build();
  }
  return child as ReactNode;
}

export function normalizeFiboChildren(children: FiboChildren | undefined | null): ReactNode[] {
  if (children === undefined || children === null) {
    return [];
  }
  const raw = typeof children === 'function'
    ? (children as () => FiboChild | FiboChild[])()
    : children;
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(buildChild);
}
