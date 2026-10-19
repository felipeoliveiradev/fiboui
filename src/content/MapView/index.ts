import React, { ReactElement, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';
import {
  type MapBounds,
  type MapMarker,
  boundsAround,
  boundsFromMarkers,
} from '../Chart/geometry';
import type { BindableSignal } from '../../core/state';
import { canvasEngine, inferBasemap, paletteFromTheme, type MapBasemap, type MapEngine, type MapPalette, type MapSession } from './engine';
import type { ThemeInput } from '../../theme/themeData';
import type { FiboTheme } from '../../theme/types';

export type { MapBounds, MapMarker };
export { canvasEngine, googleEngine, inferBasemap, leafletEngine, paletteFromTheme } from './engine';
export type { GoogleEngineOptions, LeafletEngineOptions, MapBasemap, MapEngine, MapPalette, MapSession } from './engine';

interface MapViewProps {
  engine: MapEngine;
  markers: MapMarker[];
  bounds: MapBounds;
  width: number;
  height: number;
  basemap: MapBasemap | BindableSignal<MapBasemap> | null;
  palette: MapPalette | null;
  themeSignal: BindableSignal<FiboTheme> | null;
  className?: string;
  style?: React.CSSProperties;
  onSelect?: (marker: MapMarker) => void;
  opened?: BindableSignal<string | null> | null;
}

function isBasemap(value: unknown): value is MapBasemap {
  return value === 'light' || value === 'dark' || value === 'streets' || value === 'satellite';
}

function isThemeSignal(value: unknown): value is BindableSignal<FiboTheme> {
  if (!value || typeof value !== 'object') return false;
  const signal = value as BindableSignal<FiboTheme>;
  return typeof signal.subscribe === 'function' && !!signal.value && typeof signal.value === 'object' && 'colors' in signal.value;
}

function isBasemapSignal(value: unknown): value is BindableSignal<MapBasemap> {
  return !!value && typeof value === 'object' && typeof (value as BindableSignal<MapBasemap>).subscribe === 'function' && 'value' in (value as object);
}

function resolveBasemap(
  value: MapBasemap | BindableSignal<MapBasemap> | null,
  host: HTMLElement | null,
): MapBasemap {
  if (isBasemap(value)) return value;
  if (isBasemapSignal(value) && isBasemap(value.value)) return value.value;
  return host ? inferBasemap(host) : 'streets';
}

const MapHost = React.memo(function MapHost(props: MapViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const session = useRef<MapSession | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [liveBasemap, setLiveBasemap] = useState<MapBasemap | null>(null);
  const [livePalette, setLivePalette] = useState<MapPalette | null>(props.palette);

  useEffect(() => {
    if (!isBasemapSignal(props.basemap)) return;
    const source = props.basemap;
    if (isBasemap(source.value)) setLiveBasemap(source.value);
    return source.subscribe((next) => {
      if (isBasemap(next)) setLiveBasemap(next);
    });
  }, [props.basemap]);

  useEffect(() => {
    if (!props.themeSignal) return;
    const source = props.themeSignal;
    setLivePalette(paletteFromTheme(source.value));
    return source.subscribe((next) => setLivePalette(paletteFromTheme(next)));
  }, [props.themeSignal]);

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    let dead = false;
    let current: MapSession | null = null;
    const snapshot = () => ({
      markers: latest.current.markers,
      bounds: latest.current.bounds,
      width: latest.current.width,
      height: latest.current.height,
      basemap: liveBasemap ?? resolveBasemap(latest.current.basemap, host),
      palette: livePalette,
      onSelect: latest.current.onSelect,
      opened: latest.current.opened ?? null,
    });
    const mounted = props.engine.mount({ host, ...snapshot() });
    const adopt = (next: MapSession) => {
      if (dead) {
        next.destroy();
        return;
      }
      current = next;
      session.current = next;
      next.update(snapshot());
    };
    if (mounted instanceof Promise) {
      mounted.then(adopt).catch((error: unknown) => {
        if (!dead) host.textContent = error instanceof Error ? error.message : 'Map failed to load.';
      });
    } else {
      adopt(mounted);
    }
    return () => {
      dead = true;
      current?.destroy();
      session.current = null;
    };
  }, [props.engine]);

  useLayoutEffect(() => {
    session.current?.update({
      markers: props.markers,
      bounds: props.bounds,
      width: props.width,
      height: props.height,
      basemap: liveBasemap ?? resolveBasemap(props.basemap, ref.current),
      palette: livePalette,
      onSelect: props.onSelect,
      opened: props.opened ?? null,
    });
  }, [props.markers, props.bounds, props.width, props.height, props.basemap, props.onSelect, props.opened, liveBasemap, livePalette]);

  return React.createElement('div', {
    ref,
    className: ['fibo-map', props.className].filter(Boolean).join(' '),
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: props.width,
      height: props.height,
      overflow: 'hidden',
      borderRadius: 0,
      ...props.style,
        ...(livePalette
          ? { background: livePalette.background, color: livePalette.onBackground }
          : {}),
      },
    });
});

class MapViewBuilder extends FiboBuilder {
  private _markers: MapMarker[] = [];
  private _center: { lat: number; lng: number } | null = null;
  private _span = 20;
  private _bounds: MapBounds | null = null;
  private _width = 360;
  private _height = 240;
  private _onSelect?: (marker: MapMarker) => void;
  private _opened: BindableSignal<string | null> | null = null;
  private _engine: MapEngine = canvasEngine;
  private _basemap: MapBasemap | BindableSignal<MapBasemap> | null = null;
  private _themeSignal: BindableSignal<FiboTheme> | null = null;

  /**
   * Same theme as the rest of FiboUI: a preset (`'noir'`), a theme object,
   * or a signal of themes created with `extendTheme`.
   * Leaflet tints the free OpenStreetMap tiles. Google Maps uses the same colors.
   */
  theme(input: ThemeInput | BindableSignal<FiboTheme>): this {
    if (isThemeSignal(input)) {
      this._themeSignal = input;
      super.theme(input.value);
      return this;
    }
    this._themeSignal = null;
    return super.theme(input);
  }

  markers(items: MapMarker[]): this {
    this._markers = items;
    return this;
  }

  /** Map center (lat,lng). With no args, FiboBuilder.center() flex-centers the host. */
  center(lat?: number, lng?: number): this {
    if (typeof lat === 'number' && typeof lng === 'number') {
      this._center = { lat, lng };
      return this;
    }
    return super.center();
  }

  /** Degrees of latitude and longitude visible across the view. */
  span(degrees: number): this {
    if (Number.isFinite(degrees) && degrees > 0) this._span = degrees;
    return this;
  }

  bounds(value: MapBounds): this {
    this._bounds = value;
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

  onSelect(handler: (marker: MapMarker) => void): this {
    this._onSelect = handler;
    return this;
  }

  /** Opens the marker popup when this signal's value is a marker id. */
  opened(source: BindableSignal<string | null>): this {
    this._opened = source;
    return this;
  }

  /**
   * Tile set. Omitted, a parent `.theme('noir')` (or this map's) selects `dark`.
   * Otherwise the map stays on streets.
   */
  basemap(name: MapBasemap | BindableSignal<MapBasemap>): this {
    this._basemap = name;
    return this;
  }

  /** Swap the backend. Built-in canvas, or `leafletEngine()` / `googleEngine()`. */
  engine(engine: MapEngine): this {
    this._engine = engine;
    return this;
  }

  build(): ReactElement {
    const bounds =
      this._bounds ??
      (this._center
        ? boundsAround(this._center.lat, this._center.lng, this._span)
        : boundsFromMarkers(this._markers));
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(MapHost, {
      engine: this._engine,
      markers: this._markers,
      bounds,
      width: this._width,
      height: this._height,
      basemap: this._basemap,
      palette: this._theme ? paletteFromTheme(this._theme) : null,
      themeSignal: this._themeSignal,
      onSelect: this._onSelect,
      opened: this._opened,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const MapView = createBuilder(MapViewBuilder);

export interface MapViewPropsApi extends BaseProps {
  markers?: MapMarker[];
  width?: number;
  height?: number;
}
