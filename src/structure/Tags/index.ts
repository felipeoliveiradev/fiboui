import React, { ReactElement, useSyncExternalStore } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { FineGrainText } from '../../core/FineGrain';
import { ListSignal } from '../../core/listSignal';
import type { BindableSignal } from '../../core/state';
import { BaseProps } from '../../core/types';
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

interface TagItem {
  title: string;
}

function isListSource<T>(value: unknown): value is BindableSignal<T[]> {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as BindableSignal<T[]>).subscribe === 'function' &&
    'value' in (value as object)
  );
}

function tagItemKey(item: unknown, index: number): string | number {
  if (item != null && typeof item === 'object') {
    const rec = item as { _id?: unknown; id?: unknown; key?: unknown };
    if (rec._id != null && rec._id !== '') return rec._id as string | number;
    if (rec.id != null && rec.id !== '') return rec.id as string | number;
    if (rec.key != null && rec.key !== '') return rec.key as string | number;
  }
  return index;
}

function tagTitle(item: object): string {
  const title = (item as TagItem).title;
  return typeof title === 'string' ? title : '';
}

function uniqueTagKey(item: unknown, index: number, seen: Set<string>): string | number {
  let key = tagItemKey(item, index);
  const asStr = String(key);
  if (seen.has(asStr)) key = `${asStr}::${index}`;
  seen.add(String(key));
  return key;
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function tagRemoveButton(
  title: string,
  onClick: (event: React.MouseEvent) => void
): React.ReactElement {
  if (hasInterpMarks(title)) {
    return React.createElement(
      'button',
      {
        key: 'rm',
        type: 'button',
        className: 'relative shrink-0 opacity-80 text-sm leading-none',
        onClick,
      },
      React.createElement(FineGrainText, {
        key: 'lbl',
        as: 'span',
        style: SR_ONLY,
        compute: () => `Remove ${resolveInterpString(title) || 'tag'}`,
      }),
      React.createElement('span', { key: 'x', 'aria-hidden': true }, '×')
    );
  }
  const resolved = title || 'tag';
  return React.createElement(
    'button',
    {
      key: 'rm',
      type: 'button',
      className: 'relative shrink-0 opacity-80 text-sm leading-none',
      'aria-label': `Remove ${resolved}`,
      onClick,
    },
    '×'
  );
}

function renderTagNode(
  item: object,
  index: number,
  key: string | number,
  onRemove?: (item: TagItem, index: number) => void,
): React.ReactNode {
  const title = tagTitle(item);
  const removable = typeof onRemove === 'function';
  const removeBtn = removable
    ? tagRemoveButton(title, (event: React.MouseEvent) => {
        event.stopPropagation();
        onRemove!(item as TagItem, index);
      })
    : null;

  if (hasInterpMarks(title)) {
    const live = React.createElement(FineGrainText, {
      key: removable ? 't' : key,
      as: 'span',
      className: removable ? undefined : 'fibo-tag',
      compute: () => resolveInterpString(title),
    });
    if (!removable) return live;
    return React.createElement('span', { key, className: 'fibo-tag' }, live, removeBtn);
  }

  const text = resolveInterp(title) ?? title;
  if (!removable) {
    return React.createElement('span', { key, className: 'fibo-tag' }, text);
  }
  return React.createElement('span', { key, className: 'fibo-tag' }, text, removeBtn);
}

const LiveTag = React.memo(function LiveTag(props: {
  list: ListSignal<any>;
  id: string;
  index: number;
  onRemove?: (item: TagItem, index: number) => void;
}) {
  const version = useSyncExternalStore(
    (notify) => props.list.subscribeItem(props.id, notify),
    () => props.list.itemVersion(props.id),
    () => props.list.itemVersion(props.id),
  );
  void version;
  const item = props.list.find(props.id);
  if (item == null || typeof item !== 'object') return null;
  return renderTagNode(item, props.index, props.id, props.onRemove);
}, (prev, next) => (
  prev.list === next.list
  && prev.id === next.id
  && prev.onRemove === next.onRemove
));

const TagsInner = React.memo((props: any) => {
    const { items: incomingItems, liveList, className, style, onRemove, ...rest } = props;
    const seen = new Set<string>();

    const structureVersion = useSyncExternalStore(
      (notify) => (liveList ? liveList.subscribeStructure(notify) : () => {}),
      () => (liveList ? liveList.structureVersion() : 0),
      () => (liveList ? liveList.structureVersion() : 0),
    );
    void structureVersion;

    const items = liveList ? liveList.value : (Array.isArray(incomingItems) ? incomingItems : []);

    const tags: React.ReactNode[] = items.flatMap((item: unknown, index: number): React.ReactNode[] => {
      if (item == null || typeof item !== 'object') return [];
      if (liveList && typeof (item as { _id?: unknown })._id === 'string' && (item as { _id: string })._id.length > 0) {
        const id = (item as { _id: string })._id;
        return [
          React.createElement(LiveTag, {
            key: id,
            list: liveList,
            id,
            index,
            onRemove,
          }),
        ];
      }
      const key = uniqueTagKey(item, index, seen);
      return [renderTagNode(item, index, key, onRemove)];
    });

    return React.createElement(
      'div',
      {
        className,
        style,
        ...rest,
      },
      ...tags
    );
});

class TagsBuilder extends FiboBuilder {
  private _items: TagItem[] = [];
  /** Plain `signal(array)`. Read on each rebuild. */
  private _source?: BindableSignal<TagItem[]>;
  /** `listSignal`. Tags subscribe by `_id`. */
  private _liveList?: ListSignal<any>;

  constructor(items: TagItem[] = []) {
    super();
    this.items(items);
  }

  items(items: TagItem[] | BindableSignal<TagItem[]>): this {
    if (items instanceof ListSignal) {
      this._liveList = items;
      this._source = undefined;
      return this;
    }
    this._liveList = undefined;
    if (isListSource<TagItem>(items)) {
      this._source = items;
      this.bindSignal(items);
      for (const item of Array.isArray(items.value) ? items.value : []) {
        bindInterp(this, item?.title);
      }
      return this;
    }
    this._source = undefined;
    this._items = Array.isArray(items) ? items : [];
    for (const item of this._items) bindInterp(this, item?.title);
    return this;
  }

  build(): ReactElement {
    const className = ['fibo-tags', 'flex', 'gap-2', 'flex-wrap', ...this._classNames]
      .filter(Boolean)
      .join(' ');

    const {
      className: extraClass,
      style: extraStyle,
      items: _itemsFromProps,
      ...hostProps
    } = this._props ?? {};
    const extraClassName = typeof extraClass === 'string' ? extraClass : '';

    const liveList = this._liveList;
    const props = {
        ...hostProps,
        items: liveList ? [] : (this._source ? this._source.value : this._items),
        liveList,
        className: [className, extraClassName].filter(Boolean).join(' '),
        style: {
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '0.5rem',
          minWidth: 0,
          ...this.getStyle(),
          ...(extraStyle && typeof extraStyle === 'object' ? extraStyle : null),
        },
    };
    return React.createElement(TagsInner, props);
  }
}

export const Tags = createBuilder(TagsBuilder);

export interface TagsProps extends BaseProps {
  items: TagItem[];
  onRemove?: (item: TagItem, index: number) => void;
}

export type { TagItem };
