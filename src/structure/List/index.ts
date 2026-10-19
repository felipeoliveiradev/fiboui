'use client';

import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild, isUsableReactKey } from '../../core/children';
import { BaseProps, FiboChild, FiboChildren } from '../../core/types';
import type { BindableSignal } from '../../core/state';
import { Box } from '../Box';
import {
  createListItemPseudoStateBuilder,
} from './ListItemPseudoStateBuilder';
import {
  ListItemStyleBuilder,
  createListItemStyleBuilder,
  normalizeItemStyleObject,
} from './ListItemStyleBuilder';
import { camelToKebab, type CssFluentProxy } from '../../core/cssFluent';
import { type When, type WhenStyle } from '../../core/when';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

type ListVariant = 'default' | 'card' | 'floating';

/** Render list row: custom renderItem, else builders/elements/primitives as-is. */
function isListSource<T>(value: unknown): value is BindableSignal<T[]> {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as BindableSignal<T[]>).subscribe === 'function' &&
    'value' in (value as object)
  );
}

function isStableListId(value: unknown): value is string | number {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  return typeof value === 'string' && value !== '';
}

function listItemKey(item: unknown, index: number): string {
  if (item != null && typeof item === 'object') {
    const rec = item as {
      _id?: unknown;
      id?: unknown;
      key?: unknown;
      _props?: { key?: unknown };
    };
    if (isStableListId(rec._id)) return String(rec._id);
    if (isStableListId(rec.id)) return String(rec.id);
    if (isUsableReactKey(rec.key) && rec.key !== '') return String(rec.key);
    if (isStableListId(rec._props?.key)) return String(rec._props.key);
    if (
      React.isValidElement(item) &&
      isUsableReactKey(item.key) &&
      item.key !== ''
    ) {
      return String(item.key);
    }
  }
  return `item-${index}`;
}

function materializeListEntries<T>(raw: unknown): T[] {
  const arr = (Array.isArray(raw) ? raw : [raw]).filter(
    (x) => x !== undefined && x !== null && x !== false
  );
  return arr as T[];
}

function resolveListItem<T>(
  item: T,
  index: number,
  renderItem?: (item: T, index: number) => ReactNode
): ReactNode {
  if (renderItem) {
    return buildChild(renderItem(item, index));
  }
  return buildChild(item);
}

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function bindInterpTree(host: FiboBuilder, node: unknown): void {
  if (typeof node === 'function') {
    try {
      bindInterpTree(host, (node as () => unknown)());
    } catch {
      /* factory may need mount */
    }
    return;
  }
  if (typeof node === 'string') {
    bindInterp(host, node);
    return;
  }
}

/** `.empty(node | string | builder | factory)` — factory re-runs on each rebuild. */
function resolveEmptyContent(empty: unknown): ReactNode {
  if (empty == null) return null;
  const raw = typeof empty === 'function' ? (empty as () => unknown)() : empty;
  if (typeof raw === 'string' && hasInterpMarks(raw)) {
    return resolveInterpString(raw);
  }
  return buildChild(raw);
}

const VIRTUALIZATION_THRESHOLD = 100;
const DEFAULT_ITEM_HEIGHT = 60;
const OVERSCAN = 5;

/** Append !important to each declaration so hover beats inline row styles. */
function withImportant(css: string): string {
  return css
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((decl) => (/\s!important\s*$/i.test(decl) ? decl : `${decl} !important`))
    .join('; ');
}

/** Inheritable typography only — paint stays on the row so nested chrome is not wiped. */
function isInheritableTypography(prop: string): boolean {
  const p = camelToKebab(prop.trim()).toLowerCase();
  return (
    p === 'color' ||
    p === 'letter-spacing' ||
    p === 'line-height' ||
    p === 'font' ||
    p.startsWith('font-') ||
    p.startsWith('text-')
  );
}

function splitPseudoCss(css: string): { row: string; inherit: string } {
  const decls = withImportant(css)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);
  const inherit = decls.filter((decl) => {
    const colon = decl.indexOf(':');
    if (colon < 0) return false;
    return isInheritableTypography(decl.slice(0, colon));
  });
  return { row: decls.join('; '), inherit: inherit.join('; ') };
}

function pseudoBlock(scope: string, selector: string, css: string): string {
  const { row, inherit } = splitPseudoCss(css);
  if (!row) return '';
  let out = `${scope} ${selector} { ${row} }\n`;
  if (inherit) {
    out += `${scope} ${selector} * { ${inherit} }\n`;
  }
  return out;
}

const ListInner = React.memo((props: any) => {
  const {
    items,
    renderItem,
    variant,
    separator,
    loading,
    threshold,
    onEndReached,
    className,
    style,
    containerHeight = 500,
    resetItemStyles = false,
    direction = 'vertical',
    customItemHover,
    customItemActive,
    customItemFocus,
    itemStyle: itemStyleProp,
    empty,
    onItemPress,
  } = props;

  const listRow = (item: any, index: number, extra?: Record<string, unknown>) => {
    const built = Box()
      .style(itemContainerStyles[variant as ListVariant])
      .classNames(variantClasses[variant as ListVariant])
      .children(resolveListItem(item, index, renderItem))
      .build() as React.ReactElement;
    const press = typeof onItemPress === 'function'
      ? {
          className: `${built.props.className ?? ''} cursor-pointer`,
          onClick: () => onItemPress(item, index),
        }
      : {};
    return React.cloneElement(built, {
      key: listItemKey(item, index),
      ...press,
      ...extra,
    });
  };

  const reactId = React.useId();
  // useId() may include colons (e.g. `:r1:`) — invalid / awkward in CSS selectors & HTML ids.
  const listInstanceId = reactId.replace(/:/g, '');
  const listScopeClass = `fibo-list-${listInstanceId}`;
  const styleElementId = `fibo-list-custom-styles-${listInstanceId}`;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const heightCache = useRef<Map<string, number>>(new Map());
  const observerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';

  const itemCount = items.length;
  const shouldVirtualize = itemCount > VIRTUALIZATION_THRESHOLD;

  const getItemHeight = (index: number): number => {
    const key = listItemKey(items[index], index);
    return heightCache.current.get(key) ?? DEFAULT_ITEM_HEIGHT;
  };

  const getItemOffset = (index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  };

  const getTotalHeight = (): number => {
    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getItemHeight(i);
    }
    return total;
  };

  const findStartIndex = (offset: number): number => {
    let low = 0;
    let high = itemCount - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const itemOffset = getItemOffset(mid);

      if (itemOffset < offset) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return Math.max(0, low - 1);
  };

  let startIndex = 0;
  let endIndex = itemCount;
  let startOffset = 0;
  let totalHeight = 0;

  if (shouldVirtualize) {
    startIndex = Math.max(0, findStartIndex(scrollOffset) - OVERSCAN);

    let currentOffset = getItemOffset(startIndex);
    let index = startIndex;

    while (currentOffset < scrollOffset + containerHeight + (OVERSCAN * DEFAULT_ITEM_HEIGHT) && index < itemCount) {
      currentOffset += getItemHeight(index);
      index++;
    }

    endIndex = Math.min(itemCount, index);
    startOffset = getItemOffset(startIndex);
    totalHeight = getTotalHeight();
  }

  const visibleItems = items.slice(startIndex, endIndex);

  useLayoutEffect(() => {
    if (!shouldVirtualize && scrollOffset !== 0) {
      setScrollOffset(0);
    }
  }, [shouldVirtualize, scrollOffset]);

  useLayoutEffect(() => {
    if (!shouldVirtualize) return;

    const live = new Set(
      items.map((item: unknown, i: number) => listItemKey(item, i))
    );
    for (const key of Array.from(heightCache.current.keys())) {
      if (!live.has(key)) heightCache.current.delete(key);
    }
    for (const key of Array.from(itemRefs.current.keys())) {
      if (!live.has(key)) itemRefs.current.delete(key);
    }

    let changed = false;
    visibleItems.forEach((item: unknown, i: number) => {
      const actualIndex = startIndex + i;
      const key = listItemKey(item, actualIndex);
      const element = itemRefs.current.get(key);

      if (element) {
        const rect = element.getBoundingClientRect();
        const measured = isHorizontal ? rect.width : rect.height;

        if (measured > 0) {
          const cached = heightCache.current.get(key);
          if (cached !== measured) {
            heightCache.current.set(key, measured);
            changed = true;
          }
        }
      }
    });

    if (changed) {
      setLayoutVersion((version) => version + 1);
    }
  }, [items, visibleItems, startIndex, shouldVirtualize, isHorizontal, layoutVersion]);

  useLayoutEffect(() => {
    if (!onEndReached || loading) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onEndReached?.();
        }
      },
      { threshold: threshold }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, items.length, onEndReached, threshold]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (shouldVirtualize) {
      setScrollOffset(isHorizontal ? e.currentTarget.scrollLeft : e.currentTarget.scrollTop);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!customItemHover && !customItemActive && !customItemFocus) return;

    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleElementId;
      document.head.appendChild(styleElement);
    }

    let css = '';
    const scope = `.${listScopeClass}`;

    if (customItemHover) {
      css += pseudoBlock(scope, '.fibo-list-item-custom-hover:hover', customItemHover);
    }

    if (customItemActive) {
      css += pseudoBlock(scope, '.fibo-list-item-custom-active:active', customItemActive);
    }

    if (customItemFocus) {
      // Items are divs without tabIndex — :focus never matches; :focus-within
      // covers focus on nested focusable content (links, buttons, inputs).
      css += pseudoBlock(scope, '.fibo-list-item-custom-focus:focus-within', customItemFocus);
    }

    styleElement.textContent = css;

    return () => {
      const el = document.getElementById(styleElementId);
      if (el) el.remove();
    };
  }, [customItemHover, customItemActive, customItemFocus, listScopeClass, styleElementId]);

  const variantStyles: Record<ListVariant, any> = {
    default: { gap: '0px' },
    card: { gap: '12px' },
    floating: { gap: '8px' }
  };

  const itemStyleOverlay: CSSProperties = itemStyleProp || {};

  const baseItemContainerStyles: Record<ListVariant, CSSProperties> = resetItemStyles
    ? { default: {}, card: {}, floating: {} }
    : {
        default: {
          padding: '12px 16px',
          borderBottom: separator ? '1px solid #F3F4F6' : 'none',
          // Transparent via class, not inline — so Tailwind / itemHover bg can win.
          transition: 'background-color 0.2s ease-out',
        },
        card: {
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
          border: '1px solid #F3F4F6',
          transform: 'translate3d(0, 0, 0)',
          transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
        },
        floating: {
          padding: '8px 12px',
          borderRadius: '12px',
          transition: 'background-color 0.2s ease-out, box-shadow 0.2s ease-out',
        },
      };

  // Variant defaults + universal itemStyle (SwiftUI listRow* / Flutter ListTileTheme).
  const itemContainerStyles: Record<ListVariant, CSSProperties> = {
    default: { ...baseItemContainerStyles.default, ...itemStyleOverlay },
    card: { ...baseItemContainerStyles.card, ...itemStyleOverlay },
    floating: { ...baseItemContainerStyles.floating, ...itemStyleOverlay },
  };

  const customItemClasses: string[] = ['fibo-list-item'];
  if (customItemHover) customItemClasses.push('fibo-list-item-custom-hover');
  if (customItemActive) customItemClasses.push('fibo-list-item-custom-active');
  if (customItemFocus) customItemClasses.push('fibo-list-item-custom-focus');

  const variantClasses: Record<ListVariant, string[]> = resetItemStyles ? {
    default: [...customItemClasses],
    card: [...customItemClasses],
    floating: [...customItemClasses]
  } : {
    default: ['hover:bg-gray-50', 'first:rounded-t-xl', 'last:rounded-b-xl', ...customItemClasses],
    card: ['hover:-translate-y-0.5', 'hover:shadow-md', ...customItemClasses],
    floating: ['hover:bg-white', 'hover:shadow-sm', ...customItemClasses]
  };

  if (itemCount === 0 && empty != null) {
    return Box()
      .className(className)
      .classNames(['fibo-list', listScopeClass, 'flex', direction === 'horizontal' ? 'flex-row' : 'flex-col', 'w-full'])
      .style({
        ...variantStyles[variant as ListVariant],
        ...style
      })
      .children(
        React.createElement(
          'div',
          { className: 'fibo-list-empty' },
          resolveEmptyContent(empty)
        )
      )
      .build();
  }

  if (shouldVirtualize) {

    return React.createElement(
      'div',
      {
        ref: containerRef,
        className: `fibo-list fibo-list-virtualized ${listScopeClass} ${className || ''}`,
        style: {
          height: isHorizontal ? undefined : `${containerHeight}px`,
          width: isHorizontal ? `${containerHeight}px` : undefined,
          overflowY: isHorizontal ? 'hidden' : 'auto',
          overflowX: isHorizontal ? 'auto' : 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          ...variantStyles[variant as ListVariant],
          ...style
        },
        onScroll: onScroll
      },
      React.createElement('div', {
        style: {
          height: isHorizontal ? '1px' : `${totalHeight}px`,
          width: isHorizontal ? `${totalHeight}px` : '1px',
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none'
        }
      }),
      React.createElement(
        'div',
        {
          style: {
            transform: isHorizontal ? `translateX(${startOffset}px)` : `translateY(${startOffset}px)`,
            width: isHorizontal ? 'auto' : '100%',
            height: isHorizontal ? '100%' : undefined,
            display: isHorizontal ? 'flex' : undefined,
            flexDirection: isHorizontal ? 'row' : undefined
          }
        },
        visibleItems.map((item: any, i: number) => {
          const actualIndex = startIndex + i;
          const rowKey = listItemKey(item, actualIndex);

          return listRow(item, actualIndex, {
            ref: (el: HTMLDivElement | null) => {
              if (el) {
                itemRefs.current.set(rowKey, el);
              } else {
                itemRefs.current.delete(rowKey);
              }
            },
          });
        })
      ),
      onEndReached && React.createElement('div', {
        ref: observerRef,
        className: 'py-4 flex justify-center w-full',
        style: {
          position: 'absolute',
          top: isHorizontal ? 0 : totalHeight,
          left: isHorizontal ? totalHeight : 0,
          width: isHorizontal ? undefined : '100%',
        },
      }, loading ? (
        React.createElement('div', { className: 'animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-b-blue-600' })
      ) : (
        React.createElement('div', { style: { height: '20px' } })
      ))
    );
  }

  return Box()
    .className(className)
    .classNames(['fibo-list', listScopeClass, 'flex', direction === 'horizontal' ? 'flex-row' : 'flex-col', 'w-full'])
    .style({
      ...variantStyles[variant as ListVariant],
      ...style
    })
    .children(
      React.createElement(React.Fragment, {}, [
        ...items.map((item: any, index: number) => listRow(item, index)),

        onEndReached && (
          React.createElement('div', {
            ref: observerRef,
            className: 'py-4 flex justify-center w-full'
          }, loading ? (
            React.createElement('div', { className: 'animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-b-blue-600' })
          ) : (
            React.createElement('div', { style: { height: '20px' } })
          ))
        )
      ])
    )
    .build();
});

class ListBuilder<T = any> extends FiboBuilder {
  private _items: T[] = [];
  /** Live source (`listSignal` / `signal`). Read on each rebuild. */
  private _source?: BindableSignal<T[]>;
  private _renderItem?: (item: T, index: number) => ReactNode;
  private _onItemPress?: (item: T, index: number) => void;
  private _variant: ListVariant = 'default';
  private _separator: boolean = false;
  private _onEndReached?: () => void;
  private _loading: boolean = false;
  private _threshold: number = 0.5;
  private _containerHeight: number = 500;
  private _resetItemStyles: boolean = false;
  private _direction: 'horizontal' | 'vertical' = 'vertical';
  private _customItemHover?: string;
  private _customItemActive?: string;
  private _customItemFocus?: string;
  /** Universal row chrome — applies to every child wrapper. */
  private _itemStyle?: CSSProperties;
  /** Kept and re-invoked on each rebuild (`List().items(fn)` / bindSignal). */
  private _itemsFn?: () => unknown;
  /** Placeholder when `items.length === 0` (plain array or empty `listSignal`). */
  private _empty?: FiboChild | (() => FiboChild);

  /**
   * Entries to show.
   *
   * - **UI mode** (same as `.children`): `List().items([ListTile()…, Text(…)])`
   * - **Data mode**: `List().items(rows).renderItem((row) => ListTile().title(row.name))`
   * - **Live list**: `List().items(listSignal).renderItem((row) => ListTile().title(row.title))`
   * - **Live fn**: `List().items(() => todos.value).bindSignal(todos)` — fn re-runs on rebuild
   */
  items(items: T[] | FiboChildren | BindableSignal<T[]> | (() => T[])): this {
    if (isListSource<T>(items)) {
      this._source = items;
      this.bindSignal(items);
      return this;
    }
    this._source = undefined;
    return this.setListEntries(items);
  }

  /**
   * UI mode — any builders / nodes (ListTile, Text, Row, …).
   * Equivalent to `.items([...])` without `renderItem`.
   */
  children(children: FiboChildren): this {
    return this.setListEntries(children);
  }

  /** Shared path so `.children` and `.items` stay interchangeable for UI. */
  private setListEntries(entries: T[] | FiboChildren | (() => T[])): this {
    if (typeof entries === 'function') {
      this._itemsFn = entries as () => unknown;
      this._items = [];
      super.children(entries as FiboChildren);
      return this;
    }
    this._itemsFn = undefined;
    this._items = materializeListEntries<T>(entries);
    super.children(this._items as FiboChildren);
    return this;
  }

  /**
   * Map raw data from `.items(data)` → UI. Skip this when items are already
   * ListTile / Text / builders (use `.children` or `.items` alone).
   */
  renderItem(fn: (item: T, index: number) => ReactNode): this {
    this._renderItem = fn;
    return this;
  }

  /**
   * Same press for every row. The row is the target; the click reaches it
   * from the item. A row that needs its own action keeps that inside `renderItem`.
   *
   * ```ts
   * List().items(todos).onPress((todo) => toggle(todo.id)).renderItem((todo) => TodoItem(todo))
   * ```
   */
  onPress(handler: (item: T, index: number) => void): this {
    this._onItemPress = handler;
    return this;
  }

  /** Alias of `.onPress()`. */
  onTap(handler: (item: T, index: number) => void): this {
    return this.onPress(handler);
  }

  /**
   * Shown when there are no rows — empty array or empty `listSignal`.
   * Accepts a string, a node, a builder, or a factory that re-runs on rebuild.
   *
   * ```ts
   * List().items(todos).empty('No todos').renderItem((t) => Text(t.title))
   * List().items([]).empty(Text('Nothing'))
   * List().items(todos).empty(() => Text(`Count ${todos.length}`))
   * ```
   */
  empty(content: FiboChild | (() => FiboChild)): this {
    this._empty = content;
    bindInterpTree(this, content);
    return this;
  }

  variant(variant: ListVariant): this {
    this._variant = variant;
    return this;
  }

  separator(show: boolean = true): this {
    this._separator = show;
    return this;
  }

  onEndReached(handler: () => void): this {
    this._onEndReached = handler;
    return this;
  }

  loading(isLoading: boolean): this {
    this._loading = isLoading;
    return this;
  }

  threshold(value: number): this {
    this._threshold = value;
    return this;
  }

  containerHeight(height: number): this {
    this._containerHeight = height;
    return this;
  }

  resetItemStyles(reset: boolean = true): this {
    this._resetItemStyles = reset;
    return this;
  }

  direction(dir: 'horizontal' | 'vertical'): this {
    this._direction = dir;
    return this;
  }

  reset(): this {
    this._resetItemStyles = true;
    return this;
  }

  /**
   * Universal row style (all children).
   * SwiftUI: `listRowBackground` / `listRowInsets` · Flutter: `ListTileTheme`.
   *
   * ```ts
   * List()
   *   .itemStyle((s) => s.padding(14).bg('#fff').rounded(12))
   *   .when(When.hover, (h) => h.bg('#f3f4f6'))
   *   .children([ListTile().title('A'), ListTile().title('B')])
   * ```
   */
  itemStyle(
    style:
      | CSSProperties
      | ((builder: ListItemStyleBuilder & CssFluentProxy) => void | ListItemStyleBuilder | CssFluentProxy)
  ): this {
    if (typeof style === 'function') {
      const builder = createListItemStyleBuilder();
      style(builder);
      this._itemStyle = { ...this._itemStyle, ...builder.toStyle() };
    } else {
      this._itemStyle = { ...this._itemStyle, ...normalizeItemStyleObject(style) };
    }
    return this;
  }

  /** SwiftUI `listRowBackground` — shorthand for `.itemStyle(s => s.bg(color))`. */
  itemBackground(color: string): this {
    return this.itemStyle((s) => s.bg(color));
  }

  /** SwiftUI `listRowInsets` — shorthand for `.itemStyle(s => s.insets(value))`. */
  itemInsets(value: number | string): this {
    return this.itemStyle((s) => s.insets(value));
  }

  /**
   * Row paint for `When.hover` / `When.focus` / `When.active`.
   * Other states fall through to the node pseudo (the list box itself).
   */
  when(state: When, style: WhenStyle): this {
    if (state === 'hover' || state === 'focus' || state === 'active') {
      return this.paintItem(state, style);
    }
    return super.when(state, style);
  }

  private paintItem(state: 'hover' | 'focus' | 'active', style: WhenStyle): this {
    let css: string;
    if (typeof style === 'function') {
      const builder = createListItemPseudoStateBuilder();
      style(builder);
      css = builder.toCSSString();
    } else if (typeof style === 'string') {
      css = style;
    } else {
      const builder = createListItemPseudoStateBuilder();
      for (const [key, value] of Object.entries(style)) {
        if (value == null) continue;
        builder.css(key, String(value));
      }
      css = builder.toCSSString();
    }
    if (state === 'hover') this._customItemHover = css;
    else if (state === 'active') this._customItemActive = css;
    else this._customItemFocus = css;
    return this;
  }

  build(): ReactElement {
    const items = this._source
      ? this._source.value
      : this._itemsFn
        ? materializeListEntries<T>(this._itemsFn())
        : this._items;
    const props = {
      items,
      renderItem: this._renderItem,
      onItemPress: this._onItemPress,
      variant: this._variant,
      separator: this._separator,
      loading: this._loading,
      threshold: this._threshold,
      onEndReached: this._onEndReached,
      containerHeight: this._containerHeight,
      resetItemStyles: this._resetItemStyles,
      direction: this._direction,
      customItemHover: this._customItemHover,
      customItemActive: this._customItemActive,
      customItemFocus: this._customItemFocus,
      itemStyle: this._itemStyle,
      empty: this._empty,
      className: this.getClassName(),
      style: this.getStyle()
    };
    return React.createElement(ListInner, props);
  }
}

export const List = createBuilder(ListBuilder);
export { ListItemStyleBuilder } from './ListItemStyleBuilder';

export interface ListProps<T = any> extends BaseProps {
  items: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  variant?: ListVariant;
  separator?: boolean;
  containerHeight?: number;
  itemStyle?: CSSProperties;
  empty?: FiboChild | (() => FiboChild);
}
