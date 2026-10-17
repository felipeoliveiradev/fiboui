'use client';

import React, { CSSProperties, ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

class CarouselBuilder extends FiboBuilder {
  private _index = 0;
  private _onChange?: (index: number) => void;

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
    const className = ['fibo-carousel', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(CarouselBase, {
      ...rest,
      className,
      style: this.getStyle(),
      slides: this._children,
      initialIndex: this._index,
      onChange: this._onChange,
    });
  }
}

function CarouselBase({
  slides,
  initialIndex,
  onChange,
  ...rest
}: {
  slides: ReactNode[];
  initialIndex: number;
  onChange?: (index: number) => void;
  [key: string]: unknown;
}) {
  const last = Math.max(0, slides.length - 1);
  const [current, setCurrent] = useState(() => Math.max(0, Math.min(last, initialIndex)));

  const go = (next: number) => {
    const clamped = Math.max(0, Math.min(last, next));
    if (clamped === current) return;
    setCurrent(clamped);
    onChange?.(clamped);
  };

  const trackStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
  };

  const slide = slides[current];

  return React.createElement(
    'div',
    rest,
    React.createElement(
      'div',
      { key: 'nav', className: 'fibo-carousel-nav' },
      React.createElement(
        'button',
        { type: 'button', onClick: () => go(current - 1) },
        'Previous',
      ),
      React.createElement(
        'button',
        { type: 'button', onClick: () => go(current + 1) },
        'Next',
      ),
    ),
    React.createElement(
      'div',
      { key: 'track', className: 'fibo-carousel-track', style: trackStyle },
      slide != null
        ? React.createElement(
            'div',
            {
              key: current,
              style: { flex: '0 0 100%', scrollSnapAlign: 'start', width: '100%' },
            },
            buildChild(slide),
          )
        : null,
    ),
  );
}

export const Carousel = createBuilder(CarouselBuilder);
