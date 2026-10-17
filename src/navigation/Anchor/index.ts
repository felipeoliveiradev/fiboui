import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { isDangerousUrl, mergeRel } from '../../core/safeUrl';

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class AnchorBuilder extends FiboBuilder {
  private _href?: string;
  private _target?: string;
  private _rel?: string;

  constructor(private _label: ReactNode = null) {
    super();
  }

  href(value: string): this {
    this._href = value;
    return this;
  }

  target(value: string): this {
    this._target = value;
    return this;
  }

  rel(value: string): this {
    this._rel = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, key: _key, children: _children, rel: propsRel, href: _propsHref, target: _propsTarget, ...rest } =
      this._props;
    const className = ['fibo-anchor', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle();
    const href = this._href != null && isDangerousUrl(this._href) ? undefined : this._href;
    const target = this._target;
    const blank = target != null && String(target).toLowerCase() === '_blank';
    const rel = blank ? mergeRel(this._rel ?? propsRel, 'noopener noreferrer') : (this._rel ?? propsRel);

    return React.createElement(
      'a',
      {
        ...rest,
        className,
        style,
        href,
        target,
        rel,
      },
      slot(this._label)
    );
  }
}

export const Anchor = createBuilder(AnchorBuilder);
