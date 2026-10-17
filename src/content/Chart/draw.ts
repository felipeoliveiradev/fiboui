import {
  type ChartKind,
  type ChartSeries,
  dataMax,
  pieSlices,
  seriesColor,
} from './geometry';

export interface DrawChartOptions {
  type: ChartKind;
  series: ChartSeries[];
  labels: string[];
  width: number;
  height: number;
}

const PAD = { left: 36, right: 12, top: 12, bottom: 28 };

function plotBox(width: number, height: number) {
  return {
    x: PAD.left,
    y: PAD.top,
    w: Math.max(1, width - PAD.left - PAD.right),
    h: Math.max(1, height - PAD.top - PAD.bottom),
  };
}

function pointCount(series: ChartSeries[]): number {
  return series.reduce((max, item) => Math.max(max, item.data.length), 0);
}

function grid(ctx: CanvasRenderingContext2D, box: { x: number; y: number; w: number; h: number }, max: number) {
  ctx.save();
  ctx.strokeStyle = '#334155';
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px sans-serif';
  ctx.lineWidth = 1;
  for (let step = 0; step <= 4; step += 1) {
    const y = box.y + (box.h * step) / 4;
    ctx.beginPath();
    ctx.moveTo(box.x, y);
    ctx.lineTo(box.x + box.w, y);
    ctx.stroke();
    const label = String(Math.round(max * (1 - step / 4)));
    ctx.fillText(label, 4, y + 4);
  }
  ctx.restore();
}

function xy(
  index: number,
  value: number,
  count: number,
  max: number,
  box: { x: number; y: number; w: number; h: number },
) {
  const x = count <= 1 ? box.x + box.w / 2 : box.x + (index / (count - 1)) * box.w;
  const y = box.y + box.h - (Math.max(0, value) / max) * box.h;
  return { x, y };
}

function strokeSeries(
  ctx: CanvasRenderingContext2D,
  series: ChartSeries,
  index: number,
  count: number,
  max: number,
  box: { x: number; y: number; w: number; h: number },
  close: boolean,
) {
  const color = seriesColor(series, index);
  ctx.beginPath();
  series.data.forEach((value, point) => {
    if (!Number.isFinite(value)) return;
    const at = xy(point, value, count, max, box);
    if (point === 0) ctx.moveTo(at.x, at.y);
    else ctx.lineTo(at.x, at.y);
  });
  if (close && series.data.length > 0) {
    const last = xy(series.data.length - 1, 0, count, max, box);
    const first = xy(0, 0, count, max, box);
    ctx.lineTo(last.x, box.y + box.h);
    ctx.lineTo(first.x, box.y + box.h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  series: ChartSeries[],
  count: number,
  max: number,
  box: { x: number; y: number; w: number; h: number },
) {
  const group = box.w / Math.max(count, 1);
  const bar = Math.max(2, (group * 0.7) / Math.max(series.length, 1));
  series.forEach((item, seriesIndex) => {
    ctx.fillStyle = seriesColor(item, seriesIndex);
    item.data.forEach((value, index) => {
      if (!Number.isFinite(value) || value <= 0) return;
      const height = (value / max) * box.h;
      const x = box.x + index * group + (group - bar * series.length) / 2 + seriesIndex * bar;
      ctx.fillRect(x, box.y + box.h - height, bar - 1, height);
    });
  });
}

function drawPie(ctx: CanvasRenderingContext2D, series: ChartSeries[], width: number, height: number, donut: boolean) {
  const values = series[0]?.data ?? [];
  const slices = pieSlices(values);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 8;
  slices.forEach((slice, index) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = seriesColor({ data: [] }, index);
    ctx.arc(cx, cy, radius, slice.start, slice.end);
    ctx.closePath();
    ctx.fill();
  });
  if (donut) {
    ctx.beginPath();
    ctx.fillStyle = '#0F172A';
    ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRadar(
  ctx: CanvasRenderingContext2D,
  series: ChartSeries[],
  width: number,
  height: number,
  max: number,
) {
  const count = pointCount(series);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 16;
  ctx.strokeStyle = '#334155';
  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    for (let index = 0; index < count; index += 1) {
      const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
      const r = (radius * ring) / 4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  series.forEach((item, seriesIndex) => {
    ctx.beginPath();
    item.data.forEach((value, index) => {
      const angle = -Math.PI / 2 + (index / Math.max(count, 1)) * Math.PI * 2;
      const r = (Math.max(0, value) / max) * radius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = seriesColor(item, seriesIndex);
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

export function drawChart(ctx: CanvasRenderingContext2D, options: DrawChartOptions): void {
  const { type, series, width, height } = options;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, width, height);
  if (type === 'pie' || type === 'donut') {
    drawPie(ctx, series, width, height, type === 'donut');
    return;
  }
  if (type === 'radar') {
    drawRadar(ctx, series, width, height, dataMax(series));
    return;
  }
  const box = plotBox(width, height);
  const max = dataMax(series);
  const count = pointCount(series);
  grid(ctx, box, max);
  if (type === 'bar') {
    drawBars(ctx, series, count, max, box);
    return;
  }
  series.forEach((item, index) => {
    if (type === 'scatter') {
      ctx.fillStyle = seriesColor(item, index);
      item.data.forEach((value, point) => {
        if (!Number.isFinite(value)) return;
        const at = xy(point, value, count, max, box);
        ctx.beginPath();
        ctx.arc(at.x, at.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      return;
    }
    strokeSeries(ctx, item, index, count, max, box, type === 'area');
  });
}
