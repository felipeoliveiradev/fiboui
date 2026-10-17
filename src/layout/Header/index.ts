import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { FiboChild, FiboChildren } from '../../core/types';
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
  if (typeof node === 'string') {
    return hasInterpMarks(node) ? resolveInterpString(node) : node;
  }
  return buildChild(node);
}

function hostChildren(fromBuilder: ReactNode[], propsChildren: unknown): ReactNode[] {
  const source = propsChildren !== undefined ? propsChildren : fromBuilder;
  const raw = source == null ? [] : Array.isArray(source) ? source : [source];
  return raw.map(resolveInterpChild);
}

const HeaderInner = React.memo((props: any) => {
  const {
    height = 64,
    sticky,
    className,
    style,
    children,
    leading,
    trailing,
    title,
    role,
    ...rest
  } = props;
  const nodes = Array.isArray(children) ? children : children == null ? [] : [children];
  const leadingNode = leading == null || leading === false ? null : leading;
  const trailingNode = trailing == null || trailing === false ? null : trailing;
  const titleNode = title == null || title === false ? null : title;

  return React.createElement(
    'header',
    {
      ...rest,
      className: [
        'flex items-center px-6 border-b border-gray-200 bg-white/80 backdrop-blur-md w-full',
        sticky ? 'sticky z-10' : '',
        className || '',
      ]
        .filter(Boolean)
        .join(' '),
      style: { height, minHeight: height, ...style },
      role: role ?? 'banner',
    },
    leadingNode != null
      ? React.createElement(
          'div',
          { key: 'leading', className: 'fibo-header-leading shrink-0 flex items-center' },
          leadingNode
        )
      : null,
    titleNode != null
      ? React.createElement(
          'span',
          { key: 'title', className: 'fibo-header-title flex-1 min-w-0' },
          titleNode
        )
      : null,
    ...nodes,
    trailingNode != null
      ? React.createElement(
          'div',
          { key: 'trailing', className: 'fibo-header-trailing shrink-0 flex items-center' },
          trailingNode
        )
      : null
  );
});

class HeaderBuilder extends FiboBuilder {
  private _height: number | string = 64;
  private _sticky: boolean = false;
  private _stickyTop: number | string = 0;
  private _stickyStamp: string[] = [];
  private _leading?: FiboChild;
  private _trailing?: FiboChild;
  private _title?: string | FiboChild;
  private static unstickSeq = 0;

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value) {
      bindInterpTree(this, value.children);
      bindInterpTree(this, value.leading);
      bindInterpTree(this, value.trailing);
      bindInterpTree(this, value.title);
    }
    return super.props(value);
  }

  leading(node: FiboChild): this {
    this._leading = node;
    bindInterpTree(this, node);
    return this;
  }

  trailing(node: FiboChild): this {
    this._trailing = node;
    bindInterpTree(this, node);
    return this;
  }

  title(value: string | FiboChild): this {
    this._title = value;
    bindInterpTree(this, value);
    return this;
  }

  height(height: number | string): this {
    this._height = height;
    if (this._sticky) this.syncStickyOffset();
    return this;
  }

  sticky(enable: boolean | number | string = true): this {
    if (enable === false) {
      if (this._sticky) {
        this.dropStickyStamp();
        // registerRoot caches by value; pad so a later 0px still wins the cascade.
        HeaderBuilder.unstickSeq += 1;
        this.publishStickyOffset(`0px${' '.repeat(HeaderBuilder.unstickSeq)}`);
      }
      this._sticky = false;
      return this;
    }
    this._sticky = true;
    this._stickyTop = enable === true ? 0 : enable;
    this.dropStickyStamp();
    const before = new Set(this._classNames);
    super.sticky(this._stickyTop);
    this._stickyStamp = this._classNames.filter((name) => !before.has(name));
    this.syncStickyOffset();
    return this;
  }

  private dropStickyStamp(): void {
    if (!this._stickyStamp.length) return;
    const drop = new Set(this._stickyStamp);
    this._classNames = this._classNames.filter((name) => !drop.has(name));
    this._stickyStamp = [];
  }

  private syncStickyOffset(): void {
    const top = this._stickyTop;
    if (typeof top === 'number' && typeof this._height === 'number') {
      this.publishStickyOffset(top + this._height);
      return;
    }
    if (top === 0 || top === '0' || top === '0px') {
      this.publishStickyOffset(this._height);
      return;
    }
    const topCss = typeof top === 'number' ? `${top}px` : top;
    const heightCss = typeof this._height === 'number' ? `${this._height}px` : this._height;
    this.publishStickyOffset(`calc(${topCss} + ${heightCss})`);
  }

  build(): ReactElement {
    const {
      className: extraClass,
      children: propsChildren,
      style: extraStyle,
      leading: propsLeading,
      trailing: propsTrailing,
      title: propsTitle,
      ...rest
    } = this._props;
    const className = [this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle();

    return React.createElement(HeaderInner, {
      ...rest,
      height: this._height,
      sticky: this._sticky,
      className,
      style,
      leading: resolveSlot(this._leading ?? propsLeading),
      trailing: resolveSlot(this._trailing ?? propsTrailing),
      title: resolveSlot(this._title ?? propsTitle),
      children: hostChildren(this.processChildren(), propsChildren),
    });
  }
}

export const Header = createBuilder(HeaderBuilder);
