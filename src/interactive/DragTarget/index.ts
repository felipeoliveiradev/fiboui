import React, { DragEvent, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

function readDropData(event: DragEvent<HTMLDivElement>): unknown {
  const transfer = event.dataTransfer;
  if (!transfer) return undefined;
  const text = transfer.getData('text') || transfer.getData('text/plain');
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

class DragTargetBuilder extends FiboBuilder {
  private _onAccept?: (data: unknown) => void;

  onAccept(callback: (data: unknown) => void): this {
    this._onAccept = callback;
    return this;
  }

  child(node: ReactNode): this {
    this._children = [node];
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, ...rest } = this._props;
    const className = ['fibo-drag-target', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const onAccept = this._onAccept;

    return React.createElement(
      'div',
      {
        ...rest,
        style: this.getStyle(),
        className,
        'data-drop-target': 'true',
        onDragOver: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
        },
        onDrop: (event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          if (!onAccept) return;
          onAccept(readDropData(event));
        },
      },
      ...this._children.map((node) => buildChild(node)),
    );
  }
}

export const DragTarget = createBuilder(DragTargetBuilder);
