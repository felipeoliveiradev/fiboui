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
import { buildChild } from '../../core/children';
import { BaseProps, FiboChildren } from '../../core/types';
import type { BindableSignal } from '../../core/state';
import { Box } from '../Box';
import {
  ListItemPseudoStateBuilder,
  createListItemPseudoStateBuilder,
} from './ListItemPseudoStateBuilder';
import {
  ListItemStyleBuilder,
  createListItemStyleBuilder,
} from './ListItemStyleBuilder';
import type { CssFluentProxy } from '../../core/cssFluent';

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

function listItemKey(item: unknown, index: number): string {
  if (item != null && typeof item === 'object' && '_id' in (item as object)) {
    const id = (item as { _id?: unknown })._id;
    if (id != null && id !== '') return String(id);
  }
  return `item-${index}`;
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
  } = props;

  const reactId = React.useId();
  // useId() may include colons (e.g. `:r1:`) — invalid / awkward in CSS selectors & HTML ids.
  const listInstanceId = reactId.replace(/:/g, '');
  const listScopeClass = `fibo-list-${listInstanceId}`;
  const styleElementId = `fibo-list-custom-styles-${listInstanceId}`;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const heightCache = useRef<Map<number, number>>(new Map());
  const observerRef = useRef<HTMLDivElement>(null);
  const isHorizontal = direction === 'horizontal';

  const itemCount = items.length;
  const shouldVirtualize = itemCount > VIRTUALIZATION_THRESHOLD;

  const getItemHeight = (index: number): number => {
    return heightCache.current.get(index) ?? DEFAULT_ITEM_HEIGHT;
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
    if (!shouldVirtualize) return;

    let changed = false;
    visibleItems.forEach((_: unknown, i: number) => {
      const actualIndex = startIndex + i;
      const element = itemRefs.current.get(actualIndex);

      if (element) {
        const rect = element.getBoundingClientRect();
        const measured = isHorizontal ? rect.width : rect.height;

        if (measured > 0) {
          const cached = heightCache.current.get(actualIndex);
          if (cached !== measured) {
            heightCache.current.set(actualIndex, measured);
            changed = true;
          }
        }
      }
    });

    if (changed) {
      setLayoutVersion((version) => version + 1);
    }
  }, [visibleItems, startIndex, shouldVirtualize, isHorizontal, layoutVersion]);

  useLayoutEffect(() => {
    if (!onEndReached || loading) return;

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
      css += `${scope} .fibo-list-item-custom-hover:hover { ${withImportant(customItemHover)} }\n`;
    }

    if (customItemActive) {
      css += `${scope} .fibo-list-item-custom-active:active { ${withImportant(customItemActive)} }\n`;
    }

    if (customItemFocus) {
      // Items are divs without tabIndex — :focus never matches; :focus-within
      // covers focus on nested focusable content (links, buttons, inputs).
      css += `${scope} .fibo-list-item-custom-focus:focus-within { ${withImportant(customItemFocus)} }\n`;
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

  const customItemClasses: string[] = [];
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
          const renderedItem = resolveListItem(item, actualIndex, renderItem);

          return React.cloneElement(
            Box()
              .style(itemContainerStyles[variant as ListVariant])
              .classNames(variantClasses[variant as ListVariant])
              .children(renderedItem)
              .build() as React.ReactElement,
            {
              key: listItemKey(item, actualIndex),
              ref: (el: HTMLDivElement | null) => {
                if (el) {
                  itemRefs.current.set(actualIndex, el);
                } else {
                  itemRefs.current.delete(actualIndex);
                }
              }
            }
          );
        })
      ),
      onEndReached && React.createElement('div', {
        ref: observerRef,
        className: 'py-4 flex justify-center w-full'
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
        ...items.map((item: any, index: number) =>
          React.cloneElement(
            Box()
              .style(itemContainerStyles[variant as ListVariant])
              .classNames(variantClasses[variant as ListVariant])
              .children(resolveListItem(item, index, renderItem))
              .build(),
            { key: listItemKey(item, index) }
          )
        ),

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

  /**
   * Entries to show.
   *
   * - **UI mode** (same as `.children`): `List().items([ListTile()…, Text(…)])`
   * - **Data mode**: `List().items(rows).renderItem((row) => ListTile().title(row.name))`
   * - **Live list**: `List().items(listSignal).renderItem((row) => ListTile().title(row.title))`
   */
  items(items: T[] | FiboChildren | BindableSignal<T[]>): this {
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
  private setListEntries(entries: T[] | FiboChildren): this {
    const raw =
      typeof entries === 'function'
        ? (entries as () => unknown)()
        : entries;
    const arr = (Array.isArray(raw) ? raw : [raw]).filter(
      (x) => x !== undefined && x !== null && x !== false
    );
    this._items = arr as T[];
    // Keep FiboBuilder._children aligned (devtools / processChildren).
    super.children(arr as FiboChildren);
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
   *   .itemHover((h) => h.bg('#f3f4f6'))
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
      this._itemStyle = { ...this._itemStyle, ...style };
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

  itemHover(
    callback:
      | ((builder: ListItemPseudoStateBuilder & CssFluentProxy) => void | ListItemPseudoStateBuilder | CssFluentProxy)
      | string
  ): this {
    if (typeof callback === 'function') {
      const builder = createListItemPseudoStateBuilder();
      callback(builder);
      this._customItemHover = builder.toCSSString();
    } else {
      this._customItemHover = callback;
    }
    return this;
  }

  itemActive(
    callback:
      | ((builder: ListItemPseudoStateBuilder & CssFluentProxy) => void | ListItemPseudoStateBuilder | CssFluentProxy)
      | string
  ): this {
    if (typeof callback === 'function') {
      const builder = createListItemPseudoStateBuilder();
      callback(builder);
      this._customItemActive = builder.toCSSString();
    } else {
      this._customItemActive = callback;
    }
    return this;
  }

  itemFocus(
    callback:
      | ((builder: ListItemPseudoStateBuilder & CssFluentProxy) => void | ListItemPseudoStateBuilder | CssFluentProxy)
      | string
  ): this {
    if (typeof callback === 'function') {
      const builder = createListItemPseudoStateBuilder();
      callback(builder);
      this._customItemFocus = builder.toCSSString();
    } else {
      this._customItemFocus = callback;
    }
    return this;
  }

  build(): ReactElement {
    const items = this._source ? this._source.value : this._items;
    const props = {
      items,
      renderItem: this._renderItem,
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
}
