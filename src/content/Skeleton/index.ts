import React, { ReactElement } from 'react';
import { usePrefersReducedMotion } from '../../core/animationHooks';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const SKELETON_CSS = `@keyframes fibo-skeleton-pulse {
  50% { opacity: 0.5; }
}
.loading-skeleton {
  animation: fibo-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .loading-skeleton,
  .loading-skeleton * {
    animation: none !important;
  }
}`;

function withSkeletonCss(host: ReactElement): ReactElement {
    return React.createElement(
        React.Fragment,
        null,
        React.createElement('style', { 'data-fibo-skeleton-motion': '' }, SKELETON_CSS),
        host,
    );
}

function toCssSize(value: string | number): string | number {
    if (typeof value === 'number' && Number.isFinite(value)) return `${value}px`;
    return value;
}

const SkeletonInner = React.memo((props: any) => {
    const { width, height, shape, className, style, ...rest } = props;
    const {
        'aria-hidden': _hidden,
        role: _role,
        'aria-busy': _busy,
        ...safeRest
    } = rest;
    const reduceMotion = usePrefersReducedMotion();

    const baseClasses = ['bg-gray-200', 'loading-skeleton'];
    if (!reduceMotion) baseClasses.unshift('animate-pulse');

    if (shape === 'circle') baseClasses.push('rounded-full');
    else if (shape === 'rounded-sm') baseClasses.push('rounded-sm');
    else if (shape === 'rounded-md') baseClasses.push('rounded-md');
    else if (shape === 'rounded-lg') baseClasses.push('rounded-lg');
    else if (shape === 'square') baseClasses.push('rounded-none');
    else baseClasses.push('rounded');

    const host = React.createElement('div', {
        ...safeRest,
        className: [...baseClasses, className].filter(Boolean).join(' '),
        style: {
            ...style,
            width: toCssSize(width),
            height: toCssSize(height),
            ...(reduceMotion ? { animation: 'none' } : {}),
        },
        role: 'status',
        'aria-busy': true,
        'aria-live': 'polite',
        'aria-label': safeRest['aria-label'] || rest['aria-label'] || 'Loading',
    });

    return withSkeletonCss(host);
});

type SkeletonShape = 'circle' | 'square' | 'rounded' | 'rounded-sm' | 'rounded-md' | 'rounded-lg';

class SkeletonBuilder extends FiboBuilder {
  private _width: string | number = '100%';
  private _height: string | number = '20px';
  private _shape: SkeletonShape = 'rounded';

  width(value: string | number): this {
    this._width = value;
    return this;
  }

  height(value: string | number): this {
    this._height = value;
    return this;
  }

  shape(value: SkeletonShape): this {
    this._shape = value;
    return this;
  }

  build(): ReactElement {
    const extra = this._props || {};
    const {
      width: _w,
      height: _h,
      shape: _shape,
      className: extraClass,
      style: extraStyle,
      role: _role,
      'aria-busy': _busy,
      'aria-hidden': _hidden,
      ...restProps
    } = extra;

    const props = {
        ...restProps,
        width: this._width,
        height: this._height,
        shape: this._shape,
        className: [this.getClassName(), extraClass].filter(Boolean).join(' '),
        style: { ...(extraStyle || {}), ...this.getStyle() },
    };

    return React.createElement(SkeletonInner, props);
  }
}

export const Skeleton = createBuilder(SkeletonBuilder);

export interface SkeletonProps extends BaseProps {
  width?: string | number;
  height?: string | number;
  shape?: SkeletonShape;
}
