import React, { ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

export interface SwipeAction {
  label: string;
  onPress: () => void;
}

const OPEN_THRESHOLD = -48;

function clampClosed(offset: number): number {
  return Math.min(0, offset);
}

function eventX(event: { clientX?: number }): number | null {
  return typeof event.clientX === 'number' && Number.isFinite(event.clientX) ? event.clientX : null;
}

function SwipeRowView({
  rowChild,
  actions,
  className,
  style,
  ...rest
}: {
  rowChild: ReactNode;
  actions: SwipeAction[];
  className: string;
  style?: React.CSSProperties;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style' | 'children'>) {
  const [offset, setOffset] = useState(0);
  const drag = useRef<{ startX: number; startOffset: number } | null>(null);
  const stopDrag = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => stopDrag.current?.();
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest?.('button')) return;
    if (event.button != null && event.button !== 0) return;
    const startX = eventX(event);
    if (startX == null) return;
    const session = { startX, startOffset: offset };
    drag.current = session;
    stopDrag.current?.();

    const onMove = (move: PointerEvent) => {
      if (drag.current !== session) return;
      const x = eventX(move);
      if (x == null) return;
      setOffset(clampClosed(session.startOffset + (x - session.startX)));
    };
    const stop = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      if (stopDrag.current === stop) stopDrag.current = null;
    };
    const onUp = (up: PointerEvent) => {
      if (drag.current !== session) return;
      const x = eventX(up);
      stop();
      drag.current = null;
      if (x == null) {
        setOffset(0);
        return;
      }
      const next = clampClosed(session.startOffset + (x - session.startX));
      setOffset(next <= OPEN_THRESHOLD ? next : 0);
    };
    const onCancel = () => {
      if (drag.current !== session) return;
      stop();
      drag.current = null;
      setOffset(0);
    };

    stopDrag.current = stop;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  return React.createElement(
    'div',
    {
      ...rest,
      className,
      style: { position: 'relative', overflow: 'hidden', ...style },
      onPointerDown,
    },
    React.createElement(
      'div',
      { key: 'actions', className: 'fibo-swipe-row-actions' },
      actions.map((action, index) =>
        React.createElement(
          'button',
          {
            key: `${action.label}-${index}`,
            type: 'button',
            onClick: () => action.onPress(),
          },
          action.label,
        ),
      ),
    ),
    React.createElement(
      'div',
      {
        key: 'child',
        className: 'fibo-swipe-row-child',
        style: { transform: `translateX(${offset}px)` },
      },
      buildChild(rowChild),
    ),
  );
}

class SwipeRowBuilder extends FiboBuilder {
  private _child: ReactNode = null;
  private _actions: SwipeAction[] = [];

  child(node: ReactNode): this {
    this._child = node;
    return this;
  }

  actions(actions: SwipeAction[]): this {
    this._actions = actions;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-swipe-row', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(SwipeRowView, {
      ...rest,
      role: 'group',
      className,
      style: this.getStyle(),
      rowChild: this._child,
      actions: this._actions,
    });
  }
}

export const SwipeRow = createBuilder(SwipeRowBuilder);
