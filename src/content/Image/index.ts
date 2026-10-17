import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { isDangerousUrl } from '../../core/safeUrl';
import { BaseProps } from '../../core/types';

type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
type ClipShape = 'circle' | 'rounded' | 'square';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function resolveInterp(text: string | undefined): string {
  if (typeof text !== 'string') return '';
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
}

const CLIP_RADIUS: Record<ClipShape, string> = {
  circle: '50%',
  rounded: '8px',
  square: '0px',
};

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

    const finalStyle: React.CSSProperties = { ...style };
    if (fit) {
      finalStyle.objectFit = fit;
    }

    if (frameWidth) {
      finalStyle.width = `${frameWidth}px`;
    }

    if (frameHeight) {
      finalStyle.height = `${frameHeight}px`;
    }

    if (resizable) {
      finalStyle.maxWidth = '100%';
      if (!frameHeight) {
        finalStyle.height = 'auto';
      }
    }

    if (clipShape === 'circle' || clipShape === 'rounded' || clipShape === 'square') {
      const shape: ClipShape = clipShape;
      finalStyle.overflow = 'hidden';
      finalStyle.borderRadius = CLIP_RADIUS[shape];
    }

    const rawSrc = resolveInterp(typeof src === 'string' ? src : '');
    const safeSrc = rawSrc && !isDangerousUrl(rawSrc) ? rawSrc : undefined;
    const safeAlt = resolveInterp(typeof alt === 'string' ? alt : '');

    return React.createElement('img', {
      ...rest,
      src: safeSrc,
      alt: safeAlt,
      className,
      style: finalStyle,
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
    this.src(src);
  }

  src(value: string): this {
    this._src = typeof value === 'string' ? value : '';
    bindInterp(this, this._src);
    return this;
  }

  alt(value: string): this {
    this._alt = typeof value === 'string' ? value : '';
    bindInterp(this, this._alt);
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
        ...this._props,
        src: resolveInterp(this._src),
        alt: resolveInterp(this._alt),
        fit: this._fit,
        resizable: this._resizable,
        clipShape: this._clipShape,
        frameWidth: this._frameWidth,
        frameHeight: this._frameHeight,
        className: className,
        style,
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
