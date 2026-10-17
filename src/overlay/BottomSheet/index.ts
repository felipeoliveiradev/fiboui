import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';

export type SheetDetent = 'medium' | 'large';

const DETENT_MAX: Record<SheetDetent, string> = {
  medium: '50vh',
  large: '90vh',
};

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class BottomSheetBuilder extends FiboBuilder {
  private _open = false;
  private _title?: string;
  private _child?: FiboChild;
  private _onClose?: () => void;
  private _detents: SheetDetent[] = ['medium', 'large'];
  private _detent: SheetDetent = 'medium';

  open(value = true): this {
    this._open = value;
    return this;
  }

  title(value: string): this {
    this._title = value;
    return this;
  }

  detents(values: SheetDetent[]): this {
    this._detents = values;
    return this;
  }

  detent(value: SheetDetent): this {
    this._detent = value;
    return this;
  }

  child(node: FiboChild): this {
    this._child = node;
    return this;
  }

  onClose(handler: () => void): this {
    this._onClose = handler;
    return this;
  }

  build(): ReactElement {
    if (!this._open) return null as unknown as ReactElement;

    const active = this._detents.includes(this._detent) ? this._detent : this._detents[0] ?? 'medium';
    const maxHeight = DETENT_MAX[active] ?? DETENT_MAX.medium;

    const { className: extraClass, style: extraStyle, children: _children, ...rest } = this._props;
    const className = ['fibo-bottom-sheet', this.getClassName(), extraClass].filter(Boolean).join(' ');

    const close = () => {
      this._onClose?.();
    };

    return React.createElement(
      'div',
      { className: 'fibo-bottom-sheet-root', style: { position: 'fixed', inset: 0 } },
      React.createElement('div', {
        key: 'backdrop',
        className: 'fibo-bottom-sheet-backdrop',
        style: { position: 'fixed', inset: 0 },
        onClick: close,
      }),
      React.createElement(
        'div',
        {
          ...rest,
          key: 'panel',
          role: 'dialog',
          'aria-modal': true,
          className,
          style: {
            ...this.getStyle(),
            ...(extraStyle as object),
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight,
            background: 'var(--fibo-surface, #fff)',
          },
        },
        this._title ? React.createElement('h2', { key: 'title' }, this._title) : null,
        slot(this._child),
      ),
    );
  }
}

export const BottomSheet = createBuilder(BottomSheetBuilder);

export interface BottomSheetProps extends BaseProps {
  open?: boolean;
  title?: string;
  detents?: SheetDetent[];
  detent?: SheetDetent;
  child?: FiboChild;
  onClose?: () => void;
}
