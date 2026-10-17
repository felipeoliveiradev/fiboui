'use client';

import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

export type SensoryKind = 'success' | 'warning' | 'error';

/** Short Vibration API patterns (ms). Success is a single tap; warning and error stay brief. */
const PATTERNS: Record<SensoryKind, number[]> = {
  success: [15],
  warning: [20, 40, 20],
  error: [30, 50, 30],
};

interface SensoryFeedbackInnerProps {
  kind: SensoryKind;
  label: string;
  onTrigger?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function vibrateIfAvailable(pattern: number[]): void {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const vibrate = nav?.vibrate;
  if (typeof vibrate !== 'function') return;
  vibrate.call(nav, pattern);
}

const SensoryFeedbackInner = React.memo((props: SensoryFeedbackInnerProps) => {
  const { kind, label, onTrigger, className, style } = props;

  const handleClick = () => {
    try {
      vibrateIfAvailable(PATTERNS[kind]);
    } catch {
      /* Missing or rejected haptics must not block the trigger. */
    }
    onTrigger?.();
  };

  return React.createElement(
    'button',
    {
      type: 'button',
      className,
      style,
      'data-kind': kind,
      onClick: handleClick,
    },
    label
  );
});

class SensoryFeedbackBuilder extends FiboBuilder {
  private _kind: SensoryKind = 'success';
  private _onTrigger?: () => void;
  private _label = '';

  kind(value: SensoryKind): this {
    this._kind = value;
    return this;
  }

  onTrigger(handler: () => void): this {
    this._onTrigger = handler;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  build(): ReactElement {
    const kindClass = `fibo-sensory-${this._kind}`;
    const className = ['fibo-sensory', kindClass, this.getClassName()].filter(Boolean).join(' ');
    return React.createElement(SensoryFeedbackInner, {
      kind: this._kind,
      label: this._label,
      onTrigger: this._onTrigger,
      className,
      style: this.getStyle(),
    });
  }
}

export const SensoryFeedback = createBuilder(SensoryFeedbackBuilder);
