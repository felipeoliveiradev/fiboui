import React, { ReactElement, useLayoutEffect, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import { drawChart } from './draw';
import {
  type ChartKind,
  type ChartRenderer,
  type ChartSeries,
  barPercent,
  conicGradient,
  dataMax,
  seriesColor,
} from './geometry';

export type { ChartKind, ChartRenderer, ChartSeries };

interface ChartViewProps {
  type: ChartKind;
  renderer: ChartRenderer;
  series: ChartSeries[];
  labels: string[];
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

const CSS_KINDS = new Set<ChartKind>(['bar', 'pie', 'donut']);

function ChartCanvas(props: ChartViewProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(props.width * ratio);
    canvas.height = Math.round(props.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawChart(ctx, props);
  }, [props]);

  return React.createElement('canvas', {
    ref,
    className: 'fibo-chart-canvas',
    role: 'img',
    'aria-label': `${props.type} chart`,
    style: { width: props.width, height: props.height, display: 'block' },
  });
}

function CssBars(props: ChartViewProps) {
  const max = dataMax(props.series);
  const count = props.series.reduce((size, item) => Math.max(size, item.data.length), 0);
  const columns = [];
  for (let index = 0; index < count; index += 1) {
    const bars = props.series.map((item, seriesIndex) =>
      React.createElement('div', {
        key: `${item.name ?? seriesIndex}-${index}`,
        className: 'fibo-css-bar',
        style: {
          flex: 1,
          height: `${barPercent(item.data[index] ?? 0, max)}%`,
          background: seriesColor(item, index),
          borderRadius: 0,
          minHeight: 0,
        },
      }),
    );
    columns.push(
      React.createElement(
        'div',
        {
          key: props.labels[index] ?? index,
          style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', gap: 6 },
        },
        React.createElement(
          'div',
          { style: { flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 2 } },
          ...bars,
        ),
        React.createElement(
          'span',
          { style: { fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a9a9a' } },
          props.labels[index] ?? String(index + 1),
        ),
      ),
    );
  }
  return React.createElement(
    'div',
    {
      className: 'fibo-css-bars',
      role: 'img',
      'aria-label': 'bar chart',
      style: { display: 'flex', alignItems: 'stretch', gap: 8, width: props.width, height: props.height },
    },
    ...columns,
  );
}

function CssDisc(props: ChartViewProps) {
  const values = props.series[0]?.data ?? [];
  const background = conicGradient(
    values.map((value, index) => ({ value, color: seriesColor(props.series[0] ?? { data: [] }, index) })),
  );
  const donut = props.type === 'donut';
  return React.createElement('div', {
    className: donut ? 'fibo-css-donut' : 'fibo-css-pie',
    role: 'img',
    'aria-label': donut ? 'donut chart' : 'pie chart',
    style: {
      width: Math.min(props.width, props.height),
      height: Math.min(props.width, props.height),
      borderRadius: '50%',
      background,
      WebkitMask: donut ? 'radial-gradient(circle, transparent 58%, #000 59%)' : undefined,
      mask: donut ? 'radial-gradient(circle, transparent 58%, #000 59%)' : undefined,
    },
  });
}

const ChartView = React.memo(function ChartView(props: ChartViewProps) {
  const useCss = props.renderer === 'css' && CSS_KINDS.has(props.type);
  const body = useCss
    ? props.type === 'bar'
      ? React.createElement(CssBars, props)
      : React.createElement(CssDisc, props)
    : React.createElement(ChartCanvas, props);
  return React.createElement(
    'figure',
    {
      className: ['fibo-chart', props.className].filter(Boolean).join(' '),
      style: { margin: 0, ...props.style },
    },
    body,
  );
});

class ChartBuilder extends FiboBuilder {
  private _type: ChartKind = 'line';
  private _renderer: ChartRenderer = 'canvas';
  private _series: ChartSeries[] = [];
  private _labels: string[] = [];
  private _width = 320;
  private _height = 200;

  type(kind: ChartKind): this {
    this._type = kind;
    return this;
  }

  /** `canvas` draws every kind. `css` draws bar, pie, and donut with gradients and flex. */
  renderer(mode: ChartRenderer): this {
    this._renderer = mode;
    return this;
  }

  series(items: ChartSeries[]): this {
    this._series = items;
    return this;
  }

  labels(items: string[]): this {
    this._labels = items;
    return this;
  }

  width(px: number): this {
    if (Number.isFinite(px) && px > 0) this._width = px;
    return this;
  }

  height(px: number): this {
    if (Number.isFinite(px) && px > 0) this._height = px;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(ChartView, {
      type: this._type,
      renderer: this._renderer,
      series: this._series,
      labels: this._labels,
      width: this._width,
      height: this._height,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const Chart = createBuilder(ChartBuilder);

export interface ChartProps extends BaseProps {
  type?: ChartKind;
  renderer?: ChartRenderer;
  series?: ChartSeries[];
  labels?: string[];
  width?: number;
  height?: number;
}
