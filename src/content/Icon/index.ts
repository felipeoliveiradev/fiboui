import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';
import { BaseProps } from '../../core/types';

type IconSource = string | SVGAElement | any | React.ComponentType<{
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}>;

interface IconInnerProps {
  source: IconSource;
  color: string;
  size: number;
  className: string;
  style: React.CSSProperties;
  [key: string]: unknown;
}

const DEFAULT_ICON_SIZE = 24;

function resolveIconSize(size: unknown): number {
  return typeof size === 'number' && Number.isFinite(size) && size > 0
    ? size
    : DEFAULT_ICON_SIZE;
}

function isInlineSvgMarkup(src: string): boolean {
  return /^\s*<svg(\s|>|\/|$)/i.test(src);
}

/** img src: allow http(s)/relative/blob/data:image; drop javascript: and raw <svg> markup. */
function safeIconSrc(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed || isInlineSvgMarkup(trimmed)) return null;
  if (!isDangerousUrl(trimmed)) return src;
  let decoded = trimmed.replace(/[\u0000-\u001F\u007F\u00A0\u200B-\u200D\uFEFF]/g, '');
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep stripped form */
  }
  return /^data:image\//i.test(decoded) ? src : null;
}

const IconInner = React.memo((props: IconInnerProps) => {
  const {
    source: Source,
    color,
    size,
    className,
    style,
    ...rest
  } = props;

  if (!Source) return null;

  const px = resolveIconSize(size);

  if (typeof Source === 'string') {
    const src = safeIconSrc(Source);
    if (!src) return null;
    const alt = typeof rest.alt === 'string' ? rest.alt : '';
    return React.createElement('img', {
      ...rest,
      src,
      alt,
      width: px,
      height: px,
      className,
      style: { ...style, color, width: px, height: px },
      'aria-hidden': alt ? undefined : true,
    });
  }

  if (React.isValidElement(Source)) {
    const el = Source as React.ReactElement<any>;
    const prev = (el.props || {}) as Record<string, unknown>;
    return React.cloneElement(el, {
      ...rest,
      color,
      size: px,
      width: px,
      height: px,
      className: [className, prev.className].filter(Boolean).join(' ') || undefined,
      style: { ...(prev.style as React.CSSProperties | undefined), ...style, color, width: px, height: px },
      'aria-hidden': prev['aria-hidden'] ?? true,
    });
  }

  if (typeof Source !== 'function' && !(typeof Source === 'object' && Source !== null && '$$typeof' in Source)) {
    return null;
  }

  return React.createElement(Source, {
    ...rest,
    color: color,
    size: px,
    className,
    style: { ...style, color, width: px, height: px },
    'aria-hidden': true,
  });
});

class IconBuilder extends FiboBuilder {
  private _source?: IconSource;
  private _color: string = 'currentColor';
  private _size: number = 24;

  constructor(source?: IconSource) {
    super();
    this._source = source;
  }

  source(value: IconSource): this {
    this._source = value;
    return this;
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  size(value: number): this {
    this._size = value;
    return this;
  }

  build(): ReactElement {
    const classes = ['fibo-icon', ...this._classNames];
    const className = classes.filter(Boolean).join(' ');

    const props: IconInnerProps = {
      source: this._source!,
      color: this._color,
      size: this._size,
      className: className,
      style: this.getStyle(),
      ...this._props
    };

    return React.createElement(IconInner, props);
  }
}

export const Icon = createBuilder(IconBuilder);

export interface IconProps extends BaseProps {
  source: IconSource;
  color?: string;
  size?: number;
}
