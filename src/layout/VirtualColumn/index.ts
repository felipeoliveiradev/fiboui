import React, { ReactElement, ReactNode, useRef, useState, useLayoutEffect } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps } from '../../core/types';

interface VirtualColumnInnerProps {
  children: ReactNode[];
  itemHeight?: number;
  estimatedItemHeight?: number;
  measureItems?: boolean;
  overscan?: number;
  containerHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VirtualColumnInner = React.memo((props: VirtualColumnInnerProps) => {
  const {
    children,
    itemHeight,
    estimatedItemHeight = 50,
    measureItems = false,
    overscan = 5,
    containerHeight = 500,
    className,
    style
  } = props;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const heightCache = useRef<Map<number, number>>(new Map());

  const itemCount = children.length;
  const isFixedHeight = itemHeight !== undefined;

  const getItemHeight = (index: number): number => {
    if (isFixedHeight) return itemHeight;
    return heightCache.current.get(index) ?? estimatedItemHeight;
  };

  const getItemOffset = (index: number): number => {
    if (isFixedHeight) {
      return index * itemHeight;
    }

    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  };

  const getTotalHeight = (): number => {
    if (isFixedHeight) {
      return itemCount * itemHeight;
    }

    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      total += getItemHeight(i);
    }
    return total;
  };

  const findStartIndex = (scrollTop: number): number => {
    if (isFixedHeight) {
      return Math.floor(scrollTop / itemHeight);
    }

    let low = 0;
    let high = itemCount - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const offset = getItemOffset(mid);

      if (offset < scrollTop) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return Math.max(0, low - 1);
  };

  const startIndex = Math.max(0, findStartIndex(scrollTop) - overscan);

  let endIndex: number;
  if (isFixedHeight) {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    endIndex = Math.min(itemCount, startIndex + visibleCount + overscan * 2);
  } else {
    let currentOffset = getItemOffset(startIndex);
    let index = startIndex;

    while (currentOffset < scrollTop + containerHeight + (overscan * estimatedItemHeight) && index < itemCount) {
      currentOffset += getItemHeight(index);
      index++;
    }

    endIndex = Math.min(itemCount, index);
  }

  const visibleItems = children.slice(startIndex, endIndex);
  const startOffset = getItemOffset(startIndex);
  const totalHeight = getTotalHeight();

  useLayoutEffect(() => {
    if (!measureItems || isFixedHeight) return;

    visibleItems.forEach((_, i) => {
      const actualIndex = startIndex + i;
      const element = itemRefs.current.get(actualIndex);

      if (element) {
        const rect = element.getBoundingClientRect();
        const measuredHeight = rect.height;

        if (measuredHeight > 0) {
          const cachedHeight = heightCache.current.get(actualIndex);
          if (cachedHeight !== measuredHeight) {
            heightCache.current.set(actualIndex, measuredHeight);
          }
        }
      }
    });
  }, [visibleItems, startIndex, measureItems, isFixedHeight]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return React.createElement(
    'div',
    {
      ref: containerRef,
      className: `fibo-virtual-column ${className || ''}`,
      style: {
        height: `${containerHeight}px`,
        overflowY: 'auto',
        position: 'relative',
        ...style
      },
      onScroll: onScroll
    },
    React.createElement('div', {
      style: {
        height: `${totalHeight}px`,
        width: '1px',
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
          transform: `translateY(${startOffset}px)`,
          width: '100%'
        }
      },
      visibleItems.map((child, i) => {
        const actualIndex = startIndex + i;

        // Clone child with key and ref instead of wrapping in div
        return React.cloneElement(
          child as React.ReactElement,
          {
            key: actualIndex,
            ref: (el: HTMLElement | null) => {
              if (el && measureItems && !isFixedHeight) {
                itemRefs.current.set(actualIndex, el as HTMLDivElement);
              } else if (!el) {
                itemRefs.current.delete(actualIndex);
              }
            }
          }
        );
      })
    )
  );
});

class VirtualColumnBuilder extends FiboBuilder {
  private _itemHeight?: number;
  private _estimatedItemHeight?: number;
  private _measureItems: boolean = false;
  private _overscan: number = 5;
  private _containerHeight: number = 500;

  itemHeight(height: number): this {
    this._itemHeight = height;
    return this;
  }

  estimatedItemHeight(height: number): this {
    this._estimatedItemHeight = height;
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

  containerHeight(height: number): this {
    this._containerHeight = height;
    return this;
  }

  build(): ReactElement {
    const children = this.processChildren();

    const props: VirtualColumnInnerProps = {
      children,
      itemHeight: this._itemHeight,
      estimatedItemHeight: this._estimatedItemHeight,
      measureItems: this._measureItems,
      overscan: this._overscan,
      containerHeight: this._containerHeight,
      className: this.getClassName(),
      style: this.getStyle()
    };

    return React.createElement(VirtualColumnInner, props);
  }
}

export const VirtualColumn = createBuilder(VirtualColumnBuilder);

export interface VirtualColumnProps extends ChildrenProps {
  itemHeight?: number;
  estimatedItemHeight?: number;
  measureItems?: boolean;
  overscan?: number;
  containerHeight?: number;
}
