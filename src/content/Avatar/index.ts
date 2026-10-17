import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';
import { BaseProps } from '../../core/types';
import { Box } from '../../structure/Box';

/** CSS background-image: http(s)/relative/blob; drop javascript:/data:/vbscript:/file:. */
function safeAvatarImage(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || isDangerousUrl(trimmed)) return '';
  return trimmed;
}

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
    React.createElement('circle', { cx: 12, cy: 12, r: 12, fill: '#f2f2f2' }),
    React.createElement('circle', { cx: 12, cy: 9.4, r: 3.6, fill: '#6a6a6a' }),
    React.createElement('path', {
      d: 'M5.6 19.2c.9-3.1 3.4-5 6.4-5s5.5 1.9 6.4 5C16.6 20.6 14.4 21.4 12 21.4s-4.6-.8-6.4-2.2z',
      fill: '#6a6a6a',
    })
  );

const AvatarInner = React.memo((props: any) => {
    const { image, size, border, shape, status, initials, icon, alt, className, style, ...rest } = props;

    const safeImage = safeAvatarImage(image);
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

    const letters =
      typeof initials === 'string' ? initials.trim().slice(0, 2).toUpperCase() : '';

    const face: ReactNode = safeImage
      ? null
      : letters
        ? letters
        : icon === 'user'
          ? React.createElement(UserGlyph, { size: sizeValue })
          : icon
            ? icon
            : null;

    const accessibleName =
      (typeof alt === 'string' && alt.trim()) ||
      letters ||
      'Avatar';

    const innerFace = Box()
      .style({
        width: '100%',
        height: '100%',
        borderRadius: borderRadiusMap[shape as AvatarShape],
        backgroundImage: safeImage ? `url(${JSON.stringify(safeImage)})` : undefined,
        backgroundColor: safeImage ? undefined : (style?.backgroundColor || (letters ? '#ddd' : 'transparent')),
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
      })
      .children([face])
      .build();

    return Box()
      .className(`fibo-avatar ${className || ''}`)
      .props({
        ...rest,
        role: 'img',
        'aria-label': accessibleName,
      })
      .style({
        position: 'relative',
        width: sizeValue,
        height: sizeValue,
        ...style,
        overflow: 'visible',
      })
      .children([innerFace, statusDot])
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
  private _alt?: string;

  image(url: string): this {
    this._image = url;
    return this;
  }

  /** Alias for `.image()` — matches `Image().src()` and docs samples. */
  src(url: string): this {
    return this.image(url);
  }

  alt(text: string): this {
    this._alt = text;
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
        ...this._props,
        image: this._image,
        size: this._size,
        border: this._border,
        shape: this._shape,
        status: this._status,
        initials: this._initials,
        icon: this._icon,
        alt: this._alt,
        className: this.getClassName(),
        style: this.getStyle(),
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
  alt?: string;
}
