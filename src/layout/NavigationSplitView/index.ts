'use client';

import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import type { FiboChild } from '../../core/types';

export type SplitPane = 'sidebar' | 'content' | 'detail';

const PANES: SplitPane[] = ['sidebar', 'content', 'detail'];

function paneNode(
  pane: SplitPane,
  nodes: { sidebar?: FiboChild; content?: FiboChild; detail?: FiboChild }
): ReactNode {
  const node =
    pane === 'sidebar' ? nodes.sidebar : pane === 'content' ? nodes.content : nodes.detail;
  return buildChild(node) as ReactNode;
}

function columnProps(pane: SplitPane): Record<string, unknown> {
  if (pane === 'sidebar') {
    return { role: 'navigation', 'aria-label': 'Sidebar', className: 'fibo-split-sidebar' };
  }
  if (pane === 'content') {
    return { className: 'fibo-split-content' };
  }
  return { className: 'fibo-split-detail' };
}

function SplitColumn(props: { pane: SplitPane; nodes: { sidebar?: FiboChild; content?: FiboChild; detail?: FiboChild } }) {
  return React.createElement('div', columnProps(props.pane), paneNode(props.pane, props.nodes));
}

function NavigationSplitViewView(props: {
  sidebar?: FiboChild;
  content?: FiboChild;
  detail?: FiboChild;
  compact?: boolean;
  pane?: SplitPane;
  className?: string;
  style?: React.CSSProperties;
}) {
  const {
    sidebar,
    content,
    detail,
    compact = false,
    pane = 'content',
    className,
    style,
    ...rest
  } = props as typeof props & Record<string, unknown>;
  const nodes = { sidebar, content, detail };
  const [current, setCurrent] = useState<SplitPane>(pane);

  const columns = compact ? [current] : PANES;

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-split-view', compact ? 'fibo-split-compact' : 'fibo-split-regular', className]
        .filter(Boolean)
        .join(' '),
      style: {
        display: 'flex',
        minWidth: 0,
        width: '100%',
        ...style,
      },
      'data-compact': compact ? 'true' : 'false',
      'data-pane': current,
    },
    compact
      ? React.createElement(
          'div',
          { className: 'fibo-split-switch', role: 'toolbar', 'aria-label': 'Panes' },
          PANES.map((name) =>
            React.createElement(
              'button',
              {
                key: name,
                type: 'button',
                'data-pane-target': name,
                'aria-pressed': current === name,
                onClick: () => setCurrent(name),
              },
              name
            )
          )
        )
      : null,
    ...columns.map((name) => React.createElement(SplitColumn, { key: name, pane: name, nodes }))
  );
}

class NavigationSplitViewBuilder extends FiboBuilder {
  private _sidebar?: FiboChild;
  private _content?: FiboChild;
  private _detail?: FiboChild;
  private _compact = false;
  private _pane: SplitPane = 'content';

  sidebar(node: FiboChild): this {
    this._sidebar = node;
    return this;
  }

  content(node: FiboChild): this {
    this._content = node;
    return this;
  }

  detail(node: FiboChild): this {
    this._detail = node;
    return this;
  }

  compact(value = true): this {
    this._compact = value;
    return this;
  }

  pane(value: SplitPane): this {
    this._pane = value;
    return this;
  }

  build(): ReactElement {
    return React.createElement(NavigationSplitViewView, {
      sidebar: this._sidebar,
      content: this._content,
      detail: this._detail,
      compact: this._compact,
      pane: this._pane,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const NavigationSplitView = createBuilder(NavigationSplitViewBuilder);
