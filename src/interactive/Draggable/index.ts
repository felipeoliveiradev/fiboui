import React, { DragEvent, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

function dragId(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'id' in data) {
    const id = (data as { id?: unknown }).id;
    if (id != null && id !== '') return String(id);
  }
  return undefined;
}

class DraggableBuilder extends FiboBuilder {
  private _data?: unknown;
  private _onDragStart?: () => void;

  data(value: unknown): this {
    this._data = value;
    return this;
  }

  child(node: ReactNode): this {
    this._children = [node];
    return this;
  }

  onDragStart(callback: () => void): this {
    this._onDragStart = callback;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, ...rest } = this._props;
    const className = ['fibo-draggable', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const id = dragId(this._data);
    const data = this._data;
    const onDragStart = this._onDragStart;

    return React.createElement(
      'div',
      {
        ...rest,
        style: this.getStyle(),
        className,
        draggable: true,
        ...(id != null ? { 'data-drag-id': id } : {}),
        onDragStart: (event: DragEvent<HTMLDivElement>) => {
          if (data !== undefined && event.dataTransfer) {
            const text = JSON.stringify(data);
            event.dataTransfer.setData('text', text);
            event.dataTransfer.setData('text/plain', text);
          }
          onDragStart?.();
        },
      },
      ...this._children.map((node) => buildChild(node)),
    );
  }
}

export const Draggable = createBuilder(DraggableBuilder);
