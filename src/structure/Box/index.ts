import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { normalizeCssProperties, parseBoxShorthand } from '../../core/cssFluent';

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

function toChildList(value: unknown): ReactNode[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value as ReactNode];
}

/** Hosts that cannot safely take Box children (XSS / void / document chrome). */
const BLOCKED_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'style',
  'html',
  'head',
  'body',
  'frameset',
  'frame',
  'applet',
  'template',
  'noscript',
  'foreignobject',
  'area',
  'br',
  'col',
  'hr',
  'img',
  'input',
  'param',
  'source',
  'track',
  'wbr',
]);

const HOST_TAG_RE = /^[a-z][a-z0-9]*$/;

function resolveHostTag(value: unknown): keyof HTMLElementTagNameMap {
  if (typeof value !== 'string') return 'div';
  const tag = value.trim().toLowerCase();
  if (!HOST_TAG_RE.test(tag) || BLOCKED_TAGS.has(tag)) return 'div';
  return tag as keyof HTMLElementTagNameMap;
}

function expandOverflow(style: CSSProperties): void {
  const record = style as Record<string, unknown>;
  const raw = record.overflow;
  if (raw == null || raw === '') return;
  const parts = String(raw).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    delete record.overflow;
    return;
  }
  const x = parts[0];
  const y = parts[1] ?? parts[0];
  if (record.overflowX == null) record.overflowX = x;
  if (record.overflowY == null) record.overflowY = y;
  delete record.overflow;
}

/** Expand leftover padding/margin/overflow shorthands so longhands are not reset. */
function expandPaintShorthands(style: CSSProperties): CSSProperties {
  const next: CSSProperties = { ...style };
  const record = next as Record<string, string | number | undefined>;
  for (const kind of ['padding', 'margin'] as const) {
    const raw = record[kind];
    if (raw == null || raw === '') continue;
    const topKey = `${kind}Top`;
    const rightKey = `${kind}Right`;
    const bottomKey = `${kind}Bottom`;
    const leftKey = `${kind}Left`;
    const hasLonghand =
      record[topKey] != null ||
      record[rightKey] != null ||
      record[bottomKey] != null ||
      record[leftKey] != null;
    if (!hasLonghand) continue;
    const [top, right, bottom, left] = parseBoxShorthand(String(raw));
    if (record[topKey] == null) record[topKey] = top;
    if (record[rightKey] == null) record[rightKey] = right;
    if (record[bottomKey] == null) record[bottomKey] = bottom;
    if (record[leftKey] == null) record[leftKey] = left;
    delete record[kind];
  }
  expandOverflow(next);
  return next;
}

function paintStyle(host: CSSProperties, extra?: CSSProperties): CSSProperties {
  const merged = extra
    ? normalizeCssProperties({ ...host, ...extra })
    : { ...host };
  return expandPaintShorthands(merged);
}

const BoxInner = React.memo((props: any) => {
  const {
    className,
    style,
    children,
    as,
    tag,
    dangerouslySetInnerHTML: _html,
    onClick,
    role,
    tabIndex,
    ...rest
  } = props;
  const nodes = toChildList(children).map(resolveInterpChild);
  const hostTag = resolveHostTag(as ?? tag);
  const clickable = typeof onClick === 'function';
  return React.createElement(
    hostTag,
    {
      style: expandPaintShorthands(style || {}),
      ...rest,
      className,
      onClick,
      role: role ?? (clickable ? 'button' : undefined),
      tabIndex: tabIndex ?? (clickable ? 0 : undefined),
    },
    ...nodes
  );
});

class BoxBuilder extends FiboBuilder {
  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value && 'children' in value) {
      bindInterpTree(this, value.children);
    }
    return super.props(value);
  }

  build(): ReactElement {
    const classes = ['fibo-box', 'min-w-0', ...this._classNames];

    const {
      className: extraClass,
      style: propsStyle,
      children: propsChildren,
      as,
      tag,
      dangerouslySetInnerHTML: _html,
      ...dom
    } = this._props;

    const fromBuilder = this.processChildren();
    const source = propsChildren !== undefined ? propsChildren : fromBuilder;
    const children = toChildList(source).map(resolveInterpChild);
    const className = [...classes, extraClass].filter(Boolean).join(' ');
    const style = paintStyle(this.getStyle(), propsStyle);

    return React.createElement(BoxInner, {
      style,
      children,
      as,
      tag,
      ...dom,
      className,
    });
  }
}

export const Box = createBuilder(BoxBuilder);

export interface BoxProps extends ChildrenProps {}
