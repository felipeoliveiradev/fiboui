import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

type SpinnerVariant = 'circle' | 'dots' | 'pulse' | 'blocks';
type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl' | number;

const SpinnerInner = React.memo((props: any) => {
    const { size, color, variant = 'circle', className, style, ...rest } = props;

    const sizeMap: Record<string, number> = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48
    };

    const pixelSize = typeof size === 'number' ? size : (sizeMap[size] || 24);
    const mainColor = color || "currentColor";

    const containerProps = {
        className: `fibo-spinner ${className}`,
        style: { width: pixelSize, height: pixelSize, ...style },
        role: 'status',
        'aria-live': 'polite',
        'aria-label': props['aria-label'] || 'Loading',
        ...rest
    };

    if (variant === 'dots') {
        return React.createElement('div', { ...containerProps, className: `${containerProps.className} flex items-center justify-between` },
            [0, 1, 2].map(i => React.createElement('div', {
                key: i,
                className: 'w-[25%] h-[25%] rounded-full animate-bounce',
                style: {
                    backgroundColor: mainColor,
                    animationDelay: `${i * 0.1}s`
                }
            }))
        );
    }

    if (variant === 'pulse') {
        return React.createElement('div', { ...containerProps, className: `${containerProps.className} relative flex items-center justify-center` },
            [
                React.createElement('div', {
                    key: 'ring',
                    className: 'absolute inset-0 rounded-full opacity-75 animate-ping',
                    style: { backgroundColor: mainColor }
                }),
                React.createElement('div', {
                    key: 'dot',
                    className: 'relative rounded-full h-[75%] w-[75%]',
                    style: { backgroundColor: mainColor }
                })
            ]
        );
    }

    if (variant === 'blocks') {
        return React.createElement('div', { ...containerProps, className: `${containerProps.className} grid grid-cols-2 gap-[10%] p-[10%]` },
            [0, 1, 2, 3].map(i => React.createElement('div', {
                key: i,
                className: 'w-full h-full bg-current animate-pulse',
                style: {
                    backgroundColor: mainColor,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.6
                }
            }))
        );
    }

    return React.createElement(
        'div',
        { ...containerProps, className: `${containerProps.className} animate-spin` },
        React.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            fill: "none",
            viewBox: "0 0 24 24",
            style: { width: '100%', height: '100%' }
        },
        React.createElement("circle", {
            className: "opacity-20",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: mainColor,
            strokeWidth: "4"
        }),
        React.createElement("path", {
            className: "",
            fill: mainColor,
            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        }))
    );
});

class SpinnerBuilder extends FiboBuilder {
  private _size: SpinnerSize = 'md';
  private _color?: string;
  private _variant: SpinnerVariant = 'circle';

  size(value: SpinnerSize): this {
    this._size = value;
    return this;
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  variant(value: SpinnerVariant): this {
    this._variant = value;
    return this;
  }

  build(): ReactElement {
    const props = {
        size: this._size,
        color: this._color,
        variant: this._variant,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };

    return React.createElement(SpinnerInner, props);
  }
}

export const Spinner = createBuilder(SpinnerBuilder);

export interface SpinnerProps extends BaseProps {
  size?: SpinnerSize;
  color?: string;
  variant?: SpinnerVariant;
}
