import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, MainAxisAlignment, CrossAxisAlignment } from '../../core/types';

class ColumnBuilder extends FiboBuilder {
  private _mainAxisAlignment: MainAxisAlignment = 'start';
  // Flutter Column / SwiftUI VStack default: center. Stretch is opt-in.
  private _crossAxisAlignment: CrossAxisAlignment = 'center';
  private _spacing?: string | number;
  private _size?: 'small' | 'medium' | 'large';

  mainAxisAlignment(alignment: MainAxisAlignment): this {
    this._mainAxisAlignment = alignment;
    return this;
  }

  crossAxisAlignment(alignment: CrossAxisAlignment): this {
    this._crossAxisAlignment = alignment;
    return this;
  }

  spacing(value: string | number): this {
    this._spacing = value;
    return this;
  }

  size(size: 'small' | 'medium' | 'large'): this {
    this._size = size;
    return this;
  }

  build(): ReactElement {
    const alignmentMap: Record<MainAxisAlignment, string> = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      spaceBetween: 'justify-between',
      spaceAround: 'justify-around',
      spaceEvenly: 'justify-evenly',
    };

    const crossAlignmentMap: Record<CrossAxisAlignment, string> = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    };

    const sizeMap = {
      small: 'flex-[0.3]',
      medium: 'flex-1',
      large: 'flex-[1.5]',
    };

    const classes = [
      'fibo-column',
      'flex',
      'flex-col',
      'w-full',
      alignmentMap[this._mainAxisAlignment],
      crossAlignmentMap[this._crossAxisAlignment],
      this._size ? sizeMap[this._size] : '',
      ...this._classNames,
    ];

    const style = this.getStyle();

    if (this._spacing) {
      if (typeof this._spacing === 'number') {
        style.gap = `${this._spacing}px`;
      } else {
        if (!isNaN(Number(this._spacing))) {
          style.gap = `${Number(this._spacing) * 4}px`;
        } else {
          style.gap = this._spacing;
        }
      }
    }

    const className = classes.filter(Boolean).join(' ');
    const children = this.processChildren();

    return React.createElement(
      'div',
      {
        className,
        style,
        ...this._props,
      },
      ...children
    );
  }
}

export const Column = createBuilder(ColumnBuilder);

export interface ColumnProps extends ChildrenProps {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  spacing?: string | number;
  size?: 'small' | 'medium' | 'large';
}
