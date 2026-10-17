import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

class SectionBuilder extends FiboBuilder {
  private _header?: ReactNode;
  private _footer?: ReactNode;

  header(value: ReactNode): this {
    this._header = value;
    return this;
  }

  footer(value: ReactNode): this {
    this._footer = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-section', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const body = this.processChildren();

    return React.createElement(
      'section',
      { ...rest, className, style: this.getStyle() },
      this._header != null
        ? React.createElement(
            'header',
            { key: 'header', className: 'fibo-section-header' },
            React.createElement('h2', { key: 'heading' }, buildChild(this._header)),
            this._footer != null
              ? React.createElement('footer', { key: 'footer' }, buildChild(this._footer))
              : null,
          )
        : null,
      body.length > 0
        ? React.createElement('div', { key: 'body', className: 'fibo-section-body' }, ...body)
        : null,
    );
  }
}

export const Section = createBuilder(SectionBuilder);
