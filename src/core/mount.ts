import React, { ReactElement, ReactNode, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { buildChild, isBuildable } from './children';
import { ReactivityRoot } from './ReactivityRoot';
import type { FiboChild } from './types';

/** Turn a builder (or already-built node) into a React node. */
export function toElement(node: FiboChild): ReactNode {
  return buildChild(node);
}

/**
 * Render a builder as a React child without calling `.build()` at the call site.
 *
 * ```tsx
 * <Fibo>{Button('Save').onPress(save)}</Fibo>
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
  const el =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) {
    throw new Error(`mount: element not found: ${String(target)}`);
  }

  const tree =
    typeof app === 'function' && !isBuildable(app)
      ? (app as () => FiboChild)()
      : (app as FiboChild);

  const element = toElement(tree);
  const root = createRoot(el);
  const wrapped = React.createElement(ReactivityRoot, { children: element });
  root.render(
    options?.strict === false ? wrapped : React.createElement(StrictMode, null, wrapped)
  );
  return root;
}
