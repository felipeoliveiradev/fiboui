'use client';

import React, { ReactElement, useMemo, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

function itemLabel(item: unknown): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (item != null && typeof item === 'object') {
    const rec = item as { label?: unknown; title?: unknown; text?: unknown; name?: unknown };
    if (typeof rec.label === 'string') return rec.label;
    if (typeof rec.title === 'string') return rec.title;
    if (typeof rec.text === 'string') return rec.text;
    if (typeof rec.name === 'string') return rec.name;
  }
  return '';
}

interface SearchableInnerProps {
  items: unknown[];
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

function SearchableInner(props: SearchableInnerProps) {
  const { items, placeholder, className, style, id } = props;
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle === '') return items;
    return items.filter((item) => itemLabel(item).toLowerCase().includes(needle));
  }, [items, query]);

  return React.createElement(
    'div',
    { className, style, id },
    React.createElement(
      'form',
      {
        role: 'search',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
        },
      },
      React.createElement('input', {
        type: 'search',
        value: query,
        placeholder,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          setQuery(event.target.value);
        },
      }),
    ),
    React.createElement(
      'ul',
      null,
      visible.map((item, index) =>
        React.createElement('li', { key: `${itemLabel(item)}-${index}` }, itemLabel(item)),
      ),
    ),
  );
}

class SearchableBuilder extends FiboBuilder {
  private _items: unknown[] = [];
  private _placeholder?: string;

  items(items: unknown[]): this {
    this._items = Array.isArray(items) ? items : [];
    return this;
  }

  placeholder(value: string): this {
    this._placeholder = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-searchable', this.getClassName(), extraClass].filter(Boolean).join(' ');
    return React.createElement(SearchableInner, {
      items: this._items,
      placeholder: this._placeholder,
      className,
      style: this.getStyle(),
      id: rest.id,
    });
  }
}

export const Searchable = createBuilder(SearchableBuilder);
