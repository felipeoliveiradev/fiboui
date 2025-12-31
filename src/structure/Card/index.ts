import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

const CardInner = React.memo((props: any) => {
    const { text, subtitle, number, color, className, style, children, ...rest } = props;
    
    return React.createElement(
      'div',
      {
        className: `rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 border-none p-4 ${className || ''}`,
        style: { backgroundColor: '#ffffff', ...style },
        ...rest,
      },
      React.createElement(
        'div',
        { className: 'flex flex-col gap-2' },
        text &&
          React.createElement(
            'h3',
            {
              className: 'font-semibold text-[var(--fibo-on-surface-variant)] text-sm uppercase tracking-wide',
            },
            text
          ),
        number &&
          React.createElement(
            'p',
            {
              className: 'font-bold text-[var(--fibo-on-surface)] text-3xl',
            },
            number
          ),
        subtitle &&
          React.createElement(
            'p',
            {
              className: 'text-[var(--fibo-on-surface-variant)] text-xs',
            },
            subtitle
          ),
        ...children
      )
    );
});

class CardBuilder extends FiboBuilder {
  private _text: string = '';
  private _subtitle?: string;
  private _number?: string;
  private _color?: string;

  text(value: string): this {
    this._text = value;
    return this;
  }

  subtitle(value: string): this {
    this._subtitle = value;
    return this;
  }

  number(value: string): this {
    this._number = value;
    return this;
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  build(): ReactElement {
    const colorClasses: Record<string, string> = {
      green: 'border-l-green-500',
      orange: 'border-l-orange-500',
      red: 'border-l-red-500',
      blue: 'border-l-blue-500',
      purple: 'border-l-purple-500',
    };

    const className = [
      'fibo-card',
      this._color ? `border-l-4 ${colorClasses[this._color]}` : '',
      ...this._classNames,
    ]
      .filter(Boolean)
      .join(' ');

    const props = {
        text: this._text,
        subtitle: this._subtitle,
        number: this._number,
        color: this._color,
        className: className,
        style: this.getStyle(),
        children: this.processChildren(),
        ...this._props
    };

    return React.createElement(CardInner, props);
  }
}


export const Card = createBuilder(CardBuilder);

export interface CardProps extends BaseProps {
  text: string;
  subtitle?: string;
  number?: string;
  color?: string;
}
