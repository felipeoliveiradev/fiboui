import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';
import { twMerge } from 'tailwind-merge';

const Chevron = () =>
  React.createElement(
    'svg',
    {
      width: 12,
      height: 12,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      'aria-hidden': true,
    },
    React.createElement('path', { d: 'M9 5l7 7-7 7' })
  );

const ListTileInner = React.memo((props: any) => {
  const {
    leading,
    title,
    subtitle,
    trailing,
    chevron,
    divider,
    dividerColor,
    onPress,
    className,
    style,
    ...rest
  } = props;

  const userStyle: React.CSSProperties = style || {};
  const padding = userStyle.padding ?? '14px 0';

  const titleNode =
    typeof title === 'string'
      ? React.createElement(
          'span',
          {
            className: 'fibo-list-tile-title',
            style: { fontSize: 11, letterSpacing: '0.06em', lineHeight: 1.3, margin: 0 },
          },
          title
        )
      : title;

  const subtitleNode =
    typeof subtitle === 'string'
      ? React.createElement(
          'span',
          {
            className: 'fibo-list-tile-subtitle',
            style: {
              fontSize: 8,
              letterSpacing: '0.06em',
              lineHeight: 1.3,
              margin: 0,
              color: '#9a9a9a',
            },
          },
          subtitle
        )
      : subtitle;

  return React.createElement(
    'div',
    {
      className: twMerge('fibo-list-tile flex flex-row items-center w-full', className),
      style: {
        padding,
        borderBottom: divider ? `1px solid ${dividerColor || '#3b3b3b'}` : 'none',
        cursor: onPress ? 'pointer' : undefined,
        ...userStyle,
      },
      onClick: onPress,
      role: onPress ? 'button' : undefined,
      ...rest,
    },
    leading
      ? React.createElement(
          'div',
          {
            key: 'leading',
            className: 'fibo-list-tile-leading shrink-0 flex items-center',
            style: { color: '#9a9a9a', marginRight: 12 },
          },
          leading
        )
      : null,
    React.createElement(
      'div',
      {
        key: 'body',
        className: 'fibo-list-tile-body flex-1 min-w-0 flex flex-col justify-center',
      },
      titleNode,
      subtitleNode
    ),
    trailing
      ? React.createElement(
          'div',
          {
            key: 'trailing',
            className: 'fibo-list-tile-trailing shrink-0 flex items-center',
            style: { color: '#9a9a9a', marginLeft: 12 },
          },
          trailing
        )
      : null,
    chevron
      ? React.createElement(
          'div',
          {
            key: 'chevron',
            className: 'fibo-list-tile-chevron shrink-0 flex items-center',
            style: { color: '#9a9a9a', marginLeft: trailing ? 8 : 0 },
          },
          React.createElement(Chevron)
        )
      : null
  );
});

class ListTileBuilder extends FiboBuilder {
  private _leading?: ReactNode;
  private _title?: ReactNode;
  private _subtitle?: ReactNode;
  private _trailing?: ReactNode;
  private _chevron = false;
  private _divider = false;
  private _dividerColor?: string;
  private _onPress?: () => void;

  leading(node: FiboChild): this {
    this._leading = buildChild(node);
    return this;
  }

  icon(node: FiboChild): this {
    return this.leading(node);
  }

  title(value: string | FiboChild): this {
    this._title = typeof value === 'string' ? value : buildChild(value);
    return this;
  }

  subtitle(value: string | FiboChild): this {
    this._subtitle = typeof value === 'string' ? value : buildChild(value);
    return this;
  }

  trailing(node: FiboChild): this {
    this._trailing = buildChild(node);
    return this;
  }

  chevron(show: boolean = true): this {
    this._chevron = show;
    return this;
  }

  divider(show: boolean = true, color?: string): this {
    this._divider = show;
    if (color) this._dividerColor = color;
    return this;
  }

  onPress(handler: () => void): this {
    this._onPress = handler;
    return this;
  }

  build(): ReactElement {
    return React.createElement(ListTileInner, {
      leading: this._leading,
      title: this._title,
      subtitle: this._subtitle,
      trailing: this._trailing,
      chevron: this._chevron,
      divider: this._divider,
      dividerColor: this._dividerColor,
      onPress: this._onPress,
      className: this.getClassName(),
      style: this.getStyle(),
      ...this._props,
    });
  }
}

export const ListTile = createBuilder(ListTileBuilder);

export interface ListTileProps extends BaseProps {
  leading?: ReactNode;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  divider?: boolean;
  onPress?: () => void;
}
