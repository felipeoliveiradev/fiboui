'use client';

import React, { ReactElement, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { normalizeFiboChildren, reactListKey } from '../../core/children';
import { ChildrenProps, FiboChildren } from '../../core/types';

const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect;

type ItemCacheKey = string | number;

function itemCacheKey(child: ReactNode, index: number): ItemCacheKey {
  return reactListKey(child, index);
}

interface VirtualRowInnerProps {
  children: ReactNode[];
  itemWidth?: number;
  estimatedItemWidth?: number;
  measureItems?: boolean;
  overscan?: number;
  containerWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VirtualRowInner = React.memo((props: VirtualRowInnerProps) => {
  const {
    children,
    itemWidth,
    estimatedItemWidth = 120,
    measureItems = false,
    overscan = 5,
    containerWidth = 500,
    className,
    style,
    ...rest
  } = props;

  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<ItemCacheKey, HTMLDivElement>>(new Map());
  const widthCache = useRef<Map<ItemCacheKey, number>>(new Map());

  const items = Array.isArray(children) ? children : children != null ? [children] : [];
  const itemCount = items.length;
  const isFixedWidth = itemWidth !== undefined;

  if (!isFixedWidth) {
    const liveKeys = new Set<ItemCacheKey>();
    for (let i = 0; i < itemCount; i++) {
      liveKeys.add(itemCacheKey(items[i], i));
    }
    for (const key of Array.from(widthCache.current.keys())) {
      if (!liveKeys.has(key)) {
        widthCache.current.delete(key);
        itemRefs.current.delete(key);
      }
    }
  }

  const getItemWidth = (index: number): number => {
    if (isFixedWidth) return itemWidth;
    return widthCache.current.get(itemCacheKey(items[index], index)) ?? estimatedItemWidth;
  };

  const getItemOffset = (index: number): number => {
    if (isFixedWidth) return index * itemWidth;
    let offset = 0;
    for (let i = 0; i < index; i++) offset += getItemWidth(i);
    return offset;
  };

  const getTotalWidth = (): number => {
    if (isFixedWidth) return itemCount * itemWidth;
    let total = 0;
    for (let i = 0; i < itemCount; i++) total += getItemWidth(i);
    return total;
  };

  const findStartIndex = (scroll: number): number => {
    if (isFixedWidth) return Math.floor(scroll / itemWidth);
    let low = 0;
    let high = itemCount - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (getItemOffset(mid) + getItemWidth(mid) <= scroll) low = mid + 1;
      else high = mid;
    }
    return low;
  };

  const startIndex = Math.max(0, findStartIndex(scrollLeft) - overscan);
  let endIndex = startIndex;
  let acc = getItemOffset(startIndex);
  while (endIndex < itemCount && acc < scrollLeft + containerWidth + overscan * estimatedItemWidth) {
    acc += getItemWidth(endIndex);
    endIndex += 1;
  }
  endIndex = Math.min(itemCount, endIndex + overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetLeft = getItemOffset(startIndex);

  useIsoLayoutEffect(() => {
    if (!measureItems || isFixedWidth) return;
    let changed = false;
    for (let i = startIndex; i < endIndex; i++) {
      const key = itemCacheKey(items[i], i);
      const el = itemRefs.current.get(key);
      if (!el) continue;
      const w = el.getBoundingClientRect().width;
      if (widthCache.current.get(key) !== w) {
        widthCache.current.set(key, w);
        changed = true;
      }
    }
    if (changed) setScrollLeft((s) => s);
  });

  return React.createElement(
    'div',
    {
      ...rest,
      ref: containerRef,
      className: ['fibo-virtual-row', className].filter(Boolean).join(' '),
      style: {
        overflowX: 'auto',
        overflowY: 'hidden',
        width: containerWidth,
        maxWidth: '100%',
        position: 'relative',
        ...style,
      },
      onScroll: (e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
      },
    },
    React.createElement(
      'div',
      {
        className: 'fibo-virtual-row-inner',
        style: {
          display: 'flex',
          flexDirection: 'row',
          width: getTotalWidth(),
          height: '100%',
          position: 'relative',
          paddingLeft: offsetLeft,
          boxSizing: 'content-box',
        },
      },
      visibleItems.map((child, i) => {
        const actualIndex = startIndex + i;
        const childKey = itemCacheKey(child, actualIndex);
        return React.createElement(
          'div',
          {
            key: childKey,
            ref: (el: HTMLDivElement | null): void => {
              if (el && measureItems && !isFixedWidth) itemRefs.current.set(childKey, el);
              else if (!el) itemRefs.current.delete(childKey);
            },
            style: { flex: '0 0 auto', height: '100%' },
          },
          child
        );
      })
    )
  );
});

class VirtualRowBuilder extends FiboBuilder {
  private _itemWidth?: number;
  private _estimatedItemWidth?: number;
  private _measureItems = false;
  private _overscan = 5;
  private _containerWidth = 500;

  itemWidth(width: number): this {
    this._itemWidth = width;
    return this;
  }

  estimatedItemWidth(width: number): this {
    this._estimatedItemWidth = width;
    return this;
  }

  measureItems(measure: boolean = true): this {
    this._measureItems = measure;
    return this;
  }

  overscan(count: number): this {
    this._overscan = count;
    return this;
  }

  containerWidth(width: number): this {
    this._containerWidth = width;
    return this;
  }

  build(): ReactElement {
    const {
      children: propsChildren,
      className: extraClass,
      style: extraStyle,
      ...dom
    } = this._props ?? {};

    const fromBuilder = this.processChildren();
    const children =
      propsChildren !== undefined
        ? normalizeFiboChildren(propsChildren as FiboChildren)
        : fromBuilder;

    return React.createElement(VirtualRowInner, {
      ...dom,
      children,
      itemWidth: this._itemWidth,
      estimatedItemWidth: this._estimatedItemWidth,
      measureItems: this._measureItems,
      overscan: this._overscan,
      containerWidth: this._containerWidth,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' '),
      style: extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle(),
    });
  }
}

export const VirtualRow = createBuilder(VirtualRowBuilder);

export interface VirtualRowProps extends ChildrenProps {
  itemWidth?: number;
  estimatedItemWidth?: number;
  measureItems?: boolean;
  overscan?: number;
  containerWidth?: number;
}
