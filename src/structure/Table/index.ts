import React, { ReactElement, ReactNode, useSyncExternalStore } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { FineGrainText } from '../../core/FineGrain';
import { ListSignal } from '../../core/listSignal';
import type { BindableSignal } from '../../core/state';
import { BaseProps } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { Box } from '../Box';

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

type TableVariant = 'default' | 'clean';
type TableDensity = 'compact' | 'standard' | 'relaxed';

function isListSource<T>(value: unknown): value is BindableSignal<T[]> {
  return (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof (value as BindableSignal<T[]>).subscribe === 'function' &&
    'value' in (value as object)
  );
}

function tableRowKey(row: unknown, index: number): string | number {
  if (row != null && typeof row === 'object') {
    const rec = row as { _id?: unknown; id?: unknown; key?: unknown };
    if (rec._id != null && rec._id !== '') return rec._id as string | number;
    if (rec.id != null && rec.id !== '') return rec.id as string | number;
    if (rec.key != null && rec.key !== '') return rec.key as string | number;
  }
  return index;
}

function rawCellValue(row: any, col: TableColumn): unknown {
  if (typeof col.render === 'function') return col.render(row);
  if (row == null || typeof row !== 'object' || col.accessor == null || col.accessor === '') {
    return null;
  }
  return row[col.accessor];
}

function tableCellNode(raw: unknown): ReactNode {
  if (typeof raw === 'string' && hasInterpMarks(raw)) {
    return React.createElement(FineGrainText, {
      as: 'span',
      compute: () => resolveInterpString(raw),
    });
  }
  return buildChild(raw);
}

export interface TableColumn<T = any> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** When true, this header sorts even if the table is not `.sortable()`. `false` opts out. */
  sortable?: boolean;
}

type SortDir = 'ascending' | 'descending';

interface ColumnSort {
  index: number;
  dir: SortDir;
}

function columnIsSortable(col: TableColumn, tableSortable: boolean): boolean {
  if (col.sortable === false) return false;
  if (col.sortable === true) return true;
  return tableSortable;
}

function sortKey(row: any, col: TableColumn): string | number | boolean | null {
  if (row != null && typeof row === 'object' && col.accessor != null && col.accessor !== '') {
    const value = row[col.accessor as string];
    if (
      value == null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value ?? null;
    }
  }
  if (typeof col.render !== 'function') return null;
  const rendered = col.render(row);
  if (
    rendered == null ||
    typeof rendered === 'string' ||
    typeof rendered === 'number' ||
    typeof rendered === 'boolean'
  ) {
    return rendered ?? null;
  }
  return null;
}

function compareSortKeys(
  a: string | number | boolean | null,
  b: string | number | boolean | null,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function nextSort(current: ColumnSort | null, index: number): ColumnSort {
  if (!current || current.index !== index) return { index, dir: 'ascending' };
  return { index, dir: current.dir === 'ascending' ? 'descending' : 'ascending' };
}

function tableRowClass(variant: TableVariant, striped: boolean, index: number): string {
  return `group transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
    striped && index % 2 !== 0 ? 'bg-gray-50/30' : 'bg-transparent'
  } ${variant === 'clean' ? 'hover:bg-white hover:shadow-md hover:scale-[1.002] hover:z-10 relative' : 'hover:bg-gray-50/50'}`;
}

function tableRowElement(
  row: any,
  index: number,
  columns: TableColumn[],
  variant: TableVariant,
  striped: boolean,
  padding: string,
): React.ReactElement {
  return React.createElement(
    'tr',
    {
      key: tableRowKey(row, index),
      className: tableRowClass(variant, striped, index),
    },
    columns.map((col: any, j: number) =>
      React.createElement(
        'td',
        {
          key: j,
          style: {
            textAlign: col.align || 'left',
            padding,
            borderTop: variant === 'default' ? '1px solid #F3F4F6' : 'none',
          },
          className: 'text-sm text-gray-900 font-medium',
        },
        tableCellNode(rawCellValue(row, col)),
      ),
    ),
  );
}

const LiveTableRow = React.memo(function LiveTableRow(props: {
  list: ListSignal<any>;
  id: string;
  index: number;
  columns: TableColumn[];
  variant: TableVariant;
  striped: boolean;
  padding: string;
}) {
  const version = useSyncExternalStore(
    (notify) => props.list.subscribeItem(props.id, notify),
    () => props.list.itemVersion(props.id),
    () => props.list.itemVersion(props.id),
  );
  void version;
  const row = props.list.find(props.id);
  if (row == null) return null;
  return tableRowElement(
    row,
    props.index,
    props.columns,
    props.variant,
    props.striped,
    props.padding,
  );
}, (prev, next) => (
  prev.list === next.list
  && prev.id === next.id
  && prev.columns === next.columns
  && prev.variant === next.variant
  && prev.striped === next.striped
  && prev.padding === next.padding
));

const TableInner = React.memo((props: any) => {
    const {
        data: incomingData,
        liveList,
        columns,
        variant,
        density,
        striped,
        width,
        sortable,
        className,
        style,
        children: _children,
        ...rest
    } = props;

    const tableSortable = Boolean(sortable);
    const [sort, setSort] = React.useState<ColumnSort | null>(null);

    const structureVersion = useSyncExternalStore(
      (notify) => (liveList ? liveList.subscribeStructure(notify) : () => {}),
      () => (liveList ? liveList.structureVersion() : 0),
      () => (liveList ? liveList.structureVersion() : 0),
    );
    void structureVersion;

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
    const sourceRows = liveList
      ? liveList.value
      : (Array.isArray(incomingData) ? incomingData : []);
    const rows = React.useMemo(() => {
        if (!sort) return sourceRows;
        const col = columns?.[sort.index] as TableColumn | undefined;
        if (!col || !columnIsSortable(col, tableSortable)) return sourceRows;
        const sign = sort.dir === 'ascending' ? 1 : -1;
        return sourceRows
            .map((row: any, index: number) => ({ row, index }))
            .sort((a: { row: any; index: number }, b: { row: any; index: number }) => {
                const cmp = compareSortKeys(sortKey(a.row, col), sortKey(b.row, col));
                return cmp === 0 ? a.index - b.index : sign * cmp;
            })
            .map((entry: { row: any; index: number }) => entry.row);
    }, [sourceRows, columns, sort, tableSortable]);

    return Box()
       .className(className)
       .classNames(containerClass)
       .props(rest)
       .children(
          React.createElement('table', {
             style: tableStyles,
             className: ['fibo-table', className].filter(Boolean).join(' '),
          }, [

             React.createElement('thead', { key: 'thead', className: 'bg-gray-50/50' },
                React.createElement('tr', {},
                   columns.map((col: any, i: number) => {
                      const canSort = columnIsSortable(col, tableSortable);
                      return React.createElement('th', {
                          key: String(col.accessor ?? i),
                          scope: 'col',
                          style: {
                              textAlign: col.align || 'left',
                              padding: padding,
                              width: col.width,
                              cursor: canSort ? 'pointer' : undefined,
                          },
                          className: 'text-xs font-bold text-gray-400 uppercase tracking-widest',
                          'aria-sort': canSort
                              ? (sort?.index === i ? sort.dir : 'none')
                              : undefined,
                          tabIndex: canSort ? 0 : undefined,
                          onClick: canSort ? () => setSort((current) => nextSort(current, i)) : undefined,
                          onKeyDown: canSort
                              ? (event: React.KeyboardEvent) => {
                                  if (event.key !== 'Enter' && event.key !== ' ') return;
                                  event.preventDefault();
                                  setSort((current) => nextSort(current, i));
                              }
                              : undefined,
                      }, resolveInterp(col.header) ?? col.header);
                   })
                )
             ),

             React.createElement('tbody', { key: 'tbody' },
                 rows.map((row: any, i: number) => {
                   if (liveList && row && typeof row._id === 'string' && row._id.length > 0) {
                     return React.createElement(LiveTableRow, {
                       key: row._id,
                       list: liveList,
                       id: row._id,
                       index: i,
                       columns,
                       variant,
                       striped: Boolean(striped),
                       padding,
                     });
                   }
                   return tableRowElement(row, i, columns, variant, Boolean(striped), padding);
                 })
             )
          ])
       ).build();
});

class TableBuilder<T = any> extends FiboBuilder {
  private _data: T[] = [];
  /** Plain `signal(array)`. Read on each rebuild. */
  private _source?: BindableSignal<T[]>;
  /** `listSignal`. Rows subscribe by `_id`. */
  private _liveList?: ListSignal<any>;
  private _columns: TableColumn<T>[] = [];
  private _variant: TableVariant = 'clean';
  private _density: TableDensity = 'standard';
  private _striped: boolean = false;
  private _width: string | number | undefined;
  private _sortable: boolean = false;

  data(items: T[] | BindableSignal<T[]>): this {
    if (items instanceof ListSignal) {
      this._liveList = items;
      this._source = undefined;
      return this;
    }
    this._liveList = undefined;
    if (isListSource<T>(items)) {
      this._source = items;
      this.bindSignal(items);
      return this;
    }
    this._source = undefined;
    this._data = items;
    return this;
  }

  columns(cols: TableColumn<T>[]): this {
    this._columns = cols;
    for (const col of cols) bindInterp(this, col.header);
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

  /** Header clicks sort that column ascending, then descending (`aria-sort`). */
  sortable(enable: boolean = true): this {
    this._sortable = enable;
    return this;
  }

  build(): ReactElement {
     const liveList = this._liveList;
     const props = {
         data: liveList ? [] : (this._source ? this._source.value : this._data),
         liveList,
         columns: this._columns,
         variant: this._variant,
         density: this._density,
         striped: this._striped,
         width: this._width,
         sortable: this._sortable,
         className: this.getClassName(),
         style: this.getStyle(),
         ...this._props
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
  sortable?: boolean;
}
