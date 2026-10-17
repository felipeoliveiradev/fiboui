'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

export interface OutlineNode {
  id: string;
  label: string;
  children?: OutlineNode[];
}

class OutlineGroupBuilder extends FiboBuilder {
  private _nodes: OutlineNode[] = [];

  nodes(nodes: OutlineNode[]): this {
    this._nodes = nodes;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-outline', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(
      'div',
      { ...rest, className, style: this.getStyle(), role: 'tree' },
      ...this._nodes.map((node) => React.createElement(OutlineBranch, { key: node.id, node })),
    );
  }
}

function OutlineBranch({ node }: { node: OutlineNode }): ReactElement {
  const [open, setOpen] = useState(true);
  const children = node.children ?? [];
  const hasChildren = children.length > 0;

  return React.createElement(
    'div',
    { className: 'fibo-outline-branch' },
    React.createElement(
      'button',
      {
        type: 'button',
        'aria-expanded': hasChildren ? open : undefined,
        onClick: () => {
          if (hasChildren) setOpen((value) => !value);
        },
      },
      node.label,
    ),
    hasChildren
      ? React.createElement(
          'div',
          { role: 'group', hidden: open ? undefined : true },
          open
            ? children.map((child) => React.createElement(OutlineBranch, { key: child.id, node: child }))
            : null,
        )
      : null,
  );
}

export const OutlineGroup = createBuilder(OutlineGroupBuilder);
