import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function resolveInterp(text: string | undefined): string | undefined {
  if (typeof text !== 'string') return text;
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
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

function resolveSlot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  if (typeof node === 'string') return resolveInterp(node) ?? node;
  return buildChild(node);
}

const ACCENT_COLORS: Record<string, string> = {
  green: 'var(--fibo-success, #22c55e)',
  orange: 'var(--fibo-warning, #f97316)',
  red: 'var(--fibo-error, #ef4444)',
  blue: 'var(--fibo-info, #3b82f6)',
  purple: 'var(--fibo-tertiary, #a855f7)',
};

const FORBIDDEN_HOST = new Set(['script', 'iframe', 'object', 'embed', 'link', 'style']);

function hostTag(as: unknown): string {
  if (typeof as !== 'string') return 'article';
  const tag = as.trim().toLowerCase();
  if (!tag || !/^[a-z][a-z0-9]*$/.test(tag) || FORBIDDEN_HOST.has(tag)) {
    return 'article';
  }
  return tag;
}

const CardInner = React.memo((props: any) => {
    const {
      text,
      subtitle,
      number,
      accentColor,
      className,
      style,
      children,
      header,
      footer,
      as,
      ...rest
    } = props;
    delete rest.color;
    const nodes = Array.isArray(children) ? children : children == null ? [] : [children];
    const restOnClick = rest.onClick;
    const restOnKeyDown = rest.onKeyDown;
    const isPressable = typeof restOnClick === 'function';
    const hostClass = [
      'fibo-card',
      'rounded-[24px]',
      'transition-shadow',
      'duration-300',
      'p-4',
      isPressable ? 'fibo-clickable' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const hostStyle = {
      ...(accentColor
        ? {
            borderLeftWidth: 4,
            borderLeftStyle: 'solid' as const,
            borderLeftColor: accentColor,
          }
        : {}),
      ...style,
    };

    const headerNode = resolveSlot(header);
    const footerNode = resolveSlot(footer);

    return React.createElement(
      hostTag(as),
      {
        ...rest,
        className: hostClass,
        style: hostStyle,
        onClick: restOnClick,
        ...(isPressable
          ? {
              role: 'button' as const,
              tabIndex: rest.tabIndex ?? 0,
              onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
                restOnKeyDown?.(e);
                if (e.defaultPrevented) return;
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              },
            }
          : null),
      },
      headerNode
        ? React.createElement('header', { className: 'fibo-card-header' }, headerNode)
        : null,
      React.createElement(
        'div',
        { className: 'flex flex-col gap-2' },
        text &&
          React.createElement(
            'h3',
            {
              className: 'font-semibold text-[var(--fibo-on-surface-variant)] text-sm uppercase tracking-wide',
            },
            text
          ),
        number &&
          React.createElement(
            'p',
            {
              className: 'font-bold text-[var(--fibo-on-surface)] text-3xl',
            },
            number
          ),
        subtitle &&
          React.createElement(
            'p',
            {
              className: 'text-[var(--fibo-on-surface-variant)] text-xs',
            },
            subtitle
          ),
        ...nodes
      ),
      footerNode
        ? React.createElement('footer', { className: 'fibo-card-footer' }, footerNode)
        : null
    );
});

class CardBuilder extends FiboBuilder {
  private _text: string = '';
  private _subtitle?: string;
  private _number?: string;
  private _color?: string;
  private _header?: FiboChild;
  private _footer?: FiboChild;
  private _as?: string;

  text(value: string): this {
    this._text = value;
    bindInterp(this, value);
    return this;
  }

  /** Alias of `.text()` — same slot as Banner/ListTile/Alert `.title()`. */
  title(value: string): this {
    return this.text(value);
  }

  subtitle(value: string): this {
    this._subtitle = value;
    bindInterp(this, value);
    return this;
  }

  number(value: string): this {
    this._number = value;
    bindInterp(this, value);
    return this;
  }

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  header(node: FiboChild): this {
    this._header = node;
    bindInterpTree(this, node);
    return this;
  }

  footer(node: FiboChild): this {
    this._footer = node;
    bindInterpTree(this, node);
    return this;
  }

  as(tag: keyof HTMLElementTagNameMap | string): this {
    this._as = String(tag);
    return this;
  }

  props(value: Record<string, any>): this {
    if (value) {
      bindInterp(this, value.text);
      bindInterp(this, value.title);
      bindInterp(this, value.subtitle);
      bindInterp(this, value.number);
      bindInterpTree(this, value.header);
      bindInterpTree(this, value.footer);
      if ('children' in value) bindInterpTree(this, value.children);
    }
    return super.props(value);
  }

  color(value: string): this {
    this._color = value;
    return this;
  }

  build(): ReactElement {
    const accentColor = this._color ? ACCENT_COLORS[this._color] : undefined;
    const {
      className: extraClass,
      text: propsText,
      title: propsTitle,
      subtitle: propsSubtitle,
      number: propsNumber,
      header: propsHeader,
      footer: propsFooter,
      as: propsAs,
      ...dom
    } = this._props;
    const className = [...this._classNames, extraClass].filter(Boolean).join(' ');

    const props = {
        text: resolveInterp(propsText ?? propsTitle ?? this._text),
        subtitle: resolveInterp(propsSubtitle ?? this._subtitle),
        number: resolveInterp(propsNumber ?? this._number),
        header: resolveSlot(this._header ?? propsHeader),
        footer: resolveSlot(this._footer ?? propsFooter),
        as: this._as ?? propsAs,
        accentColor,
        style: this.getStyle(),
        children: this.processChildren().map(resolveInterpChild),
        ...dom,
        className,
    };

    return React.createElement(CardInner, props);
  }
}

export const Card = createBuilder(CardBuilder);

export interface CardProps extends BaseProps {
  text: string;
  title?: string;
  subtitle?: string;
  number?: string;
  color?: string;
  header?: FiboChild;
  footer?: FiboChild;
  as?: keyof HTMLElementTagNameMap | string;
}
