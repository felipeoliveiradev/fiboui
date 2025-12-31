import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

type GridVariant = 'standard' | 'masonry' | 'bento';
type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl' | number;
type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface ResponsiveCols {
    sm?: GridCols;
    md?: GridCols;
    lg?: GridCols;
    xl?: GridCols;
}

const GridInner = React.memo((props: any) => {
    const { 
        children, 
        variant = 'standard', 
        columns = 1, 
        gap = 'md', 
        className, 
        style, 
        ...rest 
    } = props;

    
    const getGapClass = (g: GridGap) => {
        if (typeof g === 'number') return ''; 
        const gaps: Record<string, string> = {
            none: 'gap-0',
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-8'
        };
        return gaps[g] || 'gap-4';
    };

    const getGapStyle = (g: GridGap) => {
        if (typeof g === 'number') return g + 'px';
        return undefined;
    };

    
    const getColsClass = (cols: GridCols | ResponsiveCols) => {
        if (typeof cols === 'number') return `grid-cols-${cols}`;
        
        
        let classes = [];
        if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
        if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
        if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
        if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
        
        
        return classes.join(' ') || 'grid-cols-1';
    };

    
    if (variant === 'masonry') {
        const getMasonryColsClass = (cols: GridCols | ResponsiveCols) => {
            if (typeof cols === 'number') return `columns-${cols}`;
            let classes = [];
            if (cols.sm) classes.push(`sm:columns-${cols.sm}`);
            if (cols.md) classes.push(`md:columns-${cols.md}`);
            if (cols.lg) classes.push(`lg:columns-${cols.lg}`);
            if (cols.xl) classes.push(`xl:columns-${cols.xl}`);
            return classes.join(' ') || 'columns-1';
        };

        return React.createElement('div', {
            className: `${getMasonryColsClass(columns)} ${getGapClass(gap)} space-y-4 ${className}`,
            style: { 
                columnGap: getGapStyle(gap),
                ...style 
            },
            ...rest
        }, React.Children.map(children, child => 
            React.createElement('div', { className: 'break-inside-avoid mb-4' }, child)
        ));
    }

    
    return React.createElement('div', {
        className: `grid ${getColsClass(columns)} ${getGapClass(gap)} ${className}`,
        style: { 
            gap: getGapStyle(gap),
            ...style 
        },
        ...rest
    }, children);
});


const GridItemInner = React.memo((props: any) => {
    const { children, colSpan, rowSpan, className, style, ...rest } = props;

    const getSpanClass = () => {
        let classes = [];
        if (colSpan) classes.push(`col-span-${colSpan}`);
        if (rowSpan) classes.push(`row-span-${rowSpan}`);
        return classes.join(' ');
    };

    return React.createElement('div', {
        className: `${getSpanClass()} ${className}`,
        style,
        ...rest
    }, children);
});


class GridBuilder extends FiboBuilder {
  private _variant: GridVariant = 'standard';
  private _columns: GridCols | ResponsiveCols = 1;
  private _gap: GridGap = 'md';
  protected _children: ReactNode[] = [];

  variant(v: GridVariant): this {
    this._variant = v;
    return this;
  }

  columns(cols: GridCols | ResponsiveCols): this {
    this._columns = cols;
    return this;
  }

  gap(g: GridGap): this {
    this._gap = g;
    return this;
  }

  children(nodes: ReactNode[]): this {
    this._children = nodes;
    return this;
  }

  build(): ReactElement {
    const props = {
        variant: this._variant,
        columns: this._columns,
        gap: this._gap,
        children: this._children,
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
    protected _children: ReactNode[] = [];

    colSpan(span: number): this {
        this._colSpan = span;
        return this;
    }

    rowSpan(span: number): this {
        this._rowSpan = span;
        return this;
    }

    children(nodes: ReactNode[]): this {
        this._children = nodes;
        return this;
    }

    build(): ReactElement {
        const props = {
            colSpan: this._colSpan,
            rowSpan: this._rowSpan,
            children: this._children,
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
}
