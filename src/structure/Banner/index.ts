import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChildren, StatusType } from '../../core/types';
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

function resolveInterp(text: string | undefined): string | undefined {
  if (typeof text !== 'string') return text;
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
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

function isStatus(value: unknown): value is StatusType {
  return value === 'success' || value === 'warning' || value === 'error' || value === 'info';
}

function resolveStatus(status: unknown, intent?: unknown): StatusType {
  if (isStatus(intent)) return intent;
  return isStatus(status) ? status : 'info';
}

function asNodes(value: unknown): ReactNode[] {
  if (value == null || value === false) return [];
  return Array.isArray(value) ? value : [value as ReactNode];
}

const BannerInner = React.memo((props: any) => {
    const {
      status,
      intent,
      title,
      subtitle,
      className,
      style,
      onClose,
      action,
      children,
      ...rest
    } = props;
    const currentStatus = resolveStatus(status, intent);
    const isAlert = currentStatus === 'error' || currentStatus === 'warning';
    const dismissible = typeof onClose === 'function';
    const accessibleName = [title, subtitle].filter(Boolean).join('. ');
    const hostClass = ['fibo-banner', `fibo-banner-${currentStatus}`, className]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const copy = React.createElement(
      'div',
      { key: 'copy', className: 'flex flex-col gap-1 min-w-0 flex-1' },
      title &&
        React.createElement(
          'h4',
          {
            className: 'font-semibold text-sm uppercase tracking-wide opacity-90',
          },
          title
        ),
      subtitle &&
        React.createElement(
          'p',
          {
            className: 'opacity-80 text-sm',
          },
          subtitle
        )
    );

    const actionNodes = [...asNodes(action), ...asNodes(children)].filter(
      (node) => node != null && node !== false,
    );
    const extras: ReactNode[] = [];
    if (actionNodes.length > 0) {
      extras.push(
        React.createElement(
          'div',
          { key: 'actions', className: 'flex items-center gap-2 shrink-0' },
          actionNodes,
        ),
      );
    }
    if (dismissible) {
      extras.push(
        React.createElement(
          'button',
          {
            key: 'dismiss',
            type: 'button',
            className: 'shrink-0 opacity-80 text-sm leading-none',
            'aria-label': 'Dismiss',
            onClick: (event: React.MouseEvent) => {
              event.stopPropagation();
              onClose();
            },
          },
          '×',
        ),
      );
    }

    const body =
      extras.length > 0
        ? React.createElement('div', { className: 'flex items-start gap-2' }, [copy, ...extras])
        : copy;

    return React.createElement(
      'div',
      {
        ...rest,
        className: hostClass,
        style,
        role: isAlert ? 'alert' : 'status',
        'aria-live': isAlert ? 'assertive' : 'polite',
        'aria-atomic': true,
        'aria-label': rest['aria-label'] || accessibleName || undefined,
      },
      body
    );
});

class BannerBuilder extends FiboBuilder {
  private _status: StatusType = 'info';
  private _title: string = '';
  private _subtitle?: string;

  constructor(title: string = '') {
    super();
    this.title(title);
  }

  status(value: StatusType): this {
    this._status = value;
    return this;
  }

  /** Docs alias: `.status()` is the Banner intent. */
  intent(value: StatusType): this {
    return this.status(value);
  }

  title(value: string): this {
    this._title = value;
    bindInterp(this, value);
    return this;
  }

  subtitle(value: string): this {
    this._subtitle = value;
    bindInterp(this, value);
    return this;
  }

  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  build(): ReactElement {
    const props = {
        status: this._status,
        title: resolveInterp(this._title),
        subtitle: resolveInterp(this._subtitle),
        className: this.getClassName(),
        style: this.getStyle(),
        children: this.processChildren().map(resolveInterpChild),
        ...this._props
    };

    return React.createElement(BannerInner, props);
  }
}

export const Banner = createBuilder(BannerBuilder);

export interface BannerProps extends BaseProps {
  status: StatusType;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  action?: ReactNode;
}
