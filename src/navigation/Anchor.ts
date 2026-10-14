import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../core/builder';
import { BaseProps, FiboChild } from '../core/types';

class AnchorBuilder extends FiboBuilder {
  private _href = '';
  private _text?: string | (() => string);
  private _external = false;

  constructor(href: string = '') {
    super();
    this._href = href;
  }

  href(value: string): this {
    this._href = value;
    return this;
  }

  text(value: string | (() => string)): this {
    this._text = value;
    return this;
  }

  /** `target="_blank"` + `rel="noreferrer noopener"`. */
  external(enable: boolean = true): this {
    this._external = enable;
    return this;
  }

  label(value: string): this {
    this._props['aria-label'] = value;
    return this;
  }

  build(): ReactElement {
    const children = this.processChildren();
    const text =
      typeof this._text === 'function' ? this._text() : this._text;
    const body = children.length > 0 ? children : text;

    return React.createElement(
      'a',
      {
        href: this._href,
        className: ['fibo-anchor', this.getClassName()].filter(Boolean).join(' '),
        style: this.getStyle(),
        target: this._external ? '_blank' : this._props.target,
        rel: this._external ? 'noreferrer noopener' : this._props.rel,
        ...this._props,
      },
      ...(Array.isArray(body) ? body : [body])
    );
  }
}

/**
 * Plain `<a>` builder for hash, same-page, and external URLs.
 * Router navigation stays on `Link` / `NavLink`.
 */
export const Anchor = createBuilder(AnchorBuilder);

export interface AnchorProps extends BaseProps {
  href?: string;
  children?: FiboChild;
}
