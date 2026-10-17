import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

type LazyDirection = 'vertical' | 'horizontal';

function trackList(columns: number): string {
  return `repeat(${columns}, minmax(0, 1fr))`;
}

class LazyGridBuilder extends FiboBuilder {
  private _direction: LazyDirection = 'vertical';
  private _columns = 1;
  private _spacing = 0;

  direction(value: LazyDirection): this {
    this._direction = value;
    return this;
  }

  /** Vertical: column count. Horizontal: row count (SwiftUI LazyHGrid rows). */
  columns(count: number): this {
    this._columns = count;
    return this;
  }

  spacing(value: number): this {
    this._spacing = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, style: extraStyle, ...rest } = this._props;
    const tracks = trackList(this._columns);
    const gap = `${this._spacing}px`;
    const axis: CSSProperties =
      this._direction === 'horizontal'
        ? {
            gridAutoFlow: 'column',
            gridTemplateRows: tracks,
            overflowX: 'auto',
          }
        : {
            gridAutoFlow: 'row',
            gridTemplateColumns: tracks,
          };

    const style: CSSProperties = {
      ...this.getStyle(),
      ...(extraStyle && typeof extraStyle === 'object' ? extraStyle : {}),
      display: 'grid',
      gap,
      ...axis,
    };

    return React.createElement(
      'div',
      {
        ...rest,
        className: ['fibo-lazy-grid', this.getClassName(), extraClass].filter(Boolean).join(' '),
        style,
      },
      ...this.processChildren(),
    );
  }
}

export const LazyGrid = createBuilder(LazyGridBuilder);
