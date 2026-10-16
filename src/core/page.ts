import React, { type ComponentType, type ReactElement, type ReactNode } from 'react';
import { buildChild } from './children';
import type { FiboChild } from './types';
import { FiboStyles } from './styleManager';

export type FiboPageBuild = () => FiboChild | ReactNode;

export type FiboPageOptions = {
  /** Append `<FiboStyles />` after the tree (SSR dynamic CSS). Default true. */
  styles?: boolean;
};

/**
 * Next/Vite page helper — **zero JSX** in app code, SSR-safe.
 *
 * Next App Router still SSRs Client Components: HTML is rendered on the server,
 * then hydrated. Import `fiboui/style.css` once from `app/layout.tsx` (or the
 * Vite entry) so the base sheet is in the document on first paint.
 *
 * ```ts
 * // app/page.tsx — Server Component (no 'use client')
 * import { page, Column, Text } from 'fiboui'
 *
 * export default page(() =>
 *   Column().gap(12).children([Text('Hello')])
 * )
 * ```
 *
 * App Router resolves `fiboui` via the `react-server` export (static builders).
 * `build()` runs during RSC render so StyleManager rules exist before `<FiboStyles />`.
 */
export function page(
  build: FiboPageBuild,
  options: FiboPageOptions = {}
): ComponentType {
  const { styles = true } = options;

  function FiboPage(): ReactElement {
    // Build during render (SSR + client) so dynamic classes register before styles emit.
    const tree = buildChild(build());
    if (!styles) {
      return React.createElement(React.Fragment, null, tree);
    }
    return React.createElement(React.Fragment, null, tree, React.createElement(FiboStyles));
  }

  FiboPage.displayName = 'FiboPage';
  return FiboPage;
}

/**
 * Alias of `page()`. Prefer `export default page(() => …)` from a Server Component.
 */
export const createPage = page;

/**
 * Wrap any builder / node with `FiboStyles` without JSX.
 *
 * ```ts
 * export default function Home() {
 *   return withFiboStyles(Column().children([Text('Hi')]))
 * }
 * ```
 */
export function withFiboStyles(child: FiboChild | ReactNode): ReactElement {
  return React.createElement(
    React.Fragment,
    null,
    buildChild(child),
    React.createElement(FiboStyles)
  );
}
