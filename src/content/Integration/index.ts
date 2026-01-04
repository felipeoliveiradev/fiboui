import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const IntegrationInner = React.memo((props: any) => {
  const {
    source: Source,
    className,
    style,
    ...rest
  } = props;

  if (!Source) return null;

  // We pass down style and className which the builder generates,
  // plus any other props passed via .props()
  return React.createElement(Source, {
    className,
    style,
    ...rest,
  });
});

class IntegrationBuilder extends FiboBuilder {
  private _source: any;

  constructor(source?: any) {
    super();
    this._source = source;
  }

  /**
   * Sets the external component to integrate.
   */
  source(value: any): this {
    this._source = value;
    return this;
  }

  /**
   * Passes direct props to the integrated component.
   */
  props(value: any): this {
    this._props = { ...this._props, ...value };
    return this;
  }

  build(): ReactElement {
    const classes = ['fibo-integration', ...this._classNames];
    const className = classes.filter(Boolean).join(' ');

    const props = {
      source: this._source,
      className: className,
      style: this.getStyle(),
      ...this._props
    };

    return React.createElement(IntegrationInner, props);
  }
}

export const Integration = createBuilder(IntegrationBuilder);

export interface IntegrationProps extends BaseProps {
  source: any;
}
