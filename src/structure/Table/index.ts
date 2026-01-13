import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { Box } from '../Box';

type TableVariant = 'default' | 'clean';
type TableDensity = 'compact' | 'standard' | 'relaxed';

export interface TableColumn<T = any> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

const TableInner = React.memo((props: any) => {
    const {
        data,
        columns,
        variant,
        density,
        striped,
        width,
        className,
        style
    } = props;

    const tableStyles: React.CSSProperties = {
       width: '100%',
       borderCollapse: 'separate',
       borderSpacing: '0',
       ...style
    };

    if (width) {
        tableStyles.width = typeof width === 'number' ? `${width}px` : width;
    }

    const containerClass = variant === 'clean'
       ? ['bg-white', 'rounded-2xl', 'border', 'border-gray-100', 'overflow-hidden', 'shadow-sm']
       : [];

    const cellPadding: Record<TableDensity, string> = {
        compact: '10px 16px',
        standard: '16px 24px',
        relaxed: '24px 32px'
    };
    const padding = cellPadding[density as TableDensity];

    return Box()
       .className(className)
       .classNames(containerClass)
       .children(
          React.createElement('table', { style: tableStyles }, [

             React.createElement('thead', { key: 'thead', className: 'bg-gray-50/50' },
                React.createElement('tr', {},
                   columns.map((col: any, i: number) =>
                      React.createElement('th', {
                          key: i,
                          style: {
                              textAlign: col.align || 'left',
                              padding: padding,
                              width: col.width
                          },
                          className: 'text-xs font-bold text-gray-400 uppercase tracking-widest'
                      }, col.header)
                   )
                )
             ),

             React.createElement('tbody', { key: 'tbody' },
                 data.map((row: any, i: number) =>
                     React.createElement('tr', {
                         key: i,

                         className: `group transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                             striped && i % 2 !== 0 ? 'bg-gray-50/30' : 'bg-transparent'
                         } ${variant === 'clean' ? 'hover:bg-white hover:shadow-md hover:scale-[1.002] hover:z-10 relative' : 'hover:bg-gray-50/50'}`
                     },
                     columns.map((col: any, j: number) =>
                         React.createElement('td', {
                             key: j,
                             style: {
                                 textAlign: col.align || 'left',
                                 padding: padding,
                                 borderTop: variant === 'default' ? '1px solid #F3F4F6' : 'none'
                             },
                             className: 'text-sm text-gray-900 font-medium'
                         },
                          col.render ? col.render(row) : (col.accessor ? row[col.accessor] as ReactNode : null)
                         )
                     )
                     )
                 )
             )
          ])
       ).build();
});

class TableBuilder<T = any> extends FiboBuilder {
  private _data: T[] = [];
  private _columns: TableColumn<T>[] = [];
  private _variant: TableVariant = 'clean';
  private _density: TableDensity = 'standard';
  private _striped: boolean = false;
  private _width: string | number | undefined;

  data(items: T[]): this {
    this._data = items;
    return this;
  }

  columns(cols: TableColumn<T>[]): this {
    this._columns = cols;
    return this;
  }

  variant(variant: TableVariant): this {
    this._variant = variant;
    return this;
  }

  density(density: TableDensity): this {
    this._density = density;
    return this;
  }

  striped(enable: boolean = true): this {
    this._striped = enable;
    return this;
  }

  width(value: string | number): this {
    this._width = value;
    return this;
  }

  build(): ReactElement {
     const props = {
         data: this._data,
         columns: this._columns,
         variant: this._variant,
         density: this._density,
         striped: this._striped,
         width: this._width,
         className: this.getClassName(),
         style: this.getStyle()
     };
     return React.createElement(TableInner, props);
  }
}

export const Table = createBuilder(TableBuilder);

export interface TableProps<T = any> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  variant?: TableVariant;
  density?: TableDensity;
  striped?: boolean;
}
