import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, StatusType } from '../../core/types';

const BannerInner = React.memo((props: any) => {
    const { status, title, subtitle, className, style, ...rest } = props;
    
    return React.createElement(
      'div',
      {
        className,
        style,
        ...rest,
      },
      React.createElement(
        'div',
        { className: 'flex flex-col gap-1' },
        title &&
          React.createElement(
            'h4',
            {
              className: 'font-semibold text-sm uppercase tracking-wide opacity-90',
            },
            title
          ),
        subtitle &&
          React.createElement(
            'p',
            {
              className: 'opacity-80 text-sm',
            },
            subtitle
          )
      )
    );
});

class BannerBuilder extends FiboBuilder {
  private _status: StatusType = 'info';
  private _title: string = '';
  private _subtitle?: string;

  constructor(title: string = '') {
    super();
    this._title = title;
  }

  status(value: StatusType): this {
    this._status = value;
    return this;
  }

  title(value: string): this {
    this._title = value;
    return this;
  }

  subtitle(value: string): this {
    this._subtitle = value;
    return this;
  }

  build(): ReactElement {
    const classes = [
      'fibo-banner',
      `fibo-banner-${this._status}`,
      ...this._classNames,
    ];

    const className = classes.filter(Boolean).join(' ');
    
    const props = {
        status: this._status,
        title: this._title,
        subtitle: this._subtitle,
        className: className,
        style: this.getStyle(),
        ...this._props
    };

    return React.createElement(BannerInner, props);
  }
}


export const Banner = createBuilder(BannerBuilder);

export interface BannerProps extends BaseProps {
  status: StatusType;
  title: string;
  subtitle?: string;
}
