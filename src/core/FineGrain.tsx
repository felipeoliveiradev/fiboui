'use client';

import React, { CSSProperties, useEffect, useRef } from 'react';
import { BindableSignal, Effect, runInScope } from './state';
import { useReactivityScope } from './ReactivityRoot';

interface FineGrainTextProps {
  compute: () => string;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  style?: CSSProperties;
}

function toText(value: unknown): string {
  return value == null ? '' : String(value);
}

function assignRef(ref: unknown, node: HTMLElement | null): void {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  if (ref && typeof ref === 'object' && 'current' in ref) {
    (ref as { current: HTMLElement | null }).current = node;
  }
}

/** Updates `textContent` in place — the host element is not remounted. */
export function FineGrainText({
  compute,
  as = 'span',
  className,
  style,
  ...rest
}: FineGrainTextProps & Record<string, unknown>) {
  const scope = useReactivityScope();
  const nodeRef = useRef<HTMLElement | null>(null);
  const initial = toText(compute());

  useEffect(() => {
    return runInScope(scope, () => {
      const effect = new Effect(() => {
        const next = toText(compute());
        if (nodeRef.current && nodeRef.current.textContent !== next) {
          nodeRef.current.textContent = next;
        }
      });
      return () => effect.dispose();
    });
  }, [compute, scope]);

  const {
    dangerouslySetInnerHTML: _html,
    ref: userRef,
    ...safeRest
  } = rest;

  const setRef = (node: HTMLElement | null) => {
    nodeRef.current = node;
    assignRef(userRef, node);
  };

  return React.createElement(as, { className, style, ...safeRest, ref: setRef }, initial);
}

/** Bind a signal to a live text node without a React state subscription. */
export function bindText(signal: BindableSignal<unknown>, as?: keyof HTMLElementTagNameMap) {
  return React.createElement(FineGrainText, {
    compute: () => String(signal.value),
    as,
  });
}
