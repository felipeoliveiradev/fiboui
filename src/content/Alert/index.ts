import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, StatusType } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { Icons } from '../../core/icons';

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

const INTENT_STYLES: Record<StatusType, string> = {
    info: 'bg-blue-500 text-white',
    success: 'bg-emerald-500 text-white',
    warning: 'bg-orange-400 text-white',
    error: 'bg-rose-500 text-white'
};

const ICON_BG_STYLES: Record<StatusType, string> = {
    info: 'bg-blue-600',
    success: 'bg-emerald-600',
    warning: 'bg-orange-500',
    error: 'bg-rose-600'
};

function resolveIntent(intent: unknown): StatusType {
    return intent === 'success' || intent === 'warning' || intent === 'error' || intent === 'info'
        ? intent
        : 'info';
}

function warningGlyph(): ReactElement {
    return React.createElement(
        'svg',
        {
            width: 20,
            height: 20,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            'aria-hidden': true,
            focusable: 'false',
        },
        [
            React.createElement('path', {
                key: 'tri',
                d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
            }),
            React.createElement('line', { key: 'stem', x1: '12', y1: '9', x2: '12', y2: '13' }),
            React.createElement('line', { key: 'dot', x1: '12', y1: '17', x2: '12.01', y2: '17' }),
        ],
    );
}

function alertIcon(intent: StatusType): ReactElement {
    const fallback = React.createElement('span', { 'aria-hidden': true }, '?');
    const mapped: Record<StatusType, ReactElement | undefined> = {
        info: Icons.Info,
        success: Icons.Check,
        warning: warningGlyph(),
        error: Icons.Close,
    };
    const icon = mapped[intent] || fallback;
    if (!React.isValidElement(icon)) return fallback;
    return React.cloneElement(icon as ReactElement<any>, {
        width: 20,
        height: 20,
        strokeWidth: 3,
        'aria-hidden': true,
    });
}

function dismissIcon(): ReactElement {
    const icon = Icons.Close;
    if (!React.isValidElement(icon)) {
        return React.createElement('span', { 'aria-hidden': true }, '×');
    }
    return React.cloneElement(icon as ReactElement<any>, {
        width: 16,
        height: 16,
        strokeWidth: 2.5,
        'aria-hidden': true,
    });
}

const AlertInner = React.memo((props: any) => {
    const { title, description, intent = 'info', className, style, onClose, ...rest } = props;
    const currentIntent = resolveIntent(intent);
    const isAlert = currentIntent === 'error' || currentIntent === 'warning';
    const dismissible = typeof onClose === 'function';

    const baseClass = `fibo-alert relative overflow-hidden flex items-start gap-4 p-5 rounded-3xl shadow-lg border-none ${INTENT_STYLES[currentIntent]}`;

    const accessibleName = [title, description].filter(Boolean).join('. ');

    const nodes: React.ReactNode[] = [

        React.createElement('div', {
            key: 'blob1',
            className: 'absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white opacity-10 pointer-events-none',
            'aria-hidden': true,
        }),
        React.createElement('div', {
            key: 'blob2',
            className: 'absolute bottom-[-10px] left-10 w-12 h-12 rounded-full bg-black opacity-5 pointer-events-none',
            'aria-hidden': true,
        }),
        React.createElement('div', {
            key: 'blob3',
            className: 'absolute top-10 right-20 w-8 h-8 rounded-full bg-white opacity-10 pointer-events-none',
            'aria-hidden': true,
        }),

        React.createElement('div', {
            key: 'icon-wrapper',
            className: `relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${ICON_BG_STYLES[currentIntent]}`
        }, alertIcon(currentIntent)),

        React.createElement('div', { key: 'content', className: 'relative z-10 flex flex-col gap-1.5 pt-0.5 min-w-0' }, [
            title && React.createElement('h5', { key: 'title', className: 'font-bold text-lg leading-none tracking-tight' }, title),
            description && React.createElement('p', { key: 'desc', className: 'text-sm font-medium opacity-90 leading-relaxed' }, description)
        ])
    ];

    if (dismissible) {
        nodes.push(
            React.createElement('button', {
                key: 'dismiss',
                type: 'button',
                className: 'relative z-10 ml-auto shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-black/10',
                'aria-label': 'Dismiss',
                onClick: (event: React.MouseEvent) => {
                    event.stopPropagation();
                    onClose();
                },
            }, dismissIcon())
        );
    }

    return React.createElement('div', {
        ...rest,
        className: `${baseClass} ${className || ''}`.trim(),
        style,
        role: isAlert ? 'alert' : 'status',
        'aria-live': isAlert ? 'assertive' : 'polite',
        'aria-atomic': true,
        'aria-label': rest['aria-label'] || accessibleName || undefined,
    }, nodes);
});

class AlertBuilder extends FiboBuilder {
  private _title: string = '';
  private _description?: string;
  private _intent: StatusType = 'info';

  title(value: string): this {
    this._title = value;
    bindInterp(this, value);
    return this;
  }

  description(value: string): this {
    this._description = value;
    bindInterp(this, value);
    return this;
  }

  intent(value: StatusType): this {
    this._intent = value;
    return this;
  }

  build(): ReactElement {
    const props = {
        title: resolveInterp(this._title),
        description: resolveInterp(this._description),
        intent: this._intent,
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };

    return React.createElement(AlertInner, props);
  }
}

export const Alert = createBuilder(AlertBuilder);

export interface AlertProps extends BaseProps {
  title: string;
  description?: string;
  intent?: StatusType;
  onClose?: () => void;
}
