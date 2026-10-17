import { type MapBounds, type MapMarker, project } from '../Chart/geometry';

export type MapBasemap = 'light' | 'dark' | 'streets' | 'satellite';

/** Colors taken from a Fibo theme (`extendTheme` / `.theme()`). Both engines read this. */
export interface MapPalette {
  background: string;
  onBackground: string;
  primary: string;
  secondary: string;
  surface: string;
  dark: boolean;
}

export interface MapEngineContext {
  host: HTMLElement;
  markers: MapMarker[];
  bounds: MapBounds;
  width: number;
  height: number;
  basemap: MapBasemap;
  palette: MapPalette | null;
  onSelect?: (marker: MapMarker) => void;
}

export function paletteFromTheme(theme: {
  colors: {
    background: string;
    onBackground: string;
    primary: string;
    secondary: string;
    surface: string;
  };
}): MapPalette {
  return {
    background: theme.colors.background,
    onBackground: theme.colors.onBackground,
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    surface: theme.colors.surface,
    dark: isDarkColor(theme.colors.background),
  };
}

function isDarkColor(color: string): boolean {
  const match = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return false;
  const hex = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

function hueOf(color: string): number {
  const match = color.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return 0;
  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  let hue = 0;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;
  return Math.round(hue * 60);
}

/** Tints free OpenStreetMap tiles toward the theme primary. No style API key. */
export function paletteTileFilter(palette: MapPalette): string {
  const tint = `sepia(0.7) saturate(2.6) hue-rotate(${hueOf(palette.primary)}deg)`;
  return palette.dark ? `invert(1) hue-rotate(180deg) ${tint}` : tint;
}

export interface MapSession {
  update(ctx: Omit<MapEngineContext, 'host'>): void;
  destroy(): void;
}

/** A map backend. The canvas engine ships with FiboUI. Leaflet and Google are optional. */
export interface MapEngine {
  readonly name: string;
  mount(ctx: MapEngineContext): MapSession | Promise<MapSession>;
}

interface LeafletDivIcon {
  options?: object;
}

interface LeafletMarker {
  addTo(map: unknown): LeafletMarker;
  bindPopup?(text: string): LeafletMarker;
  on?(event: string, handler: () => void): LeafletMarker;
  remove(): void;
}

interface LeafletMap {
  setView(center: [number, number], zoom: number): void;
  fitBounds?(bounds: [[number, number], [number, number]]): void;
  getPane?(name: string): HTMLElement | undefined;
  remove(): void;
}

export interface LeafletNamespace {
  map(el: HTMLElement, options?: object): LeafletMap;
  tileLayer(url: string, options?: object): { addTo(map: LeafletMap): void; remove?(): void };
  marker(latlng: [number, number], options?: object): LeafletMarker;
  divIcon?(options: object): LeafletDivIcon;
}

interface GoogleLatLng {
  lat: number;
  lng: number;
}

interface GoogleMarker {
  setMap(map: unknown): void;
  addListener?(event: string, handler: () => void): void;
}

export interface GoogleMapsNamespace {
  Map: new (el: HTMLElement, options: object) => {
    fitBounds(bounds: unknown): void;
    setOptions?(options: object): void;
    setMapTypeId?(id: string): void;
  };
  Marker: new (options: object) => GoogleMarker;
  LatLngBounds: new () => { extend(point: GoogleLatLng): void };
}

const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors';

const ESRI_SATELLITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/** Free tiles only. Dark and light are CSS filters on OpenStreetMap, not a paid style API. */
const BASEMAPS: Record<MapBasemap, { url: string; attribution: string; filter: string }> = {
  light: {
    url: OSM_TILES,
    attribution: OSM_ATTRIBUTION,
    filter: 'grayscale(0.85) brightness(1.12)',
  },
  dark: {
    url: OSM_TILES,
    attribution: OSM_ATTRIBUTION,
    filter: 'invert(1) hue-rotate(180deg) brightness(0.95) contrast(0.9)',
  },
  streets: { url: OSM_TILES, attribution: OSM_ATTRIBUTION, filter: '' },
  satellite: {
    url: ESRI_SATELLITE,
    attribution: 'Tiles &copy; Esri',
    filter: '',
  },
};

/** `noir` (and an explicit dark color-scheme) picks the dark basemap. */
export function inferBasemap(host: HTMLElement): MapBasemap {
  let node: HTMLElement | null = host;
  while (node) {
    const named = node.getAttribute('data-fibo-theme');
    const classes = typeof node.className === 'string' ? node.className : '';
    if (named === 'noir' || classes.includes('fibo-theme-noir') || node.style.colorScheme === 'dark') {
      return 'dark';
    }
    node = node.parentElement;
  }
  return 'streets';
}

function paintCanvas(ctx: CanvasRenderingContext2D, width: number, height: number, basemap: MapBasemap) {
  ctx.clearRect(0, 0, width, height);
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  if (basemap === 'light') {
    sky.addColorStop(0, '#E8EEF6');
    sky.addColorStop(1, '#F8FAFC');
  } else {
    sky.addColorStop(0, '#0B1D36');
    sky.addColorStop(1, '#12304F');
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1;
  for (let step = 1; step < 6; step += 1) {
    const x = (width * step) / 6;
    const y = (height * step) / 6;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function centerOf(bounds: MapBounds): [number, number] {
  return [(bounds.minLat + bounds.maxLat) / 2, (bounds.minLng + bounds.maxLng) / 2];
}

function zoomFor(bounds: MapBounds): number {
  const span = Math.max(bounds.maxLat - bounds.minLat, bounds.maxLng - bounds.minLng, 0.01);
  return Math.max(1, Math.min(18, Math.round(Math.log2(360 / span))));
}

/** Built-in plot. No tile server. Pins are buttons positioned from lat/lng. */
export const canvasEngine: MapEngine = {
  name: 'canvas',
  mount(ctx) {
    const canvas = document.createElement('canvas');
    canvas.className = 'fibo-map-canvas';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Map');
    canvas.style.cssText = 'width:100%;height:100%;display:block';
    const pins = document.createElement('div');
    pins.className = 'fibo-map-pins';
    pins.style.cssText = 'position:absolute;inset:0';
    ctx.host.append(canvas, pins);

    const paint = (width: number, height: number, basemap: MapBasemap) => {
      const context = canvas.getContext('2d');
      if (!context || width <= 0 || height <= 0) return;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      paintCanvas(context, width, height, basemap);
    };

    const sync = (next: Omit<MapEngineContext, 'host'>) => {
      paint(next.width, next.height, next.basemap);
      pins.replaceChildren();
      for (const [index, marker] of next.markers.entries()) {
        const at = project(marker.lat, marker.lng, next.bounds);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'fibo-map-pin';
        button.setAttribute('aria-label', marker.label || `${marker.lat}, ${marker.lng}`);
        button.style.cssText = [
          'position:absolute',
          `left:${at.x * 100}%`,
          `top:${at.y * 100}%`,
          'transform:translate(-50%,-100%)',
          'width:14px',
          'height:14px',
          'padding:0',
          'border:2px solid #fff',
          'border-radius:50% 50% 50% 0',
          `background:${marker.color || '#F59E0B'}`,
          'rotate:-45deg',
          'cursor:pointer',
        ].join(';');
        button.addEventListener('click', () => next.onSelect?.(marker));
        pins.append(button);
        void index;
      }
    };

    sync(ctx);
    return {
      update: sync,
      destroy() {
        canvas.remove();
        pins.remove();
      },
    };
  },
};

export interface LeafletEngineOptions {
  /** Leaflet namespace. Falls back to `window.L` when omitted. */
  leaflet?: LeafletNamespace;
  tiles?: string;
  attribution?: string;
}

/**
 * Leaflet adapter. FiboUI does not bundle Leaflet.
 * Load `leaflet` and its CSS in the app, then pass the namespace or expose `window.L`.
 */
export function leafletEngine(options: LeafletEngineOptions = {}): MapEngine {
  return {
    name: 'leaflet',
    mount(ctx) {
      const leaflet = options.leaflet ?? (globalThis as { L?: LeafletNamespace }).L;
      if (!leaflet) {
        ctx.host.dataset.mapEngine = 'leaflet';
        ctx.host.textContent = 'Leaflet is not loaded.';
        return { update() {}, destroy() {} };
      }
      const map = leaflet.map(ctx.host, { zoomControl: true });
      let tiles: { remove?(): void } | null = null;
      let tileUrl = '';
      const applyTiles = (basemap: MapBasemap, palette: MapPalette | null) => {
        const preset = options.tiles
          ? { url: options.tiles, attribution: options.attribution ?? OSM_ATTRIBUTION, filter: '' }
          : palette
            ? { url: OSM_TILES, attribution: OSM_ATTRIBUTION, filter: paletteTileFilter(palette) }
            : BASEMAPS[basemap];
        ctx.host.dataset.basemap = palette ? (palette.dark ? 'dark' : 'light') : basemap;
        if (palette) ctx.host.dataset.mapPrimary = palette.primary;
        if (preset.url !== tileUrl) {
          tiles?.remove?.();
          tileUrl = preset.url;
          const layer = leaflet.tileLayer(preset.url, {
            attribution: preset.attribution,
            maxZoom: 19,
          });
          layer.addTo(map);
          tiles = layer;
        }
        const pane = map.getPane?.('tilePane');
        if (pane) pane.style.filter = preset.filter;
      };
      applyTiles(ctx.basemap, ctx.palette);
      let framed = '';
      const placed: LeafletMarker[] = [];
      const sync = (next: Omit<MapEngineContext, 'host'>) => {
        applyTiles(next.basemap, next.palette);
        for (const marker of placed) marker.remove();
        placed.length = 0;
        for (const marker of next.markers) {
          const fallback = next.palette?.primary || '#F59E0B';
          const color = /^#[0-9A-Fa-f]{3,8}$/.test(marker.color ?? '') ? marker.color! : fallback;
          const icon = leaflet.divIcon?.({
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 16],
            html: `<span style="display:block;width:14px;height:14px;background:${color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg)"></span>`,
          });
          const pin = leaflet.marker([marker.lat, marker.lng], icon ? { icon } : undefined).addTo(map);
          if (marker.label) pin.bindPopup?.(marker.label);
          if (next.onSelect) pin.on?.('click', () => next.onSelect?.(marker));
          placed.push(pin);
        }
        const frame = `${next.bounds.minLat}:${next.bounds.maxLat}:${next.bounds.minLng}:${next.bounds.maxLng}:${next.markers.length}`;
        if (frame !== framed) {
          framed = frame;
          if (map.fitBounds) {
            map.fitBounds([
              [next.bounds.minLat, next.bounds.minLng],
              [next.bounds.maxLat, next.bounds.maxLng],
            ]);
          } else {
            map.setView(centerOf(next.bounds), zoomFor(next.bounds));
          }
        }
      };
      sync(ctx);
      return {
        update: sync,
        destroy() {
          for (const marker of placed) marker.remove();
          map.remove();
        },
      };
    },
  };
}

export interface GoogleEngineOptions {
  /** Browser key. Used only when `maps` is not already loaded. */
  apiKey?: string;
  /** Already loaded `google.maps` namespace. Skips the script tag. */
  maps?: GoogleMapsNamespace;
}

let googleLoader: Promise<GoogleMapsNamespace> | null = null;

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsNamespace> {
  const ready = (globalThis as { google?: { maps?: GoogleMapsNamespace } }).google?.maps;
  if (ready) return Promise.resolve(ready);
  if (googleLoader) return googleLoader;
  googleLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.onload = () => {
      const maps = (globalThis as { google?: { maps?: GoogleMapsNamespace } }).google?.maps;
      if (maps) resolve(maps);
      else reject(new Error('Google Maps did not load.'));
    };
    script.onerror = () => reject(new Error('Google Maps failed to load.'));
    document.head.append(script);
  });
  return googleLoader;
}

function googleStyles(palette: MapPalette) {
  return [
    { elementType: 'geometry', stylers: [{ color: palette.background }] },
    { elementType: 'labels.text.fill', stylers: [{ color: palette.onBackground }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: palette.primary }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.secondary }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: palette.surface }] },
  ];
}

const GOOGLE_NIGHT = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
];

function mountGoogle(ctx: MapEngineContext, maps: GoogleMapsNamespace): MapSession {
  const [lat, lng] = centerOf(ctx.bounds);
  const map = new maps.Map(ctx.host, {
    center: { lat, lng },
    zoom: zoomFor(ctx.bounds),
    mapTypeControl: false,
    streetViewControl: false,
    mapTypeId: ctx.basemap === 'satellite' ? 'satellite' : 'roadmap',
    styles: ctx.basemap === 'dark' ? GOOGLE_NIGHT : undefined,
  });
  const placed: GoogleMarker[] = [];
  const sync = (next: Omit<MapEngineContext, 'host'>) => {
    for (const marker of placed) marker.setMap(null);
    placed.length = 0;
    const frame = new maps.LatLngBounds();
    for (const marker of next.markers) {
      const position = { lat: marker.lat, lng: marker.lng };
      const pin = new maps.Marker({ position, map, title: marker.label });
      if (next.onSelect) pin.addListener?.('click', () => next.onSelect?.(marker));
      placed.push(pin);
      frame.extend(position);
    }
    if (next.markers.length > 0) map.fitBounds(frame);
    map.setMapTypeId?.(next.basemap === 'satellite' ? 'satellite' : 'roadmap');
    map.setOptions?.({
      styles: next.palette ? googleStyles(next.palette) : next.basemap === 'dark' ? GOOGLE_NIGHT : [],
    });
  };
  sync(ctx);
  return {
    update: sync,
    destroy() {
      for (const marker of placed) marker.setMap(null);
    },
  };
}

/**
 * Google Maps adapter. FiboUI does not bundle the Maps JavaScript API.
 * Pass `maps` when the page already loaded it, or `apiKey` to inject the script.
 */
export function googleEngine(options: GoogleEngineOptions = {}): MapEngine {
  return {
    name: 'google',
    mount(ctx) {
      if (options.maps) return mountGoogle(ctx, options.maps);
      if (!options.apiKey) {
        ctx.host.dataset.mapEngine = 'google';
        ctx.host.textContent = 'Google Maps needs an apiKey or a loaded maps namespace.';
        return { update() {}, destroy() {} };
      }
      return loadGoogleMaps(options.apiKey).then((maps) => mountGoogle(ctx, maps));
    },
  };
}
