import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { Box } from '../../structure/Box';

type AvatarShape = 'circle' | 'rounded' | 'square';
type AvatarStatus = 'none' | 'online' | 'offline' | 'busy';
export type AvatarIcon = 'user' | ReactNode;

const UserGlyph = ({ size }: { size: number | string }) =>
  React.createElement(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      'aria-hidden': true,
      className: 'fibo-avatar-user',
    },
    React.createElement('rect', { width: 24, height: 24, fill: '#ddd' }),
    React.createElement('circle', { cx: 12, cy: 10, r: 5, fill: '#555' }),
    React.createElement('rect', { x: 5, y: 16, width: 14, height: 10, rx: 5, fill: '#555' })
  );

const AvatarInner = React.memo((props: any) => {
    const { image, size, border, shape, status, initials, icon, className, style } = props;

    const sizeValue = typeof size === 'number' ? `${size}px` : size;
    const numericSize = typeof size === 'number' ? size : 40;

    const borderRadiusMap: Record<AvatarShape, string> = {
        circle: '50%',
        rounded: '24%',
        square: '0'
    };

    const statusColors: Record<AvatarStatus, string> = {
        none: 'transparent',
        online: '#10B981',
        offline: '#9CA3AF',
        busy: '#EF4444'
    };

    const statusDot =
      status !== 'none'
        ? Box()
            .style({
              position: 'absolute',
              bottom: '-2%',
              right: '-2%',
              width: '28%',
              height: '28%',
              minWidth: '10px',
              minHeight: '10px',
              backgroundColor: statusColors[status as AvatarStatus],
              borderRadius: '50%',
              border: '3px solid #ffffff',
              boxSizing: 'content-box',
            })
            .build()
        : null;

    const face: ReactNode = image
      ? null
      : initials
        ? String(initials).slice(0, 2).toUpperCase()
        : icon === 'user'
          ? React.createElement(UserGlyph, { size: sizeValue })
          : icon
            ? icon
            : null;

    return Box()
      .className(`fibo-avatar ${className || ''}`)
      .style({
        position: 'relative',
        width: sizeValue,
        height: sizeValue,
        borderRadius: borderRadiusMap[shape as AvatarShape],
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundColor: image ? undefined : (style?.backgroundColor || (initials ? '#ddd' : 'transparent')),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: border,
        boxShadow: border !== 'none' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        color: style?.color || '#555',
        fontSize: numericSize * 0.42,
        fontWeight: 500,
        lineHeight: 1,
        ...style
      })
      .children([face, statusDot])
      .build();
});

class AvatarBuilder extends FiboBuilder {
  private _image: string = '';
  private _size: string | number = 40;
  private _border: string = 'none';
  private _shape: AvatarShape = 'circle';
  private _status: AvatarStatus = 'none';
  private _initials?: string;
  private _icon?: AvatarIcon;

  image(url: string): this {
    this._image = url;
    return this;
  }

  size(value: string | number): this {
    this._size = value;
    return this;
  }

  border(value: string): this {
    this._border = value;
    return this;
  }

  shape(value: AvatarShape): this {
    this._shape = value;
    return this;
  }

  status(value: AvatarStatus): this {
    this._status = value;
    return this;
  }

  initials(text: string): this {
    this._initials = text;
    return this;
  }

  icon(source: AvatarIcon = 'user'): this {
    this._icon = source;
    return this;
  }

  build(): ReactElement {
    const props = {
        image: this._image,
        size: this._size,
        border: this._border,
        shape: this._shape,
        status: this._status,
        initials: this._initials,
        icon: this._icon,
        className: this.getClassName(),
        style: this.getStyle()
    };
    return React.createElement(AvatarInner, props);
  }
}

export const Avatar = createBuilder(AvatarBuilder);

export interface AvatarProps extends BaseProps {
  image?: string;
  size?: string | number;
  border?: string;
  shape?: AvatarShape;
  status?: AvatarStatus;
  initials?: string;
  icon?: AvatarIcon;
}
