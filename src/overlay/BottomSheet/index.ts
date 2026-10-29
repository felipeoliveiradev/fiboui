import React, {
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';

export type SheetDetent = 'medium' | 'large';

const DETENT_MAX: Record<SheetDetent, string> = {
  medium: '50vh',
  large: '92vh',
};

const EXPAND_PX = 56;
const DISMISS_PX = 96;

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

function nextDetent(detents: SheetDetent[], current: SheetDetent, dir: 1 | -1): SheetDetent | null {
  const i = detents.indexOf(current);
  if (i < 0) return detents[0] ?? null;
  const j = i + dir;
  if (j < 0 || j >= detents.length) return null;
  return detents[j]!;
}

type PanelProps = {
  title?: string;
  child?: FiboChild;
  onClose?: () => void;
  detents: SheetDetent[];
  detent: SheetDetent;
  className: string;
  style: CSSProperties;
  rest: Record<string, unknown>;
};

function BottomSheetPanel({
  title,
  child,
  onClose,
  detents,
  detent: initialDetent,
  className,
  style,
  rest,
}: PanelProps): ReactElement {
  const activeInitial = detents.includes(initialDetent) ? initialDetent : detents[0] ?? 'medium';
  const [detent, setDetent] = useState<SheetDetent>(activeInitial);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startDetent = useRef(detent);
  const pointerId = useRef<number | null>(null);

  useEffect(() => {
    setDetent(activeInitial);
    setDragY(0);
  }, [activeInitial]);

  const previewUp =
    dragging && dragY <= -EXPAND_PX
      ? nextDetent(detents, startDetent.current, 1)
      : null;
  const shownDetent = previewUp ?? detent;
  const maxHeight = DETENT_MAX[shownDetent] ?? DETENT_MAX.medium;

  const endDrag = (clientY: number) => {
    const dy = clientY - startY.current;
    setDragging(false);
    setDragY(0);
    pointerId.current = null;

    if (dy <= -EXPAND_PX) {
      const up = nextDetent(detents, startDetent.current, 1);
      if (up) {
        setDetent(up);
        return;
      }
    }
    if (dy >= DISMISS_PX) {
      const down = nextDetent(detents, startDetent.current, -1);
      if (down) {
        setDetent(down);
        return;
      }
      onClose?.();
    }
  };

  const onHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    pointerId.current = e.pointerId;
    startY.current = e.clientY;
    startDetent.current = detent;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    setDragY(e.clientY - startY.current);
  };

  const onHandlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    endDrag(e.clientY);
  };

  return React.createElement(
    'div',
    { className: 'fibo-bottom-sheet-root', style: { position: 'fixed', inset: 0, zIndex: 80 } },
    React.createElement('div', {
      key: 'backdrop',
      className: 'fibo-bottom-sheet-backdrop',
      style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)' },
      onClick: () => onClose?.(),
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
          ...style,
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: style.background ?? 'var(--fibo-surface, #fff)',
          transform: dragY ? `translateY(${Math.max(0, dragY)}px)` : undefined,
          transition: dragging ? 'none' : 'max-height 220ms ease, transform 220ms ease',
          touchAction: 'pan-y',
        } as CSSProperties,
      },
      React.createElement(
        'div',
        {
          key: 'handle',
          className: 'fibo-bottom-sheet-handle',
          role: 'separator',
          'aria-orientation': 'horizontal',
          'aria-label': 'Arrastar folha',
          onPointerDown: onHandlePointerDown,
          onPointerMove: onHandlePointerMove,
          onPointerUp: onHandlePointerUp,
          onPointerCancel: onHandlePointerUp,
          style: {
            flex: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '10px 0 6px',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
          } as CSSProperties,
        },
        React.createElement('div', {
          style: {
            width: 40,
            height: 5,
            borderRadius: 999,
            background: 'rgba(128,128,128,0.45)',
          },
        }),
      ),
      title ? React.createElement('h2', { key: 'title', style: { margin: '0 16px 8px', flex: 'none' } }, title) : null,
      React.createElement(
        'div',
        {
          key: 'body',
          className: 'fibo-bottom-sheet-body',
          style: {
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            touchAction: 'pan-y',
          } as CSSProperties,
        },
        slot(child),
      ),
    ),
  );
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

    const { className: extraClass, style: extraStyle, children: _children, ...rest } = this._props;
    const className = ['fibo-bottom-sheet', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(BottomSheetPanel, {
      title: this._title,
      child: this._child,
      onClose: this._onClose,
      detents: this._detents.length ? this._detents : (['medium', 'large'] as SheetDetent[]),
      detent: this._detent,
      className,
      style: {
        ...this.getStyle(),
        ...(extraStyle as object),
      } as CSSProperties,
      rest: rest as Record<string, unknown>,
    });
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
