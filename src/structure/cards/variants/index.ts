import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../../core/builder';
import { Card } from '../../Card';
import { Text } from '../../../content/Text';
import { Box } from '../../Box';
import { Button } from '../../../interactive/Button';
import { Switch } from '../../../interactive/Switch';
import { TextField } from '../../../interactive/TextField';
import { Badge } from '../../../content/Badge';

const InfoCardInner = React.memo((props: any) => {
    const { title, description, icon, footer, className, style } = props;

    return Card()
        .className(className)
        .style(style)
        .children([
            Box().className("flex items-start gap-4").children([
               icon ? Box().className("mt-1 text-gray-400").children(icon).build() : null,
               Box().className("flex-1").children([
                   title ? Text(title).fontSize(16).fontWeight(600).color("#111827").build() : null,
                   description ? Text(description).fontSize(14).color("#6B7280").className("mt-1").build() : null,
                   footer ? Box().className("mt-4").children(footer).build() : null
               ]).build()
            ]).build()
        ]).build();
});

class InfoCardBuilder extends FiboBuilder {
  private _title?: string;
  private _description?: string;
  private _icon?: ReactElement;
  private _footer?: ReactElement;

  title(text: string): this {
    this._title = text;
    return this;
  }

  description(text: string): this {
    this._description = text;
    return this;
  }

  icon(element: ReactElement): this {
      this._icon = element;
      return this;
  }

  footer(element: ReactElement): this {
      this._footer = element;
      return this;
  }

  build(): ReactElement {
    const props = {
        title: this._title,
        description: this._description,
        icon: this._icon,
        footer: this._footer,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };
    return React.createElement(InfoCardInner, props);
  }
}

const ActionCardInner = React.memo((props: any) => {
    const { title, description, action, actionType, onAction, actionLabel, className, style } = props;

    let ActionElement = action;

    if (!ActionElement) {
        if (actionType === 'button') {
            ActionElement = Button(actionLabel || 'Action').variant("soft").size("sm").onPress(onAction).build();
        } else if (actionType === 'switch') {

            ActionElement = Switch().onChange(onAction).build();
        }
    }

    return Card()
        .className(`flex items-center justify-between gap-4 ${className || ''}`)
        .style(style)
        .children([
           Box().className("flex-1").children([
               title ? Text(title).fontSize(16).fontWeight(600).color("#111827").build() : null,
               description ? Text(description).fontSize(14).color("#6B7280").className("mt-1").build() : null,
           ]).build(),
           ActionElement ? Box().className("flex-shrink-0").children(ActionElement).build() : null
        ]).build();
});

class ActionCardBuilder extends FiboBuilder {
    private _title?: string;
    private _description?: string;
    private _action?: ReactElement;
    private _actionType?: 'button' | 'switch';
    private _actionLabel?: string;
    private _onAction?: (val?: any) => void;

    title(text: string): this {
      this._title = text;
      return this;
    }

    description(text: string): this {
      this._description = text;
      return this;
    }

    action(element: ReactElement): this {
        this._action = element;
        return this;
    }

    withButton(label: string, onPress?: () => void): this {
        this._actionType = 'button';
        this._actionLabel = label;
        this._onAction = onPress;
        return this;
    }

    withSwitch(onChange?: (val: boolean) => void): this {
        this._actionType = 'switch';
        this._onAction = onChange;
        return this;
    }

    build(): ReactElement {
      const props = {
          title: this._title,
          description: this._description,
          action: this._action,
          actionType: this._actionType,
          actionLabel: this._actionLabel,
          onAction: this._onAction,
          className: this.getClassName(),
          style: this.getStyle(),
          ...this._props
      };
      return React.createElement(ActionCardInner, props);
    }
}

export const InfoCard = createBuilder(InfoCardBuilder);

export const ActionCard = createBuilder(ActionCardBuilder);

const InputCardInner = React.memo((props: any) => {
    const { title, description, placeholder, value, onChange, type, className, style } = props;

    return Card()
        .className(className)
        .style(style)
        .children([
            title ? Text(title).fontSize(14).fontWeight(600).color("#374151").className("mb-1").build() : null,
            description ? Text(description).fontSize(12).color("#6B7280").className("mb-3").build() : null,
            TextField()
                .placeholder(placeholder)
                .value(value)
                .type(type)
                .onChange(onChange)
                .className("w-full")
                .build()
        ]).build();
});

class InputCardBuilder extends FiboBuilder {
    private _title?: string;
    private _description?: string;
    private _placeholder?: string;
    private _value?: string;
    private _type: string = 'text';
    private _onChange?: (val: string) => void;

    title(text: string): this {
        this._title = text;
        return this;
    }

    description(text: string): this {
        this._description = text;
        return this;
    }

    placeholder(text: string): this {
        this._placeholder = text;
        return this;
    }

    value(text: string): this {
        this._value = text;
        return this;
    }

    type(t: string): this {
        this._type = t;
        return this;
    }

    onChange(cb: (val: string) => void): this {
        this._onChange = cb;
        return this;
    }

    build(): ReactElement {
        const props = {
            title: this._title,
            description: this._description,
            placeholder: this._placeholder,
            value: this._value,
            type: this._type,
            onChange: this._onChange,
            className: this.getClassName(),
            style: this.getStyle(),
            ...this._props
        };
        return React.createElement(InputCardInner, props);
    }
}

export const InputCard = createBuilder(InputCardBuilder);

const MetricCardInner = React.memo((props: any) => {
    const { title, value, trend, trendDirection, className, style } = props;

    const trendColor = trendDirection === 'up' ? 'success' : trendDirection === 'down' ? 'error' : 'none';
    const trendIcon = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•';

    return Card()
        .className(className)
        .style(style)
        .children([
            Text(title).fontSize(14).fontWeight(600).color("#6B7280").build(),
            Box().className("flex items-end justify-between mt-2").children([
                Text(value).fontSize(32).fontWeight(800).color("#111827").build(),
                trend ? Badge()
                    .text(`${trendIcon} ${trend}`)
                    .intent(trendColor)
                    .variant("accent")
                    .build() : null
            ]).build()
        ]).build();
});

class MetricCardBuilder extends FiboBuilder {
    private _title: string = '';
    private _value: string = '';
    private _trend?: string;
    private _trendDirection: 'up' | 'down' | 'neutral' = 'neutral';

    title(text: string): this {
        this._title = text;
        return this;
    }

    value(text: string): this {
        this._value = text;
        return this;
    }

    trend(text: string, direction: 'up' | 'down' | 'neutral' = 'neutral'): this {
        this._trend = text;
        this._trendDirection = direction;
        return this;
    }

    build(): ReactElement {
        const props = {
            title: this._title,
            value: this._value,
            trend: this._trend,
            trendDirection: this._trendDirection,
            className: this.getClassName(),
            style: this.getStyle(),
            ...this._props
        };
        return React.createElement(MetricCardInner, props);
    }
}

export const MetricCard = createBuilder(MetricCardBuilder);
