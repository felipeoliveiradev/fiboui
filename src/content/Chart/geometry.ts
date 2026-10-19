export const CHART_PALETTE = [
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#A855F7',
  '#06B6D4',
  '#F97316',
  '#84CC16',
];

export type ChartKind = 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'radar';
export type ChartRenderer = 'canvas' | 'css';

export interface ChartSeries {
  name?: string;
  data: number[];
  color?: string;
  /** One paint per point. Falls back to `color`, then the default palette. */
  colors?: string[];
}

export interface ChartSlice {
  start: number;
  end: number;
  value: number;
}

export function seriesColor(series: ChartSeries, index: number): string {
  const listed = series.colors?.[index];
  if (listed) return listed;
  if (series.color) return series.color;
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export function finite(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value));
}

export function dataMax(series: ChartSeries[]): number {
  let max = 0;
  for (const item of series) {
    for (const value of item.data) {
      if (Number.isFinite(value) && value > max) max = value;
    }
  }
  return max || 1;
}

/** Pie slices start at 12 o'clock and run clockwise. Angles are radians. */
export function pieSlices(values: number[]): ChartSlice[] {
  const safe = values.map((value) => (Number.isFinite(value) && value > 0 ? value : 0));
  const total = safe.reduce((sum, value) => sum + value, 0) || 1;
  let angle = -Math.PI / 2;
  return safe.map((value) => {
    const sweep = (value / total) * Math.PI * 2;
    const slice = { start: angle, end: angle + sweep, value };
    angle += sweep;
    return slice;
  });
}

/** CSS `conic-gradient` stop list for the same values. */
export function conicGradient(items: { value: number; color: string }[]): string {
  const safe = items.map((item) => ({
    color: item.color,
    value: Number.isFinite(item.value) && item.value > 0 ? item.value : 0,
  }));
  const total = safe.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  const stops = safe.map((item) => {
    const start = cursor;
    cursor += (item.value / total) * 100;
    return `${item.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

export function barPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || value <= 0 || max <= 0) return 0;
  return Math.min(100, (value / max) * 100);
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  /** Stable id so a list row can open this pin. */
  id?: string;
  color?: string;
  /** HTML card shown in the pin popup. Falls back to `label`. */
  popup?: string;
}

/** Equirectangular position in 0..1. Y grows downward. */
export function project(lat: number, lng: number, bounds: MapBounds): { x: number; y: number } {
  const latSpan = bounds.maxLat - bounds.minLat || 1;
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  return {
    x: (lng - bounds.minLng) / lngSpan,
    y: (bounds.maxLat - lat) / latSpan,
  };
}

export function boundsAround(lat: number, lng: number, span: number): MapBounds {
  const half = Math.max(span, 0.01) / 2;
  return {
    minLat: lat - half,
    maxLat: lat + half,
    minLng: lng - half,
    maxLng: lng + half,
  };
}

export function boundsFromMarkers(markers: MapMarker[], pad = 0.15): MapBounds {
  if (markers.length === 0) return boundsAround(0, 0, 40);
  let minLat = markers[0].lat;
  let maxLat = markers[0].lat;
  let minLng = markers[0].lng;
  let maxLng = markers[0].lng;
  for (const marker of markers) {
    if (marker.lat < minLat) minLat = marker.lat;
    if (marker.lat > maxLat) maxLat = marker.lat;
    if (marker.lng < minLng) minLng = marker.lng;
    if (marker.lng > maxLng) maxLng = marker.lng;
  }
  const latPad = Math.max((maxLat - minLat) * pad, 0.5);
  const lngPad = Math.max((maxLng - minLng) * pad, 0.5);
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}
