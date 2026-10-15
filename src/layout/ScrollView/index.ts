import React, { ReactElement, Ref } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { ScrollController } from './ScrollController';

export { ScrollController } from './ScrollController';

type ScrollDirection = 'vertical' | 'horizontal' | 'both';
type ScrollbarVisibility = 'hidden' | 'visible' | 'auto';

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): Ref<T> {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(value);
      else (ref as React.MutableRefObject<T>).current = value;
    }
  };
}

class ScrollViewBuilder extends FiboBuilder {
  private _direction: ScrollDirection = 'vertical';
  private _scrollbar: ScrollbarVisibility = 'auto';
  private _controller?: ScrollController;

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

  /** Attach a ScrollController for programmatic scroll (carousel prev/next). */
  controller(controller: ScrollController): this {
    this._controller = controller;
    return this;
  }

  build(): ReactElement {
    const scrollStyles: React.CSSProperties = {
      overflowX: this._direction === 'horizontal' || this._direction === 'both' ? 'auto' : 'hidden',
      overflowY: this._direction === 'vertical' || this._direction === 'both' ? 'auto' : 'hidden',
      WebkitOverflowScrolling: 'touch',
      display: 'flex',
      flexDirection: this._direction === 'horizontal' ? 'row' : 'column',
      ...this.getStyle(),
    };

    const classNames = [...this.getClassName().split(' ').filter(Boolean)];

    if (this._scrollbar === 'hidden') {
      classNames.push('scrollbar-hide');
      scrollStyles.scrollbarWidth = 'none';
      scrollStyles.msOverflowStyle = 'none';
    }

    const controller = this._controller;
    const userRef = this._props.ref as Ref<HTMLDivElement> | undefined;
    const { ref: _drop, ...restProps } = this._props;

    const attachRef = mergeRefs<HTMLDivElement>(
      (node) => {
        controller?.attach(node);
      },
      userRef,
    );

    return React.createElement(
      'div',
      {
        className: classNames.join(' '),
        style: scrollStyles,
        ref: attachRef,
        ...restProps,
      },
      ...this.processChildren(),
    );
  }
}

export const ScrollView = createBuilder(ScrollViewBuilder);

export interface ScrollViewProps extends BaseProps {
  direction?: ScrollDirection;
  scrollbar?: ScrollbarVisibility;
  controller?: ScrollController;
}
