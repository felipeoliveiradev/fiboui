'use client';

import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

class PageViewBuilder extends FiboBuilder {
  private _pages: ReactNode[] = [];
  private _index = 0;
  private _onChange?: (index: number) => void;

  pages(pages: ReactNode[]): this {
    this._pages = pages;
    return this;
  }

  index(value: number): this {
    this._index = value;
    return this;
  }

  onChange(handler: (index: number) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-page-view', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(PageViewBase, {
      ...rest,
      className,
      style: this.getStyle(),
      pages: this._pages,
      initialIndex: this._index,
      onChange: this._onChange,
    });
  }
}

function PageViewBase({
  pages,
  initialIndex,
  onChange,
  ...rest
}: {
  pages: ReactNode[];
  initialIndex: number;
  onChange?: (index: number) => void;
  [key: string]: unknown;
}) {
  const [current, setCurrent] = useState(initialIndex);

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, next));
    setCurrent(clamped);
    onChange?.(clamped);
  };

  return React.createElement(
    'div',
    rest,
    React.createElement(
      'button',
      { key: 'prev', type: 'button', onClick: () => go(current - 1) },
      'Previous',
    ),
    React.createElement(
      'button',
      { key: 'next', type: 'button', onClick: () => go(current + 1) },
      'Next',
    ),
    React.createElement('div', { key: 'page' }, buildChild(pages[current])),
  );
}

export const PageView = createBuilder(PageViewBuilder);
