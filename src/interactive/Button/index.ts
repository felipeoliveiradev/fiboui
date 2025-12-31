import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, ButtonVariant } from '../../core/types';


type ExtendedButtonVariant = ButtonVariant | 'ghost' | 'soft' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonShape = 'default' | 'pill' | 'square';

const ButtonInner = React.memo((props: any) => {
    const { 
        text, 
        variant, 
        size, 
        onPress, 
        disabled, 
        icon, 
        shape, 
        shadow, 
        className, 
        style, 
        ...rest 
    } = props;
    
    
    const finalStyle = { ...style };
    
    
    const sizeStyles: Record<ButtonSize, any> = {
        sm: { padding: '6px 14px', fontSize: '13px', gap: '6px', height: '32px' },
        md: { padding: '10px 22px', fontSize: '15px', gap: '8px', height: '44px' }, 
        lg: { padding: '16px 32px', fontSize: '17px', gap: '10px', height: '56px' }
    };
    Object.assign(finalStyle, sizeStyles[size as ButtonSize]);

    
    if (shape === 'pill') {
        finalStyle.borderRadius = '9999px';
    } else if (shape === 'square') {
        finalStyle.borderRadius = '12px'; 
    } else {
        finalStyle.borderRadius = '14px'; 
    }

    
    if (shadow === 'soft') {
        
        finalStyle.boxShadow = '0 8px 20px -6px rgba(59, 130, 246, 0.4)';
    }

    
    if (variant === 'ghost') {
        finalStyle.backgroundColor = 'transparent';
        finalStyle.color = '#4B5563';
        finalStyle.boxShadow = 'none';
        finalStyle.border = '1px solid transparent';
    } 
    else if (variant === 'text') {
        finalStyle.backgroundColor = 'transparent';
        finalStyle.color = '#4B5563';
        finalStyle.boxShadow = 'none';
        finalStyle.border = 'none';
        finalStyle.paddingLeft = '8px';
        finalStyle.paddingRight = '8px';
    }
    else if (variant === 'soft') {
        
        finalStyle.backgroundColor = '#EEF2FF'; 
        finalStyle.color = '#4F46E5'; 
        finalStyle.boxShadow = 'none';
        finalStyle.border = 'none';
    } else if (variant === 'outline') {
        finalStyle.backgroundColor = 'transparent';
        finalStyle.border = '1.5px solid #E5E7EB'; 
        finalStyle.color = '#374151';
        finalStyle.boxShadow = 'none';
    }

    const children = [];
    if (icon) {
      children.push(icon);
    }
    if (text) {
      children.push(text);
    }

    return React.createElement(
      'button',
      {
        className,
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            ...finalStyle
        },
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          if (!disabled) {
            
            if (document.documentElement.classList.contains('fibo-theme-material')) {
              const target = e.currentTarget;
              import('../../core/effects').then(({ createRipple }) => {
                createRipple(e, target);
              });
            }
            onPress?.();
          }
        },
        disabled: disabled,
        ...rest,
      },
      ...children
    );
});

class ButtonBuilder extends FiboBuilder {
  private _text: string = '';
  private _variant: ExtendedButtonVariant = 'elevated';
  private _size: ButtonSize = 'md';
  private _onPress?: () => void;
  private _disabled: boolean = false;
  private _icon?: ReactNode;
  private _shape: ButtonShape = 'default';
  private _shadow: 'none' | 'soft' = 'none';

  constructor(text: string = '') {
    super();
    this._text = text;
  }

  text(value: string): this {
    this._text = value;
    return this;
  }

  variant(variant: ExtendedButtonVariant): this {
    this._variant = variant;
    return this;
  }

  size(size: ButtonSize): this {
    this._size = size;
    return this;
  }

  onPress(handler: () => void): this {
    this._onPress = handler;
    return this;
  }

  disabled(value: boolean = true): this {
    this._disabled = value;
    return this;
  }

  icon(icon: ReactNode): this {
    this._icon = icon;
    return this;
  }

  shape(value: ButtonShape): this {
    this._shape = value;
    return this;
  }

  shadow(value: 'none' | 'soft'): this {
    this._shadow = value;
    return this;
  }

  build(): ReactElement {
    const className = [
      'fibo-button',
      `fibo-button-${this._variant}`,
      'active:scale-[0.96]', 
      'transform',
      'transition-all',
      'duration-200',
      'ease-out',
      ...this._classNames,
    ]
      .filter(Boolean)
      .join(' ');

    const props = {
        text: this._text,
        variant: this._variant,
        size: this._size,
        onPress: this._onPress,
        disabled: this._disabled,
        icon: this._icon,
        shape: this._shape,
        shadow: this._shadow,
        className: className,
        style: this.getStyle(),
        ...this._props
    };

    return React.createElement(ButtonInner, props);
  }
}


export const Button = createBuilder(ButtonBuilder);

export interface ButtonProps extends BaseProps {
  text: string;
  variant?: ExtendedButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  shape?: ButtonShape;
  shadow?: 'none' | 'soft';
}
