'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

interface SearchBarInnerProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

function SearchBarInner(props: SearchBarInnerProps) {
  const { value = '', placeholder, onChange, onSubmit, className, style, id } = props;
  const [current, setCurrent] = useState(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setCurrent(next);
    onChange?.(next);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(current);
  };

  return React.createElement(
    'form',
    {
      className,
      style,
      id,
      role: 'search',
      onSubmit: handleSubmit,
    },
    React.createElement('input', {
      type: 'search',
      value: current,
      placeholder,
      onChange: handleChange,
    })
  );
}

class SearchBarBuilder extends FiboBuilder {
  private _value = '';
  private _placeholder?: string;
  private _onChange?: (value: string) => void;
  private _onSubmit?: (value: string) => void;

  value(value: string): this {
    this._value = value;
    return this;
  }

  placeholder(value: string): this {
    this._placeholder = value;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  onSubmit(handler: (value: string) => void): this {
    this._onSubmit = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, ...rest } = this._props;
    const className = ['fibo-searchbar', this.getClassName(), extraClass].filter(Boolean).join(' ');
    return React.createElement(SearchBarInner, {
      value: this._value,
      placeholder: this._placeholder,
      onChange: this._onChange,
      onSubmit: this._onSubmit,
      className,
      style: this.getStyle(),
      id: rest.id,
    });
  }
}

export const SearchBar = createBuilder(SearchBarBuilder);
