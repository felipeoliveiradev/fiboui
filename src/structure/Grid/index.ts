import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { reactListKey } from '../../core/children';
import { toMediaQuery } from '../../core/breakpoints';
import { StyleManager } from '../../core/styleManager';
import { BaseProps } from '../../core/types';

type GridVariant = 'standard' | 'masonry' | 'bento';
type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | number;
type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridAutoFlow = 'row' | 'column' | 'dense';

interface ResponsiveCols {
    sm?: GridCols;
    md?: GridCols;
    lg?: GridCols;
    xl?: GridCols;
}

const GAP_PX: Record<string, string> = {
    none: '0px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
};

function repeatCols(n: number): string {
    return `repeat(${n}, minmax(0, 1fr))`;
}

function repeatRows(n: number): string {
    return `repeat(${n}, minmax(0, auto))`;
}

/** Numeric `.columns()` repeat, unless `.templateColumns()` was set. */
function resolveTemplateColumns(
    columns: GridCols | ResponsiveCols,
    templateColumns?: string
): string {
    if (templateColumns) return templateColumns;
    return typeof columns === 'number' ? repeatCols(columns) : repeatCols(1);
}

function resolveTemplateRows(rows?: number, templateRows?: string): string | undefined {
    if (templateRows) return templateRows;
    if (typeof rows === 'number') return repeatRows(rows);
    return undefined;
}

function gapCss(g: GridGap | string): string {
    if (typeof g === 'number') return `${g}px`;
    return GAP_PX[g] ?? (g || '16px');
}

/** Longhands win over the `gap` shorthand so `.rowGap()` / `.columnGap()` are not clobbered. */
function resolveGapStyle(
    gapValue: string,
    rowGap?: GridGap | string,
    columnGap?: GridGap | string
): CSSProperties {
    if (rowGap == null && columnGap == null) return { gap: gapValue };
    return {
        ...(rowGap != null ? { rowGap: gapCss(rowGap) } : { rowGap: gapValue }),
        ...(columnGap != null ? { columnGap: gapCss(columnGap) } : { columnGap: gapValue }),
    };
}

function childNodes(children: ReactNode): ReactNode[] {
    if (children == null || children === false) return [];
    return Array.isArray(children) ? children : [children];
}

function responsiveColClasses(columns: GridCols | ResponsiveCols, kind: 'grid' | 'masonry'): string[] {
    if (typeof columns === 'number') return [];
    const styles = StyleManager.getInstance();
    const keys: (keyof ResponsiveCols)[] = ['sm', 'md', 'lg', 'xl'];
    const out: string[] = [];
    for (const key of keys) {
        const n = columns[key];
        if (!n) continue;
        const mq = toMediaQuery(key);
        if (kind === 'masonry') {
            out.push(styles.registerMedia(mq, 'column-count', String(n)));
        } else {
            out.push(styles.registerMedia(mq, 'grid-template-columns', repeatCols(n)));
        }
    }
    return out;
}

function hasExplicitSpan(child: ReactNode): boolean {
    if (!React.isValidElement(child)) return false;
    const p = child.props as {
        className?: unknown;
        colSpan?: unknown;
        rowSpan?: unknown;
        colStart?: unknown;
        colEnd?: unknown;
        rowStart?: unknown;
        rowEnd?: unknown;
    };
    if (p && typeof p === 'object') {
        if (p.colSpan || p.rowSpan) return true;
        if (p.colStart != null || p.colEnd != null || p.rowStart != null || p.rowEnd != null) return true;
        if (typeof p.className === 'string' && /(col|row)-span/.test(p.className)) return true;
    }
    return false;
}

const GridInner = React.memo((props: any) => {
    const {
        children,
        variant = 'standard',
        columns = 1,
        gap = 'md',
        rows,
        templateColumns,
        templateRows,
        autoFlow,
        rowGap,
        columnGap,
        className,
        style,
        ...rest
    } = props;

    const nodes = childNodes(children);
    const gapValue = gapCss(gap);
    const gapStyle = resolveGapStyle(gapValue, rowGap, columnGap);
    const colsTemplate = resolveTemplateColumns(columns, templateColumns);
    const rowsTemplate = resolveTemplateRows(rows, templateRows);

    if (variant === 'bento') {
        const pattern = [
            { col: 2, row: 2 },
            { col: 1, row: 1 },
            { col: 1, row: 1 },
            { col: 1, row: 2 },
            { col: 2, row: 1 },
        ];

        const hostStyle: CSSProperties = {
            display: 'grid',
            gridTemplateColumns: colsTemplate,
            ...(rowsTemplate ? { gridTemplateRows: rowsTemplate } : {}),
            ...gapStyle,
            gridAutoFlow: autoFlow ?? 'dense',
            ...style,
        };

        return React.createElement('div', {
            className: ['fibo-grid', 'grid', ...responsiveColClasses(columns, 'grid'), className].filter(Boolean).join(' '),
            style: hostStyle,
            ...rest
        }, React.Children.map(nodes, (child, index) => {
            if (hasExplicitSpan(child)) {
                return child;
            }
            const span = pattern[index % pattern.length];
            return React.createElement('div', {
                key: reactListKey(child, index),
                style: { gridColumn: `span ${span.col}`, gridRow: `span ${span.row}` }
            }, child);
        }));
    }

    if (variant === 'masonry') {
        const masonryColumnGap = columnGap != null ? gapCss(columnGap) : gapValue;
        const masonryRowGap = rowGap != null ? gapCss(rowGap) : gapValue;
        const hostStyle: CSSProperties = {
            columnCount: typeof columns === 'number' ? columns : 1,
            columnGap: masonryColumnGap,
            ...style,
        };

        return React.createElement('div', {
            className: ['fibo-grid', ...responsiveColClasses(columns, 'masonry'), className].filter(Boolean).join(' '),
            style: hostStyle,
            ...rest
        }, React.Children.map(nodes, (child, index) =>
            React.createElement('div', {
                key: reactListKey(child, index),
                style: { breakInside: 'avoid', marginBottom: masonryRowGap }
            }, child)
        ));
    }

    const hostStyle: CSSProperties = {
        display: 'grid',
        gridTemplateColumns: colsTemplate,
        ...(rowsTemplate ? { gridTemplateRows: rowsTemplate } : {}),
        ...(autoFlow ? { gridAutoFlow: autoFlow } : {}),
        ...gapStyle,
        ...style,
    };

    return React.createElement('div', {
        className: ['fibo-grid', 'grid', ...responsiveColClasses(columns, 'grid'), className].filter(Boolean).join(' '),
        style: hostStyle,
        ...rest
    }, ...nodes);
});

const GridItemInner = React.memo((props: any) => {
    const {
        children,
        colSpan,
        rowSpan,
        colStart,
        colEnd,
        rowStart,
        rowEnd,
        className,
        style,
        ...rest
    } = props;
    const nodes = childNodes(children);

    const spanClass = [
        colSpan ? `col-span-${colSpan}` : '',
        rowSpan ? `row-span-${rowSpan}` : '',
    ].filter(Boolean).join(' ');

    const spanStyle: CSSProperties = {
        ...(colSpan ? { gridColumn: `span ${colSpan}` } : {}),
        ...(rowSpan ? { gridRow: `span ${rowSpan}` } : {}),
        ...(colStart != null ? { gridColumnStart: colStart } : {}),
        ...(colEnd != null ? { gridColumnEnd: colEnd } : {}),
        ...(rowStart != null ? { gridRowStart: rowStart } : {}),
        ...(rowEnd != null ? { gridRowEnd: rowEnd } : {}),
        ...style,
    };

    return React.createElement('div', {
        className: ['fibo-grid-item', spanClass, className].filter(Boolean).join(' '),
        style: spanStyle,
        ...rest
    }, ...nodes);
});

class GridBuilder extends FiboBuilder {
  private _variant: GridVariant = 'standard';
  private _columns: GridCols | ResponsiveCols = 1;
  private _gap: GridGap = 'md';
  private _rowGap?: GridGap | string;
  private _columnGap?: GridGap | string;
  private _rows?: number;
  private _templateColumns?: string;
  private _templateRows?: string;
  private _autoFlow?: GridAutoFlow;

  variant(v: GridVariant): this {
    this._variant = v;
    return this;
  }

  columns(cols: GridCols | ResponsiveCols): this {
    this._columns = cols;
    return this;
  }

  rows(count: number): this {
    this._rows = count;
    return this;
  }

  gap(g: GridGap): this {
    this._gap = g;
    return this;
  }

  rowGap(g: GridGap | string | number): this {
    this._rowGap = g;
    return this;
  }

  columnGap(g: GridGap | string | number): this {
    this._columnGap = g;
    return this;
  }

  templateColumns(template: string): this {
    this._templateColumns = template;
    return this;
  }

  /** CSS name — same as `.templateColumns()`, wins over numeric `.columns()`. */
  gridTemplateColumns(template: string): this {
    return this.templateColumns(template);
  }

  templateRows(template: string): this {
    this._templateRows = template;
    return this;
  }

  autoFlow(flow: GridAutoFlow): this {
    this._autoFlow = flow;
    return this;
  }

  build(): ReactElement {
    const props = {
        variant: this._variant,
        columns: this._columns,
        gap: this._gap,
        rowGap: this._rowGap,
        columnGap: this._columnGap,
        rows: this._rows,
        templateColumns: this._templateColumns,
        templateRows: this._templateRows,
        autoFlow: this._autoFlow,
        children: this.processChildren(),
        className: this.getClassName(),
        style: this.getStyle(),
        ...this._props
    };

    return React.createElement(GridInner, props);
  }
}

class GridItemBuilder extends FiboBuilder {
    private _colSpan?: number;
    private _rowSpan?: number;
    private _colStart?: number;
    private _colEnd?: number;
    private _rowStart?: number;
    private _rowEnd?: number;

    colSpan(span: number): this {
        this._colSpan = span;
        return this;
    }

    rowSpan(span: number): this {
        this._rowSpan = span;
        return this;
    }

    colStart(start: number): this {
        this._colStart = start;
        return this;
    }

    colEnd(end: number): this {
        this._colEnd = end;
        return this;
    }

    rowStart(start: number): this {
        this._rowStart = start;
        return this;
    }

    rowEnd(end: number): this {
        this._rowEnd = end;
        return this;
    }

    build(): ReactElement {
        const props = {
            colSpan: this._colSpan,
            rowSpan: this._rowSpan,
            colStart: this._colStart,
            colEnd: this._colEnd,
            rowStart: this._rowStart,
            rowEnd: this._rowEnd,
            children: this.processChildren(),
            className: this.getClassName(),
            style: this.getStyle(),
            ...this._props
        };
        return React.createElement(GridItemInner, props);
    }
}

export const Grid = createBuilder(GridBuilder);

export const GridItem = createBuilder(GridItemBuilder);

export interface GridProps extends BaseProps {
  variant?: GridVariant;
  columns?: GridCols | ResponsiveCols;
  gap?: GridGap;
  rowGap?: GridGap | string;
  columnGap?: GridGap | string;
  rows?: number;
  templateColumns?: string;
  templateRows?: string;
  autoFlow?: GridAutoFlow;
}
