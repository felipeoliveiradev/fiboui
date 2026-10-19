import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChildren, TextType } from '../../core/types';
import { FineGrainText } from '../../core/FineGrain';
import { allocLiveSlot, type BindableSignal, type LiveSlot } from '../../core/state';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

/** CSS `display` values accepted by dual `.type()` (HTML typography vs CSS). */
const CSS_DISPLAY = new Set<string>([
  'block',
  'inline',
  'inline-block',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'none',
  'contents',
  'flow-root',
  'list-item',
  'table',
  'table-row',
  'table-cell',
  'table-caption',
]);

/**
 * Theme-aware defaults: CSS vars from `.theme()` / `fibo-theme-*` (SwiftUI Environment /
 * Flutter TextTheme). Fallbacks keep text readable with no theme mounted.
 */
export const TEXT_VARIANT_STYLE: Record<TextType, CSSProperties> = {
  h1: {
    fontSize: 'var(--fibo-text-h1-size, 2.25rem)',
    fontWeight: 'var(--fibo-text-h1-weight, 700)' as unknown as number,
    letterSpacing: 'var(--fibo-text-h1-tracking, -0.025em)',
    lineHeight: 'var(--fibo-text-h1-height, 1.2)',
    color: 'var(--fibo-text-h1-color, inherit)',
  },
  h2: {
    fontSize: 'var(--fibo-text-h2-size, 1.875rem)',
    fontWeight: 'var(--fibo-text-h2-weight, 700)' as unknown as number,
    letterSpacing: 'var(--fibo-text-h2-tracking, -0.025em)',
    lineHeight: 'var(--fibo-text-h2-height, 1.25)',
    color: 'var(--fibo-text-h2-color, inherit)',
  },
  h3: {
    fontSize: 'var(--fibo-text-h3-size, 1.5rem)',
    fontWeight: 'var(--fibo-text-h3-weight, 600)' as unknown as number,
    letterSpacing: 'var(--fibo-text-h3-tracking, -0.02em)',
    lineHeight: 'var(--fibo-text-h3-height, 1.3)',
    color: 'var(--fibo-text-h3-color, inherit)',
  },
  h4: {
    fontSize: 'var(--fibo-text-h4-size, 1.25rem)',
    fontWeight: 'var(--fibo-text-h4-weight, 600)' as unknown as number,
    lineHeight: 'var(--fibo-text-h4-height, 1.35)',
    color: 'var(--fibo-text-h4-color, inherit)',
  },
  h5: {
    fontSize: 'var(--fibo-text-h5-size, 1.125rem)',
    fontWeight: 'var(--fibo-text-h5-weight, 600)' as unknown as number,
    lineHeight: 'var(--fibo-text-h5-height, 1.4)',
    color: 'var(--fibo-text-h5-color, inherit)',
  },
  h6: {
    fontSize: 'var(--fibo-text-h6-size, 1rem)',
    fontWeight: 'var(--fibo-text-h6-weight, 600)' as unknown as number,
    lineHeight: 'var(--fibo-text-h6-height, 1.45)',
    color: 'var(--fibo-text-h6-color, inherit)',
  },
  body: {
    fontSize: 'var(--fibo-text-body-size, 1rem)',
    fontWeight: 'var(--fibo-text-body-weight, 400)' as unknown as number,
    lineHeight: 'var(--fibo-text-body-height, 1.5)',
    color: 'var(--fibo-text-body-color, inherit)',
  },
  caption: {
    fontSize: 'var(--fibo-text-caption-size, 0.875rem)',
    fontWeight: 'var(--fibo-text-caption-weight, 400)' as unknown as number,
    lineHeight: 'var(--fibo-text-caption-height, 1.4)',
    color: 'var(--fibo-text-caption-color, inherit)',
  },
  label: {
    fontSize: 'var(--fibo-text-label-size, 0.875rem)',
    fontWeight: 'var(--fibo-text-label-weight, 500)' as unknown as number,
    letterSpacing: 'var(--fibo-text-label-tracking, 0.01em)',
    lineHeight: 'var(--fibo-text-label-height, 1.4)',
    color: 'var(--fibo-text-label-color, inherit)',
  },
};

const ELEMENT_MAP: Record<TextType, keyof HTMLElementTagNameMap> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  caption: 'span',
  label: 'label',
};

function isTextType(type: unknown): type is TextType {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(TEXT_VARIANT_STYLE, type);
}

function safeTextType(type: unknown): TextType {
  return isTextType(type) ? type : 'body';
}

function textStyle(type: TextType, extra?: CSSProperties): CSSProperties {
  return {
    margin: 0,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    maxWidth: '100%',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    ...TEXT_VARIANT_STYLE[type],
    ...extra,
  };
}

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

function omitDangerous(rest: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!rest || !('dangerouslySetInnerHTML' in rest)) {
    return rest ?? {};
  }
  const { dangerouslySetInnerHTML: _html, ...safe } = rest;
  return safe;
}

function isPropsBag(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return false;
  if (React.isValidElement(value)) return false;
  const o = value as Record<string, unknown>;
  return 'children' in o || 'text' in o || 'className' in o || 'variant' in o || 'type' in o;
}

function toRenderable(value: unknown): ReactNode {
  if (value == null || typeof value === 'boolean') return null;
  if (typeof value === 'string') {
    return hasInterpMarks(value) ? resolveInterpString(value) : value;
  }
  if (typeof value === 'number') return value;
  if (typeof value === 'function') {
    try {
      return toRenderable((value as () => unknown)());
    } catch {
      return null;
    }
  }
  if (React.isValidElement(value)) return value;
  if (Array.isArray(value)) return value.map((item) => toRenderable(item));
  if (typeof value === 'object' && value && 'children' in value && !('$$typeof' in value)) {
    return toRenderable((value as { children: unknown }).children);
  }
  if (typeof (value as { toString?: unknown }).toString === 'function') {
    const s = String(value);
    if (s && s !== '[object Object]') return s;
  }
  return null;
}

function resolveTextContent(text: unknown, children: unknown): ReactNode {
  const fromText = toRenderable(text);
  if (fromText !== null && fromText !== undefined && fromText !== '') return fromText;
  return toRenderable(children);
}

const TextInner = React.memo((props: any) => {
  const { text, type, className, style, children, liveRef, ...rest } = props;
  const safeType = safeTextType(type);
  const tag = ELEMENT_MAP[safeType] || 'p';

  return React.createElement(
    tag,
    {
      className: `fibo-text fibo-text-${safeType} min-w-0 ${className || ''}`,
      style: textStyle(safeType, style),
      ...omitDangerous(rest),
      ...(liveRef ? { ref: liveRef } : null),
    },
    resolveTextContent(text, children)
  );
});

type TextTruncation = 'clip' | 'ellipsis' | 'head' | 'middle' | 'tail';
type TextCase = 'uppercase' | 'lowercase' | 'capitalize' | 'none';

class TextBuilder extends FiboBuilder {
  private _text: string | (() => string) = '';
  private _live: LiveSlot | null = null;
  private _nodes?: ReactNode;
  private _type: TextType = 'body';
  private _lineLimit?: number;
  private _truncation?: TextTruncation;
  private _italic = false;
  private _redacted = false;
  private _bold = false;
  private _underline = false;
  private _strike = false;
  private _textCase?: TextCase;

  constructor(text: string | (() => string) = '') {
    super();
    this.text(text);
  }

  private setMarkedString(value: string): this {
    this._text = () => resolveInterpString(value);
    for (const sig of collectInterpSignals(value)) {
      super.bindSignal(sig);
    }
    this._nodes = undefined;
    return this;
  }

  private setLiteralString(value: string): this {
    if (hasInterpMarks(value)) return this.setMarkedString(value);
    this._text = value;
    this._nodes = undefined;
    this._live = allocLiveSlot(value);
    return this;
  }

  text(value: string | (() => string) | unknown): this {
    if (typeof value === 'function') {
      this._text = value as () => string;
      this._nodes = undefined;
      return this;
    }
    if (typeof value === 'string') {
      return this.setLiteralString(value);
    }
    if (value == null || typeof value === 'boolean') {
      this._text = '';
      this._nodes = undefined;
      return this;
    }
    if (typeof value === 'number' || typeof value === 'bigint') {
      this._text = String(value);
      this._nodes = undefined;
      return this;
    }
    if (React.isValidElement(value) || Array.isArray(value)) {
      this._nodes = value as ReactNode;
      this._text = '';
      return this;
    }
    if (isPropsBag(value)) {
      const bag = value as Record<string, any>;
      const {
        children,
        text: textProp,
        variant,
        type,
        className,
        style,
        ...dom
      } = bag;
      if (Object.keys(dom).length > 0) this.props(dom);
      if (typeof className === 'string') this.className(className);
      if (style && typeof style === 'object') this.style(style);
      if (typeof variant === 'string') this.variant(variant as TextType);
      if (typeof type === 'string') this.type(type as TextType);
      if (textProp != null) return this.text(textProp);
      if (children != null) return this.text(children);
      this._text = '';
      this._nodes = undefined;
      return this;
    }
    if (typeof (value as { toString?: unknown }).toString === 'function') {
      const s = String(value);
      if (s && s !== '[object Object]') return this.setLiteralString(s);
    }
    this._text = '';
    this._nodes = undefined;
    return this;
  }

  /**
   * Dual `.type()`: typography (`h1`…`label`) sets the host tag + `fibo-text-*`.
   * CSS display (`block` / `flex` / …) sets `display` and leaves the tag alone.
   */
  type(type: TextType | string): this {
    if (isTextType(type)) {
      this._type = type;
      return this;
    }
    if (typeof type === 'string' && CSS_DISPLAY.has(type)) {
      this.layoutStyle({ display: type as CSSProperties['display'] });
      return this;
    }
    return this;
  }

  variant(variant: TextType): this {
    if (isTextType(variant)) this._type = variant;
    return this;
  }

  children(children: FiboChildren): this {
    if (typeof children === 'string') {
      return this.text(children);
    }
    bindInterpTree(this, children);
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value && 'children' in value) {
      bindInterpTree(this, value.children);
    }
    return super.props(value);
  }

  nowrap(): this {
    this._classNames.push('whitespace-nowrap');
    return this;
  }

  mono(): this {
    this._classNames.push('font-mono');
    return this;
  }

  muted(): this {
    this._style = { ...this._style, color: '#9a9a9a' };
    return this;
  }

  /**
   * Subscribe an extra signal (or override text with `format`).
   * `$length` / `interp()` already auto-bind their own signals.
   *
   * ```ts
   * Text(`Total: ${todos.$length}`).bindSignal(filter) // also rebuild when filter changes
   * Text().bindSignal(todos, (list) => `Total: ${list.length}`)
   * ```
   */
  bindSignal<T>(
    signal: BindableSignal<T>,
    format?: (value: T) => string
  ): this {
    super.bindSignal(signal);
    if (format) {
      this._text = () => format(signal.value);
      this._nodes = undefined;
    }
    return this;
  }

  /** Clamp to `n` lines (`-webkit-box` + `WebkitLineClamp`). */
  lineLimit(n: number): this {
    if (typeof n === 'number' && Number.isFinite(n)) this._lineLimit = n;
    return this;
  }

  truncation(mode: TextTruncation): this {
    if (
      mode === 'clip' ||
      mode === 'ellipsis' ||
      mode === 'head' ||
      mode === 'middle' ||
      mode === 'tail'
    ) {
      this._truncation = mode;
    }
    return this;
  }

  italic(): this {
    this._italic = true;
    return this;
  }

  bold(): this {
    this._bold = true;
    return this;
  }

  underline(): this {
    this._underline = true;
    return this;
  }

  strikethrough(): this {
    this._strike = true;
    return this;
  }

  /** SwiftUI `redacted`. Hides the glyphs and paints a placeholder bar. */
  redacted(): this {
    this._redacted = true;
    return this;
  }

  textCase(mode: TextCase): this {
    if (
      mode === 'uppercase' ||
      mode === 'lowercase' ||
      mode === 'capitalize' ||
      mode === 'none'
    ) {
      this._textCase = mode;
    }
    return this;
  }

  /** Decorations stored by the methods above, applied onto the text style at build. */
  private textChrome(): { style: CSSProperties; attrs: Record<string, string> } {
    const style: CSSProperties = {};
    const attrs: Record<string, string> = {};

    if (this._redacted) {
      style.color = 'transparent';
      style.background = '#2a2a2e';
      style.borderRadius = '4px';
      style.userSelect = 'none';
      attrs['aria-hidden'] = 'true';
    }
    if (this._bold) style.fontWeight = 700;
    if (this._italic) style.fontStyle = 'italic';
    if (this._underline && this._strike) style.textDecoration = 'underline line-through';
    else if (this._underline) style.textDecoration = 'underline';
    else if (this._strike) style.textDecoration = 'line-through';
    if (this._textCase) style.textTransform = this._textCase;

    if (this._truncation) {
      attrs['data-truncation'] = this._truncation;
      style.overflow = 'hidden';
      if (this._truncation === 'clip') {
        style.textOverflow = 'clip';
      } else {
        style.textOverflow = 'ellipsis';
      }
      if (this._truncation === 'ellipsis' || this._truncation === 'tail') {
        style.whiteSpace = 'nowrap';
      }
    }

    if (typeof this._lineLimit === 'number') {
      style.display = '-webkit-box' as CSSProperties['display'];
      style.WebkitLineClamp = this._lineLimit;
      style.WebkitBoxOrient = 'vertical';
      style.overflow = 'hidden';
    }

    return { style, attrs };
  }

  build(): ReactElement {
    const safeType = safeTextType(this._type);
    const tag = ELEMENT_MAP[safeType] || 'p';
    const rawChildren =
      this._nodes != null
        ? this._nodes
        : this.processChildren();
    const childNodes = Array.isArray(rawChildren)
      ? rawChildren.map(resolveInterpChild)
      : resolveInterpChild(rawChildren as ReactNode);

    const {
      className: extraClass,
      style: extraStyle,
      as: _as,
      compute: _compute,
      type: _typeFromProps,
      text: _textFromProps,
      children: extraChildren,
      dangerouslySetInnerHTML: _html,
      ...hostProps
    } = this._props ?? {};

    const extraClassName = typeof extraClass === 'string' ? extraClass : '';
    const chrome = this.textChrome();
    const passedStyle = {
      ...this.getStyle(),
      ...(extraStyle && typeof extraStyle === 'object' ? extraStyle : null),
      ...chrome.style,
    };
    const mergedStyle = textStyle(safeType, passedStyle);
    const safeHost = omitDangerous(hostProps);

    if (typeof this._text === 'function') {
      const compute = this._text;
      return React.createElement(FineGrainText, {
        ...safeHost,
        ...chrome.attrs,
        compute: () => {
          try {
            const next = compute();
            return next == null ? '' : String(next);
          } catch {
            return '';
          }
        },
        as: tag,
        className: `fibo-text fibo-text-${safeType} min-w-0 ${this.getClassName()} ${extraClassName}`.trim(),
        style: mergedStyle,
      });
    }

    const props: Record<string, unknown> = {
      ...safeHost,
      ...chrome.attrs,
      text: this._text,
      type: safeType,
      className: `${this.getClassName()} ${extraClassName}`.trim(),
      style: passedStyle,
      children: childNodes ?? resolveInterpChild(extraChildren as ReactNode),
    };
    if (this._live) {
      const slot = this._live;
      props.liveRef = (node: HTMLElement | null) => {
        slot.node = node;
      };
    }
    return React.createElement(TextInner, props);
  }
}

export const Text = createBuilder(TextBuilder);

export interface TextProps extends BaseProps {
  text: string;
  type?: TextType;
  variant?: TextType;
}
