import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
type ClipShape = 'circle' | 'rounded' | 'square';

const ImageInner = React.memo((props: any) => {
    const {
        src,
        alt,
        fit,
        resizable,
        clipShape,
        frameWidth,
        frameHeight,
        className,
        style,
        ...rest
    } = props;

    const finalStyle = { ...style };

    finalStyle.objectFit = fit;

    if (frameWidth) {
      finalStyle.width = `${frameWidth}px`;
    }

    if (frameHeight) {
      finalStyle.height = `${frameHeight}px`;
    }

    if (resizable) {
      finalStyle.maxWidth = '100%';
      finalStyle.height = 'auto';
    }

    return React.createElement('img', {
      src: src,
      alt: alt,
      className,
      style: finalStyle,
      ...rest,
    });
});

class ImageBuilder extends FiboBuilder {
  private _src: string = '';
  private _alt: string = '';
  private _fit: ImageFit = 'cover';
  private _resizable: boolean = false;
  private _clipShape?: ClipShape;
  private _frameWidth?: number;
  private _frameHeight?: number;
  private _foregroundStyle?: string;

  constructor(src: string = '') {
    super();
    this._src = src;
  }

  src(value: string): this {
    this._src = value;
    return this;
  }

  alt(value: string): this {
    this._alt = value;
    return this;
  }

  resizable(): this {
    this._resizable = true;
    return this;
  }

  scaledToFit(): this {
    this._fit = 'contain';
    return this;
  }

  scaledToFill(): this {
    this._fit = 'cover';
    return this;
  }

  frame(dimensions: { width: number; height: number }): this {
    this._frameWidth = dimensions.width;
    this._frameHeight = dimensions.height;
    return this;
  }

  clipShape(shape: ClipShape): this {
    this._clipShape = shape;
    return this;
  }

  foregroundStyle(style: string): this {
    this._foregroundStyle = style;
    return this;
  }

  build(): ReactElement {
    const classes = ['fibo-image', ...this._classNames];

    if (this._clipShape === 'circle') {
      classes.push('rounded-full');
    } else if (this._clipShape === 'rounded') {
      classes.push('rounded-lg');
    }

    const className = classes.filter(Boolean).join(' ');
    const style = this.getStyle();
    if (this._foregroundStyle) {
      style.color = this._foregroundStyle;
    }

    const props = {
        src: this._src,
        alt: this._alt,
        fit: this._fit,
        resizable: this._resizable,
        clipShape: this._clipShape,
        frameWidth: this._frameWidth,
        frameHeight: this._frameHeight,
        className: className,
        style,
        ...this._props
    };

    return React.createElement(ImageInner, props);
  }
}

export const Image = createBuilder(ImageBuilder);

export interface ImageProps extends BaseProps {
  src: string;
  alt?: string;
  fit?: ImageFit;
}
