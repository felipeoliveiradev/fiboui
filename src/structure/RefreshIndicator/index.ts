import React, { CSSProperties, PointerEvent as ReactPointerEvent, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

const PULL_THRESHOLD = 48;

function RefreshPull({
  className,
  style,
  refreshing,
  onRefresh,
  child,
  domProps,
}: {
  className: string;
  style: CSSProperties;
  refreshing: boolean;
  onRefresh?: () => void;
  child: ReactNode;
  domProps: Record<string, unknown>;
}): ReactElement {
  const [label, setLabel] = React.useState('Pull');
  const originY = React.useRef<number | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop !== 0) {
      originY.current = null;
      return;
    }
    originY.current = event.clientY;
    setLabel('Pull');
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (originY.current == null) return;
    if (event.currentTarget.scrollTop !== 0) {
      originY.current = null;
      setLabel('Pull');
      return;
    }
    setLabel(event.clientY - originY.current > PULL_THRESHOLD ? 'Release' : 'Pull');
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (originY.current == null) return;
    const distance = event.clientY - originY.current;
    const atTop = event.currentTarget.scrollTop === 0;
    originY.current = null;
    setLabel('Pull');
    if (atTop && distance > PULL_THRESHOLD) onRefresh?.();
  };

  return React.createElement(
    'div',
    {
      ...domProps,
      className,
      style,
      'aria-busy': refreshing ? true : undefined,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: () => {
        originY.current = null;
        setLabel('Pull');
      },
    },
    React.createElement('span', { key: 'label' }, label),
    React.createElement(
      'button',
      {
        key: 'refresh',
        type: 'button',
        onClick: () => onRefresh?.(),
      },
      'Refresh',
    ),
    React.createElement('div', { key: 'child' }, child),
  );
}

class RefreshIndicatorBuilder extends FiboBuilder {
  private _refreshing = false;
  private _onRefresh?: () => void;
  private _child: ReactNode = null;

  refreshing(value: boolean): this {
    this._refreshing = value;
    return this;
  }

  onRefresh(handler: () => void): this {
    this._onRefresh = handler;
    return this;
  }

  child(node: ReactNode): this {
    this._child = node;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-refresh', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(RefreshPull, {
      className,
      style: this.getStyle(),
      refreshing: this._refreshing,
      onRefresh: this._onRefresh,
      child: buildChild(this._child),
      domProps: rest,
    });
  }
}

export const RefreshIndicator = createBuilder(RefreshIndicatorBuilder);
