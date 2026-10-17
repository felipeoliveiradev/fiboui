'use client';

import React, { ReactElement, ReactNode, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { buildChild, isBuildable } from './children';
import { ReactivityRoot } from './ReactivityRoot';
import type { FiboChild } from './types';

const noopRoot: Root = {
  render() {},
  unmount() {},
};

function resolveMountEl(doc: Document, target: string): Element | null {
  const id = target.startsWith('#') ? target.slice(1) : target;
  if (id) {
    const byId = doc.getElementById(id);
    if (byId) return byId;
  }
  try {
    return typeof doc.querySelector === 'function' ? doc.querySelector(target) : null;
  } catch {
    return null;
  }
}

/** Turn a builder (or already-built node) into a React node. */
export function toElement(node: FiboChild): ReactNode {
  return buildChild(node);
}

/**
 * Optional wrapper. Builders are already React elements:
 *
 * ```tsx
 * function App() {
 *   return Button('Save').onPress(save);
 * }
 * ```
 */
export function Fibo({ children }: { children: FiboChild }): ReactElement {
  return toElement(children) as ReactElement;
}

/**
 * Mount a page that returns a builder — no `.build()` on the root.
 *
 * ```ts
 * function App() {
 *   return Column().children([Text('Hi')]);
 * }
 * mount('#root', App);
 * ```
 */
export function mount(
  target: string | Element,
  app: (() => FiboChild) | FiboChild,
  options?: { strict?: boolean }
): Root {
  const doc = globalThis.document;
  let el: Element | null;
  if (typeof target === 'string') {
    if (typeof globalThis.window === 'undefined' || !globalThis.window || !doc?.getElementById) {
      return noopRoot;
    }
    el = resolveMountEl(doc, target);
  } else {
    el = target;
  }
  if (!el) {
    throw new Error(`mount: element not found: ${String(target)}`);
  }

  function AppHost(): ReactElement {
    const tree =
      typeof app === 'function' && !isBuildable(app)
        ? (app as () => FiboChild)()
        : (app as FiboChild);
    return React.createElement(ReactivityRoot, {
      children: toElement(tree),
    }) as ReactElement;
  }

  const root = createRoot(el);
  const tree = React.createElement(AppHost);
  root.render(
    options?.strict === false ? tree : React.createElement(StrictMode, null, tree)
  );
  return root;
}
