import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';

type ImageCacheStatus = 'ok' | 'error';

const imageCache = new Map<string, ImageCacheStatus>();

interface AsyncImageInnerProps {
  src: string;
  alt: string;
  placeholder?: ReactNode;
  cache?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function AsyncImageInner({
  src,
  alt,
  placeholder,
  cache = true,
  className,
  style,
}: AsyncImageInnerProps): ReactElement | null {
  const safeSrc = src && !isDangerousUrl(src) ? src : undefined;
  const known = cache && safeSrc ? imageCache.get(safeSrc) : undefined;
  const [failed, setFailed] = useState(known === 'error');
  const [loaded, setLoaded] = useState(known === 'ok');

  if (failed) {
    return React.createElement(React.Fragment, null, placeholder ?? null);
  }

  return React.createElement(
    React.Fragment,
    null,
    !loaded && placeholder != null ? placeholder : null,
    React.createElement('img', {
      src: safeSrc,
      alt,
      className,
      style,
      onLoad: () => {
        if (cache && safeSrc) imageCache.set(safeSrc, 'ok');
        setLoaded(true);
      },
      onError: () => {
        if (cache && safeSrc) imageCache.set(safeSrc, 'error');
        setFailed(true);
      },
    }),
  );
}

class AsyncImageBuilder extends FiboBuilder {
  private _src = '';
  private _alt = '';
  private _placeholder?: ReactNode;
  private _cache = true;

  constructor(src: string = '') {
    super();
    this.src(src);
  }

  src(value: string): this {
    this._src = typeof value === 'string' ? value : '';
    return this;
  }

  alt(value: string): this {
    this._alt = typeof value === 'string' ? value : '';
    return this;
  }

  placeholder(node: ReactNode): this {
    this._placeholder = node;
    return this;
  }

  cache(enabled: boolean = true): this {
    this._cache = enabled !== false;
    return this;
  }

  build(): ReactElement {
    return React.createElement(AsyncImageInner, {
      src: this._src,
      alt: this._alt,
      placeholder: this._placeholder,
      cache: this._cache,
      className: `fibo-async-image ${this.getClassName()}`.trim(),
      style: this.getStyle(),
    });
  }
}

export const AsyncImage = createBuilder(AsyncImageBuilder);
