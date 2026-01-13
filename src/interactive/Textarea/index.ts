import React, { ReactElement, ChangeEvent } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { twMerge } from 'tailwind-merge';
import { BaseProps } from '../../core/types';

const TextareaInner = React.memo((props: any) => {
    const uniqueId = React.useId();
    const inputId = props.id || uniqueId;

    const {
        containerClass,
        containerStyle,
        label,
        error,
        ...inputRest
    } = props;

    return React.createElement(
      'div',
      { className: containerClass, style: containerStyle },
      React.createElement('textarea', {
          id: inputId,
          className: 'fibo-textarea-input w-full p-4 text-base bg-transparent outline-none relative z-10',
          ...inputRest
      }),
      label && React.createElement(
        'label',
        {
            htmlFor: inputId,
            className: 'fibo-textarea-label'
        },
        label
      ),
      error && React.createElement(
        'span',
        { className: 'text-[var(--fibo-error)] text-xs mt-1 ml-1' },
        error
      )
    );
});

class TextareaBuilder extends FiboBuilder {
  private _value: string = '';
  private _label: string = '';
  private _placeholder: string = '';
  private _disabled: boolean = false;
  private _rows: number = 4;
  private _error?: string;
  private _resize: 'none' | 'vertical' | 'horizontal' | 'both' = 'vertical';
  private _onChange?: (value: string) => void;

  value(val: string): this {
    this._value = val;
    return this;
  }

  label(val: string): this {
    this._label = val;
    return this;
  }

  placeholder(val: string): this {
    this._placeholder = val;
    return this;
  }

  disabled(val: boolean = true): this {
    this._disabled = val;
    return this;
  }

  rows(val: number): this {
    this._rows = val;
    return this;
  }

  resize(val: 'none' | 'vertical' | 'horizontal' | 'both'): this {
    this._resize = val;
    return this;
  }

  error(val: string): this {
    this._error = val;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const containerClass = twMerge('fibo-textarea-container w-full', ...this._classNames);

    const props = {
        containerClass,
        containerStyle: this.getStyle(),
        label: this._label,
        error: this._error,
        rows: this._rows,
        value: this._value,
        placeholder: this._placeholder || ' ',
        disabled: this._disabled,
        style: { resize: this._resize },
        onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
            this._onChange?.(e.target.value);
        },
        ...this._props
    };

    return React.createElement(TextareaInner, props);
  }
}

export const Textarea = createBuilder(TextareaBuilder);

export interface TextareaProps extends BaseProps {
  value: string;
  label?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  rows?: number;
}
