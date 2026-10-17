import React, { ReactNode } from 'react';
import type { FiboChild, FiboChildren } from './types';
import type { BindableSignal } from './state';
import { ValueBinder } from './ValueBinder';

export function isBuildable(child: unknown): child is { build: () => ReactNode } {
  return (
    !!child &&
    typeof child === 'object' &&
    'build' in (child as object) &&
    typeof (child as { build?: unknown }).build === 'function'
  );
}

function isBindableSignal(value: unknown): value is BindableSignal<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'value' in (value as object) &&
    typeof (value as BindableSignal<unknown>).subscribe === 'function'
  );
}

function bindSignalChild(val: unknown): ReactNode {
  return buildChild(val);
}

export function buildChild(child: unknown): ReactNode {
  // Prefer assemble() over treating stamped builders as opaque elements.
  // Stamped proxies expose a fluent `.key` function when unset — Flight/RSC
  // rejects that as "Functions cannot be passed to Client Components".
  // Assembling yields host elements (div/p/…) with real string|null keys.
  if (child == null || typeof child === 'boolean') {
    return null;
  }
  if (isBuildable(child)) {
    return child.build();
  }
  if (isBindableSignal(child)) {
    return React.createElement(ValueBinder, {
      signal: child,
      builder: bindSignalChild,
    });
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

const MAX_BUILD_DEPTH = 32;

/** Flatten arrays / Buildable.build() ReactNode so the result is spread-safe leaves. */
function pushNormalized(value: unknown, out: ReactNode[], depth = 0): void {
  if (depth > MAX_BUILD_DEPTH) {
    return;
  }
  if (value == null || typeof value === 'boolean') {
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      pushNormalized(value[i], out, depth + 1);
    }
    return;
  }
  if (isBuildable(value)) {
    pushNormalized(value.build(), out, depth + 1);
    return;
  }
  out.push(buildChild(value));
}

export function normalizeFiboChildren(children: FiboChildren | undefined | null): ReactNode[] {
  if (children === undefined || children === null) {
    return [];
  }
  const raw = typeof children === 'function'
    ? (children as () => FiboChild | FiboChild[])()
    : children;
  const leaves: ReactNode[] = [];
  pushNormalized(raw, leaves);
  return leaves.map((item, index) => withListKey(item, index));
}
