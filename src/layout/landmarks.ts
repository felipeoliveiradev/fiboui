import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../core/builder';

class SectionBuilder extends FiboBuilder {
  label(value: string): this {
    this._props['aria-label'] = value;
    return this;
  }

  labelledBy(id: string): this {
    this._props['aria-labelledby'] = id;
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'section',
      {
        className: ['fibo-section', this.getClassName()].filter(Boolean).join(' '),
        style: this.getStyle(),
        ...this._props,
      },
      ...this.processChildren()
    );
  }
}

class NavBuilder extends FiboBuilder {
  label(value: string): this {
    this._props['aria-label'] = value;
    return this;
  }

  labelledBy(id: string): this {
    this._props['aria-labelledby'] = id;
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'nav',
      {
        className: ['fibo-nav', this.getClassName()].filter(Boolean).join(' '),
        style: this.getStyle(),
        ...this._props,
      },
      ...this.processChildren()
    );
  }
}

class MainBuilder extends FiboBuilder {
  label(value: string): this {
    this._props['aria-label'] = value;
    return this;
  }

  labelledBy(id: string): this {
    this._props['aria-labelledby'] = id;
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'main',
      {
        className: ['fibo-main', this.getClassName()].filter(Boolean).join(' '),
        style: this.getStyle(),
        ...this._props,
      },
      ...this.processChildren()
    );
  }
}

class FooterBuilder extends FiboBuilder {
  label(value: string): this {
    this._props['aria-label'] = value;
    return this;
  }

  labelledBy(id: string): this {
    this._props['aria-labelledby'] = id;
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'footer',
      {
        className: ['fibo-footer', this.getClassName()].filter(Boolean).join(' '),
        style: this.getStyle(),
        ...this._props,
      },
      ...this.processChildren()
    );
  }
}

export const Section = createBuilder(SectionBuilder);
export const Nav = createBuilder(NavBuilder);
export const Main = createBuilder(MainBuilder);
export const Footer = createBuilder(FooterBuilder);
