import React, { CSSProperties, useEffect, useRef } from 'react';
import { BindableSignal, Effect, runInScope } from './state';
import { useReactivityScope } from './ReactivityRoot';

interface FineGrainTextProps {
  compute: () => string;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  style?: CSSProperties;
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
  const ref = useRef<HTMLElement | null>(null);
  const initial = compute();

  useEffect(() => {
    return runInScope(scope, () => {
      const effect = new Effect(() => {
        const next = compute();
        if (ref.current && ref.current.textContent !== next) {
          ref.current.textContent = next;
        }
      });
      return () => effect.dispose();
    });
  }, [compute, scope]);

  return React.createElement(as, { ref, className, style, ...rest }, initial);
}

/** Bind a signal to a live text node without a React state subscription. */
export function bindText(signal: BindableSignal<unknown>, as?: keyof HTMLElementTagNameMap) {
  return React.createElement(FineGrainText, {
    compute: () => String(signal.value),
    as,
  });
}
