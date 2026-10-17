import React, { ReactElement, ReactNode, WheelEvent, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ViewerStage(props: {
  minScale: number;
  maxScale: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}) {
  const { minScale, maxScale, className, style, children } = props;
  const [scale, setScale] = useState(() => clamp(1, minScale, maxScale));

  const zoom = (delta: number) => {
    setScale((current) => clamp(current + delta, minScale, maxScale));
  };

  return React.createElement(
    'div',
    {
      className,
      style: { ...style, overflow: 'hidden', position: 'relative' },
      'data-interactive-viewer': 'true',
      onWheel: (event: WheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        zoom(event.deltaY < 0 ? 1 : -1);
      },
    },
    React.createElement(
      'div',
      {
        'data-viewer-stage': 'true',
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        },
      },
      children,
    ),
    React.createElement(
      'button',
      { type: 'button', 'aria-label': 'Zoom in', onClick: () => zoom(1) },
      'Zoom in',
    ),
    React.createElement(
      'button',
      { type: 'button', 'aria-label': 'Zoom out', onClick: () => zoom(-1) },
      'Zoom out',
    ),
  );
}

class InteractiveViewerBuilder extends FiboBuilder {
  private _minScale = 1;
  private _maxScale = 4;

  minScale(value: number): this {
    this._minScale = value;
    return this;
  }

  maxScale(value: number): this {
    this._maxScale = value;
    return this;
  }

  child(node: ReactNode): this {
    this._children = [node];
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, ...rest } = this._props;
    const className = ['fibo-interactive-viewer', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');
    const min = Number.isFinite(this._minScale) ? this._minScale : 1;
    const max = Number.isFinite(this._maxScale) ? this._maxScale : 4;

    return React.createElement(ViewerStage, {
      ...rest,
      className,
      style: this.getStyle(),
      minScale: Math.min(min, max),
      maxScale: Math.max(min, max),
      children: this._children.map((node) => buildChild(node)),
    });
  }
}

export const InteractiveViewer = createBuilder(InteractiveViewerBuilder);
