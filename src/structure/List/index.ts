import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { Box } from '../Box';

type ListVariant = 'default' | 'card' | 'floating';

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
        style 
    } = props;

    const observerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
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

    const variantStyles: Record<ListVariant, any> = {
      default: { gap: '0px' },
      card: { gap: '12px' },
      floating: { gap: '8px' }
    };

    const itemContainerStyles: Record<ListVariant, any> = {
      default: {
        padding: '12px 16px',
        borderBottom: separator ? '1px solid #F3F4F6' : 'none',
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s'
      },
      card: {
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.05)',
        border: '1px solid #F3F4F6',
        transition: 'transform 0.2s, box-shadow 0.2s'
      },
      floating: {
        padding: '8px 12px',
        borderRadius: '12px',
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s'
      }
    };

    const variantClasses: Record<ListVariant, string[]> = {
      default: ['hover:bg-gray-50', 'first:rounded-t-xl', 'last:rounded-b-xl'],
      card: ['hover:-translate-y-0.5', 'hover:shadow-md'],
      floating: ['hover:bg-white', 'hover:shadow-sm']
    };

    return Box()
      .className(className)
      .classNames(['flex', 'flex-col', 'w-full'])
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
                     .children(
                       renderItem ? renderItem(item, index) : null
                     )
                     .build(),
                   { key: `item-${index}` }
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
  private _renderItem?: (item: T, index: number) => ReactNode;
  private _variant: ListVariant = 'default';
  private _separator: boolean = false;

  items(items: T[]): this {
    this._items = items;
    return this;
  }

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

  private _onEndReached?: () => void;
  private _loading: boolean = false;
  private _threshold: number = 0.5;

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

  build(): ReactElement {
     const props = {
         items: this._items,
         renderItem: this._renderItem,
         variant: this._variant,
         separator: this._separator,
         loading: this._loading,
         threshold: this._threshold,
         onEndReached: this._onEndReached,
         className: this.getClassName(),
         style: this.getStyle()
     };
     return React.createElement(ListInner, props);
  }
}


export const List = createBuilder(ListBuilder);

export interface ListProps<T = any> extends BaseProps {
  items: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  variant?: ListVariant;
  separator?: boolean;
}
