'use client';

import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

export interface WizardStep {
  title: ReactNode;
  child: unknown;
}

interface WizardInnerProps {
  steps: WizardStep[];
  index: number;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

function WizardInner({ steps, index, onChange, className, style, ...rest }: WizardInnerProps) {
  const last = Math.max(0, steps.length - 1);
  const [cursor, setCursor] = useState(() => Math.min(Math.max(0, index), last));
  const current = Math.min(Math.max(0, cursor), last);
  const step = steps[current];
  const isLast = steps.length === 0 || current >= steps.length - 1;

  const move = (next: number) => {
    const clamped = Math.min(Math.max(0, next), last);
    if (clamped === current) return;
    setCursor(clamped);
    onChange?.(clamped);
  };

  return React.createElement(
    'div',
    {
      ...rest,
      className: ['fibo-wizard', className].filter(Boolean).join(' '),
      style,
    },
    step
      ? React.createElement('div', { key: 'title', className: 'fibo-wizard-title' }, step.title)
      : null,
    step
      ? React.createElement(
          'div',
          { key: 'body', className: 'fibo-wizard-body' },
          buildChild(step.child),
        )
      : null,
    React.createElement(
      'div',
      { key: 'nav', className: 'fibo-wizard-nav', style: { display: 'flex', gap: 8 } },
      current > 0
        ? React.createElement(
            'button',
            {
              type: 'button',
              className: 'fibo-wizard-back',
              onClick: () => move(current - 1),
            },
            'Back',
          )
        : null,
      isLast
        ? null
        : React.createElement(
            'button',
            {
              type: 'button',
              className: 'fibo-wizard-next',
              onClick: () => move(current + 1),
            },
            'Next',
          ),
    ),
  );
}

class WizardBuilder extends FiboBuilder {
  private _steps: WizardStep[] = [];
  private _index = 0;
  private _onChange?: (index: number) => void;

  steps(steps: WizardStep[]): this {
    this._steps = steps;
    return this;
  }

  index(value: number): this {
    this._index = value;
    return this;
  }

  onChange(handler: (index: number) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, children: _ignored, ...rest } = this._props;
    return React.createElement(WizardInner, {
      ...rest,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      steps: this._steps,
      index: this._index,
      onChange: this._onChange,
    });
  }
}

export const Wizard = createBuilder(WizardBuilder);
