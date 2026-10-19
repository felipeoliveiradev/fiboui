import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { allocLiveSlot, type LiveSlot } from '../../core/state';
import { ButtonInner } from './ButtonInner';
import {
  asHtmlButtonType,
  type ButtonMotion,
  type ButtonShape,
  type ButtonSize,
  type ButtonTone,
  type ExtendedButtonVariant,
  type HtmlButtonType,
} from './host';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function bindInterpTree(host: FiboBuilder, node: unknown): void {
  if (typeof node === 'function') {
    try {
      bindInterpTree(host, (node as () => unknown)());
    } catch {
      /* factory may need mount */
    }
    return;
  }
  if (typeof node === 'string') {
    bindInterp(host, node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) bindInterpTree(host, item);
  }
}

function resolveInterpChild(child: ReactNode): ReactNode {
  return typeof child === 'string' && hasInterpMarks(child)
    ? resolveInterpString(child)
    : child;
}

class ButtonBuilder extends FiboBuilder {
  private _text: string | (() => string) = '';
  private _live: LiveSlot | null = null;
  private _variant: ExtendedButtonVariant = 'elevated';
  private _size: ButtonSize = 'md';
  private _onPress?: () => void;
  private _onHover?: () => void;
  private _disabled: boolean = false;
  private _icon?: ReactNode;
  private _shape: ButtonShape = 'default';
  private _shadow: 'none' | 'soft' = 'none';
  private _tone: ButtonTone = 'default';
  private _motion: ButtonMotion = 'default';
  private _expand = false;
  private _htmlType: HtmlButtonType = 'button';
  private _htmlTypeExplicit = false;

  constructor(text: string | (() => string) = '') {
    super();
    this.text(text);
  }

  text(value: string | (() => string)): this {
    this._text = value;
    if (typeof value === 'function') {
      this._live = null;
      this.observer();
    } else {
      this._live = allocLiveSlot(value);
      bindInterp(this, value);
    }
    return this;
  }

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  variant(variant: ExtendedButtonVariant): this {
    this._variant = variant;
    return this;
  }

  clean(): this {
    this._variant = 'raw';
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

  onHover(handler: () => void): this {
    this._onHover = handler;
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

  tone(value: ButtonTone): this {
    this._tone = value;
    return this;
  }

  motion(value: ButtonMotion): this {
    this._motion = value;
    return this;
  }

  expand(value: boolean = true): this {
    this._expand = value;
    return this;
  }

  /**
   * HTML button type. `.type('submit')` is what people write inside a Form.
   * React still reads `element.type` as the component: a string sets this,
   * a props object renders the button.
   */
  type(value: 'button' | 'submit' | 'reset'): this {
    this._htmlType = asHtmlButtonType(value);
    this._htmlTypeExplicit = true;
    return this;
  }

  htmlType(value: 'button' | 'submit' | 'reset'): this {
    this._htmlType = asHtmlButtonType(value);
    this._htmlTypeExplicit = true;
    return this;
  }

  /** Shortcut for `.htmlType('submit')` inside a `Form`. */
  submit(): this {
    this._htmlType = 'submit';
    this._htmlTypeExplicit = true;
    return this;
  }

  /** Shortcut for `.htmlType('reset')`. */
  reset(): this {
    this._htmlType = 'reset';
    this._htmlTypeExplicit = true;
    return this;
  }

  private resolvedHtmlType(): HtmlButtonType {
    if (this._htmlTypeExplicit) return asHtmlButtonType(this._htmlType);
    return asHtmlButtonType(this._props?.type ?? this._htmlType);
  }

  build(): ReactElement {
    const builderClasses = this.getClassName();
    const rawText = typeof this._text === 'function' ? this._text() : this._text;
    const finalText =
      typeof rawText === 'string' && hasInterpMarks(rawText)
        ? resolveInterpString(rawText)
        : rawText;

    const props = {
      text: finalText,
      variant: this._variant,
      size: this._size,
      onPress: this._onPress,
      onHover: this._onHover,
      disabled: this._disabled,
      icon: this._icon,
      shape: this._shape,
      shadow: this._shadow,
      tone: this._tone,
      motion: this._motion,
      expand: this._expand,
      className: builderClasses,
      style: this.getStyle(),
      children: this.processChildren().map(resolveInterpChild),
      ...this._props,
      type: this.resolvedHtmlType(),
      bare: this.isReset(),
    };

    if (this._live) {
      const slot = this._live;
      (props as { liveRef?: (node: HTMLElement | null) => void }).liveRef = (node) => {
        slot.node = node;
      };
    }

    return React.createElement(ButtonInner, props);
  }
}

export const Button = createBuilder(ButtonBuilder);

export interface ButtonProps extends BaseProps {
  text: string;
  variant?: ExtendedButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  onHover?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  shape?: ButtonShape;
  shadow?: 'none' | 'soft';
  tone?: ButtonTone;
  motion?: ButtonMotion;
  expand?: boolean;
}
