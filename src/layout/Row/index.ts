import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, MainAxisAlignment, CrossAxisAlignment } from '../../core/types';

class RowBuilder extends FiboBuilder {
  private _mainAxisAlignment: MainAxisAlignment = 'start';
  private _crossAxisAlignment: CrossAxisAlignment = 'start';
  private _spacing?: string | number;

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

  items(children: ReactElement[]): this {
    this.children(children);
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

    const classes = [
      'fibo-row',
      'flex',
      'flex-row',
      'w-full',
      'self-stretch',
      alignmentMap[this._mainAxisAlignment],
      crossAlignmentMap[this._crossAxisAlignment],
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

export const Row = createBuilder(RowBuilder);

export interface RowProps extends ChildrenProps {
  mainAxisAlignment?: MainAxisAlignment;
  crossAxisAlignment?: CrossAxisAlignment;
  spacing?: string | number;
}
