import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { Box } from '../../structure/Box';

type AvatarShape = 'circle' | 'rounded' | 'square';
type AvatarStatus = 'none' | 'online' | 'offline' | 'busy';

const AvatarInner = React.memo((props: any) => {
    const { image, size, border, shape, status, className, style } = props;

    const sizeValue = typeof size === 'number' ? `${size}px` : size;

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

    return Box()
      .className(className)
      .style({
        position: 'relative',
        width: sizeValue,
        height: sizeValue,
        borderRadius: borderRadiusMap[shape as AvatarShape],
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: border,
        boxShadow: border !== 'none' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', 
        ...style
      })
      .children(
          status !== 'none' ? 
            Box().style({
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
                boxSizing: 'content-box' 
            }).build()
            : null
      )
      .build();
});

class AvatarBuilder extends FiboBuilder {
  private _image: string = '';
  private _size: string | number = 40;
  private _border: string = 'none';
  private _shape: AvatarShape = 'circle';
  private _status: AvatarStatus = 'none';

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

  build(): ReactElement {
    const props = {
        image: this._image,
        size: this._size,
        border: this._border,
        shape: this._shape,
        status: this._status,
        className: this.getClassName(),
        style: this.getStyle()
    };
    return React.createElement(AvatarInner, props);
  }
}


export const Avatar = createBuilder(AvatarBuilder);

export interface AvatarProps extends BaseProps {
  image: string;
  size?: string | number;
  border?: string;
  shape?: AvatarShape;
  status?: AvatarStatus;
}
