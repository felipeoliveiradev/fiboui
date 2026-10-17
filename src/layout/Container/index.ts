import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { normalizeCssProperties, normalizeCssValue, parseBoxShorthand } from '../../core/cssFluent';
import { _styleManager } from '../../core/styleManager';

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

function hostNodes(fromBuilder: ReactNode[], propsChildren: unknown): ReactNode[] {
  const source = propsChildren !== undefined ? propsChildren : fromBuilder;
  if (source == null) return [];
  if (Array.isArray(source)) return source as ReactNode[];
  return [source as ReactNode];
}

/** Hosts that cannot safely take Container children (XSS / void / document chrome). */
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

type PadSide = 'top' | 'right' | 'bottom' | 'left';
type UserPad = Partial<Record<PadSide, string>>;

function hasFiboDecl(classNames: string[], kebab: string): boolean {
  const prefix = `fibo-${kebab}-`;
  return classNames.some((c) => c.startsWith(prefix));
}

function cssLen(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : String(value);
}

function wrapSafeArea(user: string | number | undefined, side: PadSide): string {
  const env = `env(safe-area-inset-${side}, 0px)`;
  if (user == null || user === '') return env;
  const css = cssLen(user);
  if (css.includes('safe-area-inset')) return css;
  return `max(${css}, ${env})`;
}

/** Expand leftover padding/margin shorthands so longhands / box axes are not reset. */
function expandPaintShorthands(
  style: CSSProperties,
  boxLonghands: ReadonlySet<string>,
): CSSProperties {
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
      record[leftKey] != null ||
      boxLonghands.has(`${kind}-top`) ||
      boxLonghands.has(`${kind}-right`) ||
      boxLonghands.has(`${kind}-bottom`) ||
      boxLonghands.has(`${kind}-left`);
    if (!hasLonghand) continue;
    const [top, right, bottom, left] = parseBoxShorthand(String(raw));
    if (record[topKey] == null && !boxLonghands.has(`${kind}-top`)) record[topKey] = top;
    if (record[rightKey] == null && !boxLonghands.has(`${kind}-right`)) record[rightKey] = right;
    if (record[bottomKey] == null && !boxLonghands.has(`${kind}-bottom`)) record[bottomKey] = bottom;
    if (record[leftKey] == null && !boxLonghands.has(`${kind}-left`)) record[leftKey] = left;
    delete record[kind];
  }
  return next;
}

function applySafeAreaPadding(style: CSSProperties, userPad: UserPad): void {
  const record = style as Record<string, string | number | undefined>;
  if (record.padding != null && record.padding !== '') {
    const [top, right, bottom, left] = parseBoxShorthand(String(record.padding));
    if (record.paddingTop == null) record.paddingTop = top;
    if (record.paddingRight == null) record.paddingRight = right;
    if (record.paddingBottom == null) record.paddingBottom = bottom;
    if (record.paddingLeft == null) record.paddingLeft = left;
    delete record.padding;
  }
  if (record.paddingLeft == null && userPad.left != null) record.paddingLeft = userPad.left;
  if (record.paddingRight == null && userPad.right != null) record.paddingRight = userPad.right;
  if (record.paddingTop == null && userPad.top != null) record.paddingTop = userPad.top;
  if (record.paddingBottom == null && userPad.bottom != null) record.paddingBottom = userPad.bottom;
  const hadTop = record.paddingTop != null && record.paddingTop !== '';
  const hadBottom = record.paddingBottom != null && record.paddingBottom !== '';
  record.paddingLeft = wrapSafeArea(record.paddingLeft, 'left');
  record.paddingRight = wrapSafeArea(record.paddingRight, 'right');
  if (hadTop) record.paddingTop = wrapSafeArea(record.paddingTop, 'top');
  if (hadBottom) record.paddingBottom = wrapSafeArea(record.paddingBottom, 'bottom');
}

function applyCenter(
  style: CSSProperties,
  hug: boolean,
  classNames: string[],
  boxLonghands: ReadonlySet<string>,
): void {
  const record = style as Record<string, string | number | undefined>;
  const skipWidth =
    record.width != null ||
    boxLonghands.has('width') ||
    hasFiboDecl(classNames, 'width');
  if (hug) {
    if (!skipWidth) record.width = 'auto';
    return;
  }
  if (!skipWidth) record.width = '100%';
  const hasMarginShorthand = record.margin != null && record.margin !== '';
  const skipLeft =
    hasMarginShorthand ||
    record.marginLeft != null ||
    record.marginInlineStart != null ||
    boxLonghands.has('margin-left') ||
    hasFiboDecl(classNames, 'margin-left');
  const skipRight =
    hasMarginShorthand ||
    record.marginRight != null ||
    record.marginInlineEnd != null ||
    boxLonghands.has('margin-right') ||
    hasFiboDecl(classNames, 'margin-right');
  if (!skipLeft) record.marginLeft = 'auto';
  if (!skipRight) record.marginRight = 'auto';
}

function paintContainerStyle(
  host: CSSProperties,
  extra: CSSProperties | undefined,
  propsMaxWidth: unknown,
  hug: boolean,
  classNames: string[],
  boxLonghands: ReadonlySet<string>,
  userPad: UserPad,
): CSSProperties {
  const merged = extra
    ? normalizeCssProperties({ ...host, ...extra })
    : { ...host };
  const next = expandPaintShorthands(merged, boxLonghands);
  const fluentMax =
    next.maxWidth != null ||
    hasFiboDecl(classNames, 'max-width') ||
    boxLonghands.has('max-width');
  if (!fluentMax && propsMaxWidth != null && propsMaxWidth !== '') {
    next.maxWidth = normalizeCssValue('maxWidth', propsMaxWidth);
  }
  applyCenter(next, hug, classNames, boxLonghands);
  applySafeAreaPadding(next, userPad);
  return next;
}

class ContainerBuilder extends FiboBuilder {
  private _userPad: UserPad = {};

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

  padding(value: string | number): this {
    const v = normalizeCssValue('padding', value);
    const [top, right, bottom, left] = parseBoxShorthand(v);
    if (!this._boxLonghands.has('padding-top')) this._userPad.top = top;
    if (!this._boxLonghands.has('padding-right')) this._userPad.right = right;
    if (!this._boxLonghands.has('padding-bottom')) this._userPad.bottom = bottom;
    if (!this._boxLonghands.has('padding-left')) this._userPad.left = left;
    return super.padding(value);
  }

  paddingHorizontal(value: string | number): this {
    const v = normalizeCssValue('paddingLeft', value);
    this._userPad.left = v;
    this._userPad.right = v;
    return super.paddingHorizontal(value);
  }

  paddingVertical(value: string | number): this {
    const v = normalizeCssValue('paddingTop', value);
    this._userPad.top = v;
    this._userPad.bottom = v;
    return super.paddingVertical(value);
  }

  paddingLeft(value: string | number): this {
    const v = normalizeCssValue('paddingLeft', value);
    this._userPad.left = v;
    this._boxLonghands.add('padding-left');
    this.addClassName(_styleManager.register('padding-left', v));
    return this;
  }

  paddingRight(value: string | number): this {
    const v = normalizeCssValue('paddingRight', value);
    this._userPad.right = v;
    this._boxLonghands.add('padding-right');
    this.addClassName(_styleManager.register('padding-right', v));
    return this;
  }

  paddingTop(value: string | number): this {
    const v = normalizeCssValue('paddingTop', value);
    this._userPad.top = v;
    this._boxLonghands.add('padding-top');
    this.addClassName(_styleManager.register('padding-top', v));
    return this;
  }

  paddingBottom(value: string | number): this {
    const v = normalizeCssValue('paddingBottom', value);
    this._userPad.bottom = v;
    this._boxLonghands.add('padding-bottom');
    this.addClassName(_styleManager.register('padding-bottom', v));
    return this;
  }

  build(): ReactElement {
    const {
      children: propsChildren,
      className: extraClass,
      style: propsStyle,
      as,
      tag,
      dangerouslySetInnerHTML: _html,
      maxWidth: propsMaxWidth,
      ...dom
    } = this._props;

    const hug = this.isHug();
    const nodes = hostNodes(this.processChildren(), propsChildren).map(resolveInterpChild);
    const style = paintContainerStyle(
      this.getStyle(),
      propsStyle,
      propsMaxWidth,
      hug,
      this._classNames,
      this._boxLonghands,
      this._userPad,
    );
    const safeClasses = [
      _styleManager.register('padding-left', String(style.paddingLeft ?? wrapSafeArea(undefined, 'left'))),
      _styleManager.register('padding-right', String(style.paddingRight ?? wrapSafeArea(undefined, 'right'))),
    ];
    if (style.paddingTop != null && String(style.paddingTop).includes('safe-area-inset')) {
      safeClasses.push(_styleManager.register('padding-top', String(style.paddingTop)));
    }
    if (style.paddingBottom != null && String(style.paddingBottom).includes('safe-area-inset')) {
      safeClasses.push(_styleManager.register('padding-bottom', String(style.paddingBottom)));
    }
    const className = [
      'fibo-container',
      hug ? 'w-auto' : 'w-full mx-auto',
      this.getClassName(),
      extraClass,
      ...safeClasses,
    ]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const hostTag = resolveHostTag(as ?? tag);

    return React.createElement(
      hostTag,
      {
        ...dom,
        className,
        style,
      },
      ...nodes
    );
  }
}

export const Container = createBuilder(ContainerBuilder);

export interface ContainerProps extends ChildrenProps {
  maxWidth?: string | number;
}
