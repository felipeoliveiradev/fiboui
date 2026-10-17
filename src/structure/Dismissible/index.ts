import React, {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

const DISMISS_THRESHOLD_PX = 80;

function DismissibleRow({
  child,
  onDismiss,
  className,
  style,
  domProps,
}: {
  child: ReactNode;
  onDismiss?: () => void;
  className: string;
  style?: CSSProperties;
  domProps: Record<string, unknown>;
}) {
  const [offset, setOffset] = useState(0);
  const [hidden, setHidden] = useState(false);
  const originX = useRef<number | null>(null);
  const dismissed = useRef(false);

  if (hidden) return null;

  const endDrag = (clientX: number) => {
    if (originX.current == null) return;
    const dx = clientX - originX.current;
    originX.current = null;
    if (Math.abs(dx) > DISMISS_THRESHOLD_PX) {
      if (!dismissed.current) {
        dismissed.current = true;
        onDismiss?.();
      }
      setHidden(true);
      return;
    }
    setOffset(0);
  };

  return React.createElement(
    'div',
    {
      ...domProps,
      className,
      style: { ...style, transform: `translateX(${offset}px)`, touchAction: 'pan-y' },
      onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button != null && event.button !== 0) return;
        originX.current = event.clientX;
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          /* jsdom */
        }
      },
      onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
        if (originX.current == null) return;
        setOffset(event.clientX - originX.current);
      },
      onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
        endDrag(event.clientX);
      },
      onPointerCancel: () => {
        originX.current = null;
        setOffset(0);
      },
    },
    React.createElement('div', { key: 'child' }, child),
    React.createElement(
      'button',
      {
        key: 'dismiss',
        type: 'button',
        onClick: () => {
          if (dismissed.current) return;
          dismissed.current = true;
          onDismiss?.();
        },
      },
      'Dismiss',
    ),
  );
}

class DismissibleBuilder extends FiboBuilder {
  private _child: ReactNode = null;
  private _onDismiss?: () => void;

  child(node: ReactNode): this {
    this._child = node;
    return this;
  }

  onDismiss(handler: () => void): this {
    this._onDismiss = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-dismissible', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(DismissibleRow, {
      child: buildChild(this._child),
      onDismiss: this._onDismiss,
      className,
      style: this.getStyle(),
      domProps: rest,
    });
  }
}

export const Dismissible = createBuilder(DismissibleBuilder);
