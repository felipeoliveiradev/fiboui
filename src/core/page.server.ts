import React, { type ComponentType, type ReactElement, type ReactNode } from 'react';
import { buildChild } from './children';
import type { FiboChild } from './types';
import { FiboStyles } from './styleManager';
import type { FiboPageBuild, FiboPageComponent, FiboPageOptions } from './page';

/**
 * RSC entry. One render, no hooks. The client `page()` keeps `signal()` stable
 * and re-runs the builder when a read `.value` changes.
 */
export function page(
  build: FiboPageBuild,
  options: FiboPageOptions = {}
): FiboPageComponent {
  const { styles = true, meta } = options;

  function FiboPage(): ReactElement {
    const tree = buildChild(build());
    const nodes: ReactNode[] = [];
    if (typeof meta?.title === 'string' && meta.title.length > 0) {
      nodes.push(React.createElement('title', { key: 'fibo-title' }, meta.title));
    }
    if (typeof meta?.description === 'string' && meta.description.length > 0) {
      nodes.push(
        React.createElement('meta', {
          key: 'fibo-description',
          name: 'description',
          content: meta.description,
        })
      );
    }
    nodes.push(tree);
    if (styles) {
      nodes.push(React.createElement(FiboStyles));
    }
    return React.createElement(React.Fragment, null, ...nodes);
  }

  FiboPage.displayName = 'FiboPage';
  if (meta) {
    (FiboPage as FiboPageComponent).meta = meta;
  }
  return FiboPage as ComponentType & { meta?: FiboPageOptions['meta'] };
}

export const createPage = page;

export function withFiboStyles(child: FiboChild | ReactNode): ReactElement {
  return React.createElement(
    React.Fragment,
    null,
    buildChild(child),
    React.createElement(FiboStyles)
  );
}
