import React, { CSSProperties, ReactNode } from 'react';

interface FineGrainTextProps {
  compute?: () => string;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

function toText(value: unknown): string {
  return value == null ? '' : String(value);
}

/** RSC: same host tag as the client island so hydration matches. */
export function FineGrainText({
  compute,
  as = 'span',
  className,
  style,
  children,
  ...rest
}: FineGrainTextProps & Record<string, unknown>) {
  const { dangerouslySetInnerHTML: _html, ref: _ref, ...safeRest } = rest;
  const text = typeof compute === 'function' ? toText(compute()) : children;
  return React.createElement(as, { className, style, ...safeRest }, text as ReactNode);
}

export function bindText(signal: { readonly value: unknown }, as?: keyof HTMLElementTagNameMap) {
  return React.createElement(FineGrainText, {
    compute: () => String(signal.value),
    as,
  });
}
