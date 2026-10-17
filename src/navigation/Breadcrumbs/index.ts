import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { isDangerousUrl } from '../../core/safeUrl';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class BreadcrumbsBuilder extends FiboBuilder {
  private _items: BreadcrumbItem[] = [];

  items(items: BreadcrumbItem[]): this {
    this._items = items;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, key: _key, children: _children, ...rest } = this._props;
    const className = ['fibo-breadcrumbs', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle();
    const lastIndex = this._items.length - 1;

    const list = React.createElement(
      'ol',
      null,
      ...this._items.map((item, index) => {
        const last = index === lastIndex;
        const href =
          !last && item.href && !isDangerousUrl(item.href) ? item.href : undefined;
        const content = href
          ? React.createElement('a', { href }, slot(item.label))
          : slot(item.label);
        return React.createElement(
          'li',
          {
            key: index,
            'aria-current': last ? 'page' : undefined,
          },
          content
        );
      })
    );

    return React.createElement(
      'nav',
      { ...rest, className, style, 'aria-label': 'Breadcrumb' },
      list
    );
  }
}

export const Breadcrumbs = createBuilder(BreadcrumbsBuilder);
