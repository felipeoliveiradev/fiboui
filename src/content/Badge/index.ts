import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { Box } from '../../structure/Box';
import { Text } from '../Text';
import { Row } from '../../layout/Row';

type BadgeVariant = 'neutral' | 'accent' | 'outline' | 'glass' | 'solid' | 'dot';
type BadgeIntent = 'none' | 'success' | 'warning' | 'error' | 'info';
type BadgeShape = 'pill' | 'rounded';

function resolveIntent(intent: unknown): BadgeIntent {
    return intent === 'success' || intent === 'warning' || intent === 'error' || intent === 'info'
        ? intent
        : 'none';
}

function resolveVariant(variant: unknown): BadgeVariant {
    return variant === 'accent' || variant === 'outline' || variant === 'glass' || variant === 'solid' || variant === 'dot' || variant === 'neutral'
        ? variant
        : 'neutral';
}

function resolveShape(shape: unknown): BadgeShape {
    return shape === 'pill' ? 'pill' : 'rounded';
}

const BadgeInner = React.memo((props: any) => {
    const { text, icon, variant, intent, shape, className, style, ...rest } = props;
    const currentIntent = resolveIntent(intent);
    const currentVariant = resolveVariant(variant);
    const currentShape = resolveShape(shape);

    const intentColors: Record<BadgeIntent, { bg: string, text: string, border?: string }> = {
        none: { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' },
        success: { bg: '#ECFDF5', text: '#059669', border: 'transparent' },
        warning: { bg: '#FFFBEB', text: '#D97706', border: 'transparent' },
        error: { bg: '#FFF1F2', text: '#E11D48', border: 'transparent' },
        info: { bg: '#EFF6FF', text: '#2563EB', border: 'transparent' }
    };

    const variantStyles: Record<BadgeVariant, any> = {
      neutral: { backgroundColor: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB' },
      accent: { backgroundColor: '#EFF6FF', color: '#3B82F6', border: 'none' },
      outline: { backgroundColor: 'transparent', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' },

      glass: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          color: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.4)'
      },

      solid: { backgroundColor: '#111827', color: '#FFFFFF', border: 'none' },
      dot: { backgroundColor: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', padding: '4px 10px' }
    };

    let finalStyle = { ...variantStyles[currentVariant] };

    if (currentIntent !== 'none') {
        const colors = intentColors[currentIntent];

        if (currentVariant === 'solid') {

             const solidIntentMap: Record<BadgeIntent, string> = {
                 none: '#111827', success: '#059669', warning: '#D97706', error: '#E11D48', info: '#2563EB'
             };
             finalStyle.backgroundColor = solidIntentMap[currentIntent];
             finalStyle.color = '#FFFFFF';
        } else if (currentVariant === 'dot') {
             finalStyle.color = '#374151';
             finalStyle.borderColor = '#E5E7EB';
        } else {

             finalStyle.backgroundColor = colors.bg;
             finalStyle.color = colors.text;
             if (colors.border) finalStyle.border = `1px solid ${colors.border}`;
             else finalStyle.border = 'none';
        }
    }

    const shapeRadius: Record<BadgeShape, string> = {
      pill: '9999px',
      rounded: '8px'
    };

    const isAlert = currentIntent === 'error' || currentIntent === 'warning';
    const live =
      currentIntent === 'none'
        ? {}
        : {
            role: isAlert ? 'alert' : 'status',
            'aria-live': isAlert ? 'assertive' : 'polite',
          };

    return Box()
      .className(className)
      .style({
        ...finalStyle,
        borderRadius: shapeRadius[currentShape],
        padding: currentVariant === 'dot' ? '4px 8px' : '4px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'fit-content',
        fontSize: '11px',
        lineHeight: '1',
        fontWeight: 600,
        ...style
      })
      .props({
        ...rest,
        ...live,
      })
      .children(
        Row().gap(6).alignItems("center").children([

          currentVariant === 'dot' && currentIntent !== 'none' ?
              Box().style({
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: intentColors[currentIntent].text,
                  boxShadow: `0 0 6px ${intentColors[currentIntent].text}66`
              }).props({ 'aria-hidden': true }).build() : null,

          icon ? Box().classNames(['flex', 'items-center']).children(icon).build() : null,
          Text(text).fontSize(12).fontWeight(600).style({ color: 'inherit' }).build()
        ]).build()
      )
      .build();
});

class BadgeBuilder extends FiboBuilder {
  private _text: string = '';
  private _icon?: ReactNode;
  private _variant: BadgeVariant = 'neutral';
  private _intent: BadgeIntent = 'none';
  private _shape: BadgeShape = 'rounded';

  text(value: string): this {
    this._text = value;
    return this;
  }

  icon(icon: ReactNode): this {
    this._icon = icon;
    return this;
  }

  variant(variant: BadgeVariant): this {
    this._variant = variant;
    return this;
  }

  intent(intent: BadgeIntent): this {
    this._intent = intent;
    return this;
  }

  shape(shape: BadgeShape): this {
    this._shape = shape;
    return this;
  }

  build(): ReactElement {
     const props = {
         text: this._text,
         icon: this._icon,
         variant: this._variant,
         intent: this._intent,
         shape: this._shape,
         className: this.getClassName(),
         style: this.getStyle(),
         ...this._props
     };
     return React.createElement(BadgeInner, props);
  }
}

export const Badge = createBuilder(BadgeBuilder);

export interface BadgeProps extends BaseProps {
  text: string;
  icon?: ReactNode;
  variant?: BadgeVariant;
  intent?: BadgeIntent;
  shape?: BadgeShape;
}
