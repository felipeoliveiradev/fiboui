import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

type ScrollDirection = 'vertical' | 'horizontal' | 'both';
type ScrollbarVisibility = 'hidden' | 'visible' | 'auto';

class ScrollViewBuilder extends FiboBuilder {
  private _direction: ScrollDirection = 'vertical';
  private _scrollbar: ScrollbarVisibility = 'auto';

  direction(direction: ScrollDirection): this {
    this._direction = direction;
    return this;
  }

  horizontal(): this {
    this._direction = 'horizontal';
    return this;
  }

  vertical(): this {
    this._direction = 'vertical';
    return this;
  }

  scrollbar(visibility: ScrollbarVisibility): this {
    this._scrollbar = visibility;
    return this;
  }

  build(): ReactElement {
    const scrollStyles: React.CSSProperties = {
        overflowX: this._direction === 'horizontal' || this._direction === 'both' ? 'auto' : 'hidden',
        overflowY: this._direction === 'vertical' || this._direction === 'both' ? 'auto' : 'hidden',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: this._direction === 'horizontal' ? 'row' : 'column',
        ...this.getStyle()
    };

    const classNames = [...this.getClassName().split(' ')];

    if (this._scrollbar === 'hidden') {
        classNames.push('scrollbar-hide');

        scrollStyles.scrollbarWidth = 'none';

        scrollStyles['msOverflowStyle'] = 'none';
    }

    return React.createElement('div', {
        className: classNames.join(' '),
        style: scrollStyles,
        ...this._props
    }, ...this._children);
  }
}

export const ScrollView = createBuilder(ScrollViewBuilder);

export interface ScrollViewProps extends BaseProps {
  direction?: ScrollDirection;
  scrollbar?: ScrollbarVisibility;
}
