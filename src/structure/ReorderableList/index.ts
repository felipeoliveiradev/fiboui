import React, { DragEvent, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

export interface ReorderableItem {
  id: string;
  label: string;
}

function moveId(ids: string[], index: number, direction: -1 | 1): string[] | null {
  const next = index + direction;
  if (next < 0 || next >= ids.length) return null;
  const order = ids.slice();
  const [id] = order.splice(index, 1);
  order.splice(next, 0, id);
  return order;
}

function moveTo(ids: string[], from: number, to: number): string[] | null {
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return null;
  const order = ids.slice();
  const [id] = order.splice(from, 1);
  order.splice(to, 0, id);
  return order;
}

class ReorderableListBuilder extends FiboBuilder {
  private _items: ReorderableItem[] = [];
  private _onReorder?: (ids: string[]) => void;

  items(items: ReorderableItem[]): this {
    this._items = items;
    return this;
  }

  onReorder(handler: (ids: string[]) => void): this {
    this._onReorder = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, children: _ignored, ...rest } = this._props;
    const className = ['fibo-reorderable-list', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const ids = this._items.map((item) => item.id);
    const onReorder = this._onReorder;
    let dragFrom: number | null = null;
    const reorder = (index: number, direction: -1 | 1) => {
      const order = moveId(ids, index, direction);
      if (order && onReorder) onReorder(order);
    };
    const dropOn = (to: number, event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const raw = event.dataTransfer?.getData('text/plain');
      const from = dragFrom ?? (raw === '' || raw == null ? NaN : Number(raw));
      dragFrom = null;
      const order = moveTo(ids, from, to);
      if (order && onReorder) onReorder(order);
    };

    return React.createElement(
      'div',
      { ...rest, role: 'list', className, style: this.getStyle() },
      this._items.map((item, index) =>
        React.createElement(
          'div',
          {
            key: item.id,
            role: 'listitem',
            className: 'fibo-reorderable-row',
            draggable: true,
            onDragStart: (event: DragEvent<HTMLDivElement>) => {
              dragFrom = index;
              if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(index));
              }
            },
            onDragOver: (event: DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
            },
            onDrop: (event: DragEvent<HTMLDivElement>) => dropOn(index, event),
            onDragEnd: () => {
              dragFrom = null;
            },
          },
          React.createElement('span', { key: 'label' }, item.label),
          React.createElement(
            'button',
            { key: 'up', type: 'button', onClick: () => reorder(index, -1) },
            'Move up',
          ),
          React.createElement(
            'button',
            { key: 'down', type: 'button', onClick: () => reorder(index, 1) },
            'Move down',
          ),
        ),
      ),
    );
  }
}

export const ReorderableList = createBuilder(ReorderableListBuilder);
