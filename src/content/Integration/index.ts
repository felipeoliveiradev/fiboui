import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl, isSafeOpenUrl } from '../../core/safeUrl';
import { BaseProps } from '../../core/types';

/** Cross-origin embeds. Omits allow-same-origin so a relative src cannot break out. */
const DEFAULT_IFRAME_SANDBOX = 'allow-scripts allow-popups allow-forms';

function isIframeType(type: unknown): boolean {
  return typeof type === 'string' && type.toLowerCase() === 'iframe';
}

/** http(s), protocol-relative, path, or any scheme — not a tag name like "iframe"/"script". */
function isUrlSource(value: string): boolean {
  const t = value.trim();
  if (!t || isIframeType(t)) return false;
  if (isDangerousUrl(t)) return true;
  if (/^(https?:)?\/\//i.test(t)) return true;
  if (t.startsWith('/') || t.startsWith('./') || t.startsWith('../')) return true;
  return /^[a-z][a-z0-9+.-]*:/i.test(t);
}

/** Empty string overwrites cloneElement — `undefined` would keep javascript: src. */
function safeIframeSrc(src: unknown): string {
  if (typeof src !== 'string') return '';
  const t = src.trim();
  if (!t || isDangerousUrl(t) || !isSafeOpenUrl(t)) return '';
  return t;
}

function safeIframeProps(
  rest: Record<string, unknown>,
  prev: Record<string, unknown> = {},
): Record<string, unknown> {
  const sandbox = rest.sandbox ?? prev.sandbox;
  return {
    ...prev,
    ...rest,
    src: safeIframeSrc(rest.src ?? prev.src),
    // `srcdoc=""` is still "present" and blanks `src` in browsers. `undefined` drops the attr
    // on createElement and overwrites a cloned javascript: srcdoc so it cannot stick.
    srcdoc: undefined,
    sandbox: typeof sandbox === 'string' ? sandbox : DEFAULT_IFRAME_SANDBOX,
  };
}

const IntegrationInner = React.memo((props: any) => {
  const {
    source: Source,
    className,
    style,
    children,
    ...rest
  } = props;

  if (!Source) return null;

  const childList = children == null || (Array.isArray(children) && children.length === 0)
    ? undefined
    : children;

  const paintIframe = (srcOverride?: unknown) =>
    React.createElement(
      'iframe',
      {
        ...safeIframeProps(srcOverride !== undefined ? { ...rest, src: srcOverride } : rest),
        className,
        style,
      },
      childList,
    );

  if (typeof Source === 'string' && isIframeType(Source)) {
    return paintIframe();
  }

  if (typeof Source === 'string' && isUrlSource(Source)) {
    return paintIframe(rest.src ?? Source);
  }

  if (typeof Source === 'string') {
    return null;
  }

  if (React.isValidElement(Source)) {
    const el = Source as React.ReactElement<any>;
    const prev = (el.props || {}) as Record<string, unknown>;
    const classNameMerged = [className, prev.className].filter(Boolean).join(' ') || undefined;
    const styleMerged = { ...(prev.style as React.CSSProperties | undefined), ...style };
    const clonedProps = isIframeType(el.type)
      ? { ...safeIframeProps(rest, prev), className: classNameMerged, style: styleMerged }
      : { ...rest, className: classNameMerged, style: styleMerged };
    return childList !== undefined
      ? React.cloneElement(el, clonedProps, childList)
      : React.cloneElement(el, clonedProps);
  }

  if (typeof Source !== 'function' && !(typeof Source === 'object' && Source !== null && '$$typeof' in Source)) {
    return null;
  }

  return React.createElement(
    Source,
    {
      ...rest,
      className,
      style,
    },
    childList,
  );
});

class IntegrationBuilder extends FiboBuilder {
  private _source: any;

  constructor(source?: any) {
    super();
    this._source = source;
  }

  source(value: any): this {
    this._source = value;
    return this;
  }

  props(value: any): this {
    this._props = { ...this._props, ...value };
    return this;
  }

  build(): ReactElement {
    const extra = this._props || {};
    const {
      className: propsClassName,
      style: propsStyle,
      children: propsChildren,
      ...restProps
    } = extra;

    const classes = [
      'fibo-integration',
      ...this._classNames,
      typeof propsClassName === 'string' ? propsClassName : '',
    ];
    const className = classes.filter(Boolean).join(' ');
    const style = {
      ...this.getStyle(),
      ...(propsStyle && typeof propsStyle === 'object' && !Array.isArray(propsStyle)
        ? (propsStyle as React.CSSProperties)
        : {}),
    };

    const kids = this.processChildren();
    const children = propsChildren !== undefined
      ? propsChildren
      : (kids.length ? kids : undefined);

    const props = {
      source: this._source,
      className,
      style,
      ...restProps,
      ...(children !== undefined ? { children } : {}),
    };

    return React.createElement(IntegrationInner, props);
  }
}

export const Integration = createBuilder(IntegrationBuilder);

export interface IntegrationProps extends BaseProps {
  source: any;
}
