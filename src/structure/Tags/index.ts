import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface TagItem {
  title: string;
}

const TagsInner = React.memo((props: any) => {
    const { items, className, style, ...rest } = props;

    const tags = items.map((item: TagItem, index: number) =>
      React.createElement(
        'span',
        {
          key: index,
          className: 'fibo-tag',
        },
        item.title
      )
    );

    return React.createElement(
      'div',
      {
        className,
        style,
        ...rest,
      },
      ...tags
    );
});

class TagsBuilder extends FiboBuilder {
  private _items: TagItem[] = [];

  constructor(items: TagItem[] = []) {
    super();
    this._items = items;
  }

  items(items: TagItem[]): this {
    this._items = items;
    return this;
  }

  build(): ReactElement {
    const className = ['fibo-tags', 'flex', 'gap-2', 'flex-wrap', ...this._classNames]
      .filter(Boolean)
      .join(' ');

    const props = {
        items: this._items,
        className: className,
        style: this.getStyle(),
        ...this._props
    };
    return React.createElement(TagsInner, props);
  }
}

export const Tags = createBuilder(TagsBuilder);

export interface TagsProps extends BaseProps {
  items: TagItem[];
}

export type { TagItem };
