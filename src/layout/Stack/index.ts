import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

// --- ZStack (Overlay) ---

class ZStackBuilder extends FiboBuilder {
  private _alignment: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' = 'center';

  alignment(align: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'): this {
    this._alignment = align;
    return this;
  }

  build(): ReactElement {
    // Positioning map for the container contents
    const alignmentClasses: Record<string, string> = {
      center: 'place-items-center',
      top: 'place-items-start justify-items-center',
      bottom: 'place-items-end justify-items-center',
      left: 'place-items-start content-center',
      right: 'place-items-end content-center',
      topLeft: 'place-items-start',
      topRight: 'justify-items-end items-start',
      bottomLeft: 'justify-items-start items-end',
      bottomRight: 'place-items-end',
    };

    // We use CSS Grid 1x1 to stack elements
    // [&>*] targets all direct children to place them in the first cell
    const stackClasses = [
      'grid',
      'grid-cols-1',
      'grid-rows-1',
      '[&>*]:col-start-1',
      '[&>*]:row-start-1',
      alignmentClasses[this._alignment] || 'place-items-center', // Default to center like SwiftUI
      ...this._classNames
    ];

    const className = stackClasses.filter(Boolean).join(' ');
    const style = this.getStyle();

    // Process children
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

export const ZStack = createBuilder(ZStackBuilder);


