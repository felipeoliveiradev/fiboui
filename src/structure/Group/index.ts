'use client';

import React, { type ReactElement, type ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

/**
 * SwiftUI `Group` — identity host (Fragment). No layout, no DOM node.
 * Use to group children for modifiers / conditionals without a Box/Row.
 *
 * ```ts
 * Group().children([
 *   Text('A'),
 *   Text('B'),
 * ])
 *
 * Row().children(
 *   Group().children(ForEach(items).renderItem((i) => chip(i)))
 * )
 * ```
 */
class GroupBuilder extends FiboBuilder {
  build(): ReactElement {
    const nodes = this.processChildren();
    return React.createElement(React.Fragment, null, ...(nodes as ReactNode[]));
  }
}

export const Group = createBuilder(GroupBuilder);
