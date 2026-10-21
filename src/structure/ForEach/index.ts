'use client';

import React, { type ReactElement, type ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild, withListKey } from '../../core/children';
import type { BindableSignal } from '../../core/state';

export type ForEachSource<T> =
  | readonly T[]
  | T[]
  | (() => readonly T[] | T[])
  | BindableSignal<readonly T[] | T[]>;

function isBindableList(value: unknown): value is BindableSignal<unknown[]> {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as BindableSignal<unknown[]>).subscribe === 'function' &&
    'value' in (value as object)
  );
}

function resolveSource<T>(source: ForEachSource<T> | undefined): T[] {
  if (source == null) return [];
  if (typeof source === 'function') {
    return [...(source() ?? [])];
  }
  if (isBindableList(source)) {
    const value = source.value as T[] | readonly T[] | undefined;
    return [...(value ?? [])];
  }
  return [...(source as readonly T[])];
}

function defaultItemKey(item: unknown, index: number): string | number {
  if (item != null && typeof item === 'object') {
    const rec = item as { id?: unknown; _id?: unknown; key?: unknown };
    const id = rec.id ?? rec._id ?? rec.key;
    if (typeof id === 'string' || typeof id === 'number') return id;
  }
  if (typeof item === 'string' || typeof item === 'number') return item;
  return index;
}

/**
 * SwiftUI `ForEach` — map data to children for any host (`Row`, `Column`,
 * `ToolbarItem().children(…)`, glass pills, etc.). Not list chrome; use `List`.
 *
 * ```ts
 * Row().gap(4).children(
 *   ForEach(tabs)
 *     .keyBy((t) => t.id)
 *     .renderItem((t) => chip(t))
 * )
 *
 * ForEach(tabs, (t) => chip(t))
 * ```
 *
 * Note: use `.keyBy()` for React keys — `.id()` on builders is the HTML `id`.
 */
class ForEachBuilder<T = unknown> extends FiboBuilder {
  private _source?: ForEachSource<T>;
  private _renderItem?: (item: T, index: number) => unknown;
  private _keyBy?: (item: T, index: number) => string | number;

  constructor(
    source?: ForEachSource<T>,
    renderItem?: (item: T, index: number) => unknown,
  ) {
    super();
    if (source !== undefined) this._source = source;
    if (renderItem) this._renderItem = renderItem;
  }

  /** Data: array, `() => array`, or bindable / `listSignal` (read `.value` at build). */
  items(source: ForEachSource<T>): this {
    this._source = source;
    return this;
  }

  /** Factory per item — same idea as `List.renderItem`. */
  renderItem(fn: (item: T, index: number) => unknown): this {
    this._renderItem = fn;
    return this;
  }

  /**
   * Stable React key per item.
   * Defaults to `id` / `_id` / `key` on objects, else index.
   * (Not `.id()` — that sets the host HTML id on `FiboBuilder`.)
   */
  keyBy(fn: (item: T, index: number) => string | number): this {
    this._keyBy = fn;
    return this;
  }

  build(): ReactElement {
    const items = resolveSource(this._source);
    const render = this._renderItem;
    const keyOf = this._keyBy;

    const nodes: ReactNode[] = items.map((item, index) => {
      const raw = render ? render(item, index) : (item as unknown);
      const child = buildChild(raw);
      const key = keyOf ? keyOf(item, index) : defaultItemKey(item, index);
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { key });
      }
      return withListKey(child, index);
    });

    // Fragment: no DOM host — Row/Column flex sees the leaves as direct children.
    return React.createElement(React.Fragment, null, ...nodes);
  }
}

export const ForEach = createBuilder(ForEachBuilder);
