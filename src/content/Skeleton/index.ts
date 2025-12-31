import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const SkeletonInner = React.memo((props: any) => {
    const { width, height, shape, className, style, ...rest } = props;

    const baseClasses = ['animate-pulse', 'bg-gray-200', 'loading-skeleton'];
    
    if (shape === 'circle') baseClasses.push('rounded-full');
    else if (shape === 'rounded-sm') baseClasses.push('rounded-sm');
    else if (shape === 'rounded-md') baseClasses.push('rounded-md');
    else if (shape === 'rounded-lg') baseClasses.push('rounded-lg');
    else if (shape === 'square') baseClasses.push('rounded-none');
    else baseClasses.push('rounded'); 

    return React.createElement('div', {
        className: [...baseClasses, className].filter(Boolean).join(' '),
        style: {
            width: width,
            height: height,
            ...style
        },
        ...rest
    });
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
    const props = {
        width: this._width,
        height: this._height,
        shape: this._shape,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
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
