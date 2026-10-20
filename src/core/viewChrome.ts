import React, {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { buildChild } from './children';
import { StackAlign, stackAlignFlex } from './tokens';
import type { FiboChild } from './types';

export type ClipShapeName = 'circle' | 'rounded' | 'square';

/** CSS clip-path that also clips pointer hit-testing (modern browsers). */
function shapeClipPath(shape: string): string | undefined {
  if (shape === 'circle') return 'circle(50% at 50% 50%)';
  if (shape === 'square') return 'inset(0)';
  return undefined;
}

export interface OffsetSpec {
  x?: number;
  y?: number;
}

export interface FixedSizeSpec {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface LayerSpec {
  kind: 'overlay' | 'background';
  child: FiboChild | (() => FiboChild);
  alignment: StackAlign | keyof typeof StackAlign;
}

function resolveAlign(align: LayerSpec['alignment']): StackAlign {
  if (align == null) return StackAlign.center;
  if (typeof align === 'string' && align in StackAlign) {
    return StackAlign[align as keyof typeof StackAlign];
  }
  return align as StackAlign;
}

function resolveChild(child: LayerSpec['child']): ReactNode {
  const raw = typeof child === 'function' ? (child as () => FiboChild)() : child;
  return buildChild(raw);
}

const CLIP_RADIUS: Record<ClipShapeName, string> = {
  circle: '50%',
  rounded: '8px',
  square: '0px',
};

/** SwiftUI `.offset(x:y:)` — visual translate; layout size unchanged. */
export function wrapOffset(child: ReactElement, offset: OffsetSpec): ReactElement {
  const x = offset.x ?? 0;
  const y = offset.y ?? 0;
  if (x === 0 && y === 0) return child;
  return React.createElement(
    'div',
    {
      className: 'fibo-offset',
      'data-fibo-offset': `${x},${y}`,
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        transform: `translate(${x}px, ${y}px)`,
        // Keep layout box; visual shift only (SwiftUI offset semantics).
      } satisfies CSSProperties,
    },
    child
  );
}

/** SwiftUI `.clipped()` — clip to bounds. */
export function wrapClipped(child: ReactElement): ReactElement {
  return React.createElement(
    'div',
    {
      className: 'fibo-clipped',
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxWidth: '100%',
        // Fill a parent `.frame({ width, height })` instead of hugging loose content.
        alignSelf: 'stretch',
      } satisfies CSSProperties,
    },
    child
  );
}

/** SwiftUI `.clipShape` — circle / rounded / square / custom radius. */
export function wrapClipShape(
  child: ReactElement,
  shape: ClipShapeName | string
): ReactElement {
  const radius =
    shape in CLIP_RADIUS
      ? CLIP_RADIUS[shape as ClipShapeName]
      : shape === 'rectangle'
        ? undefined
        : String(shape);
  return React.createElement(
    'div',
    {
      className: 'fibo-clip-shape',
      'data-fibo-clip': shape,
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(radius != null ? { borderRadius: radius } : null),
        maxWidth: '100%',
        alignSelf: 'stretch',
      } satisfies CSSProperties,
    },
    child
  );
}

/**
 * Transparent click film — sits above visual content and owns the full box hit
 * target (inset:0). Gestures listen via capture on ancestor hosts; the film is
 * the actual event target so empty/transparent pixels still receive taps.
 */
export const HIT_FILM_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  width: '100%',
  height: '100%',
  // Transparent but hittable — not pointer-events:none
  background: 'rgba(0,0,0,0)',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export function HitFilm(): ReactElement {
  return React.createElement('div', {
    className: 'fibo-hit-film',
    'data-fibo-hit-film': '1',
    'aria-hidden': true,
    style: HIT_FILM_STYLE,
  });
}

/**
 * SwiftUI `.contentShape` — hit-testing region (independent of visual clip).
 * Implemented as a transparent film above the view (full frame tappable).
 *
 * ```ts
 * ZStack()…frame({ width: 300, height: 400 }).contentShape('rectangle').onTapGesture(…)
 * Image()…frame({ width: 120, height: 120 }).clipShape('circle').contentShape('circle')
 * ```
 */
export type ContentShapeName = 'rectangle' | ClipShapeName;

export function wrapContentShape(
  child: ReactElement,
  shape: ContentShapeName | string = 'rectangle'
): ReactElement {
  const radius =
    shape === 'rectangle'
      ? undefined
      : shape in CLIP_RADIUS
        ? CLIP_RADIUS[shape as ClipShapeName]
        : shape === 'circle'
          ? '50%'
          : String(shape);
  const clipPath = shapeClipPath(shape);

  const filmStyle: CSSProperties = {
    ...HIT_FILM_STYLE,
    ...(radius != null ? { borderRadius: radius } : null),
    ...(clipPath != null ? { clipPath, WebkitClipPath: clipPath } : null),
  };

  return React.createElement(
    'div',
    {
      className: 'fibo-content-shape',
      'data-fibo-content-shape': shape,
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        position: 'relative',
        width: 'fit-content',
        height: 'fit-content',
        maxWidth: '100%',
        isolation: 'isolate',
        ...(radius != null ? { borderRadius: radius } : null),
        ...(clipPath != null ? { clipPath, WebkitClipPath: clipPath } : null),
      } satisfies CSSProperties,
    },
    React.createElement(
      'div',
      {
        className: 'fibo-content-shape-body',
        style: {
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: 0,
          maxWidth: '100%',
          pointerEvents: 'none',
        } satisfies CSSProperties,
      },
      child
    ),
    React.createElement('div', {
      className: 'fibo-hit-film',
      'data-fibo-hit-film': '1',
      'data-fibo-hit-shape': shape,
      'aria-hidden': true,
      style: filmStyle,
    })
  );
}

/**
 * SwiftUI `.layoutPriority` — higher = resist compression first, then claim free space.
 * Web mapping: flex-shrink 0 + flex-grow for priority>0; negative priority shrinks first.
 * Not a full multi-axis SwiftUI proposal solver (DOM limitation).
 */
export function wrapLayoutPriority(child: ReactElement, priority: number): ReactElement {
  const grow = priority > 0 ? priority : 0;
  const shrink = priority < 0 ? 1 + Math.abs(priority) : priority > 0 ? 0 : 1;
  return React.createElement(
    'div',
    {
      className: 'fibo-layout-priority',
      'data-fibo-layout-priority': String(priority),
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        flexGrow: grow,
        flexShrink: shrink,
        flexBasis: priority > 0 ? 'auto' : undefined,
        order: priority < 0 ? 1 : 0,
        minWidth: 0,
        minHeight: 0,
        alignSelf: 'stretch',
      } satisfies CSSProperties,
    },
    child
  );
}

/** SwiftUI `.fixedSize(horizontal:vertical:)` — hug content on those axes. */
export function wrapFixedSize(child: ReactElement, spec: FixedSizeSpec): ReactElement {
  const style: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
  };
  if (spec.horizontal !== false) {
    style.width = 'fit-content';
    style.maxWidth = '100%';
  }
  if (spec.vertical !== false) {
    style.height = 'fit-content';
  }
  return React.createElement(
    'div',
    { className: 'fibo-fixed-size', style },
    child
  );
}

/**
 * SwiftUI `.overlay` / `.background` — layer above/below the view.
 * Base keeps intrinsic size; layer is `position:absolute; inset:0` + flex align.
 */
export function wrapLayer(child: ReactElement, layer: LayerSpec): ReactElement {
  const flex = stackAlignFlex(resolveAlign(layer.alignment));
  const layerNode = resolveChild(layer.child);
  const abs: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: flex.alignItems as CSSProperties['alignItems'],
    justifyContent: flex.justifyContent as CSSProperties['justifyContent'],
    pointerEvents: 'box-none' as unknown as CSSProperties['pointerEvents'],
    zIndex: layer.kind === 'overlay' ? 1 : 0,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  };
  // CSS has no pointer-events: box-none — use none on host, auto on content.
  const layerHost = React.createElement(
    'div',
    {
      className: `fibo-view-${layer.kind}`,
      'data-fibo-align': resolveAlign(layer.alignment),
      style: {
        ...abs,
        pointerEvents: 'none',
      },
    },
    React.createElement(
      'div',
      { style: { pointerEvents: 'auto', maxWidth: '100%', maxHeight: '100%' } },
      layerNode
    )
  );

  const base = React.createElement(
    'div',
    {
      className: 'fibo-view-layer-base',
      style: {
        position: 'relative',
        zIndex: layer.kind === 'background' ? 1 : 0,
        display: 'inline-flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
      } satisfies CSSProperties,
    },
    child
  );

  return React.createElement(
    'div',
    {
      className: 'fibo-view-layer-host',
      style: {
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        isolation: 'isolate',
      } satisfies CSSProperties,
    },
    layer.kind === 'background' ? layerHost : null,
    base,
    layer.kind === 'overlay' ? layerHost : null
  );
}

export type GeometryRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** SwiftUI-ish `onGeometryChange` — ResizeObserver on a host around the view. */
export function wrapOnGeometryChange(
  child: ReactElement,
  onChange: (rect: GeometryRect) => void
): ReactElement {
  return React.createElement(GeometryChangeHost, { onChange, children: child });
}

function GeometryChangeHost({
  onChange,
  children,
}: {
  onChange: (rect: GeometryRect) => void;
  children: ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const cb = React.useRef(onChange);
  cb.current = onChange;

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const emit = () => {
      const r = node.getBoundingClientRect();
      cb.current({ x: r.x, y: r.y, width: r.width, height: r.height });
    };
    emit();
    if (typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(() => emit());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return React.createElement(
    'div',
    {
      ref,
      className: 'fibo-geometry-change',
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
      } satisfies CSSProperties,
    },
    children
  );
}

/** SwiftUI `.compositingGroup()` — flatten into one compositing layer. */
export function wrapCompositingGroup(child: ReactElement): ReactElement {
  return React.createElement(
    'div',
    {
      className: 'fibo-compositing-group',
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        isolation: 'isolate',
        transform: 'translateZ(0)',
      } satisfies CSSProperties,
    },
    child
  );
}

/**
 * SwiftUI `.mask` — CSS mask from a shape name or custom CSS mask value.
 * Shape names reuse clip radii / circle clip-path.
 */
export function wrapMask(
  child: ReactElement,
  mask: ClipShapeName | 'rectangle' | string
): ReactElement {
  const clipPath = shapeClipPath(mask) ?? (mask === 'rounded' ? undefined : undefined);
  const radius =
    mask in CLIP_RADIUS
      ? CLIP_RADIUS[mask as ClipShapeName]
      : mask === 'circle'
        ? '50%'
        : mask === 'rectangle'
          ? undefined
          : undefined;
  const style: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    maxWidth: '100%',
  };
  if (clipPath) {
    style.WebkitMaskImage = 'linear-gradient(#000 0 0)';
    style.maskImage = 'linear-gradient(#000 0 0)';
    style.clipPath = clipPath;
    (style as Record<string, string>).WebkitClipPath = clipPath;
  } else if (radius != null) {
    style.WebkitMaskImage = 'linear-gradient(#000 0 0)';
    style.maskImage = 'linear-gradient(#000 0 0)';
    style.borderRadius = radius;
    style.overflow = 'hidden';
  } else if (mask.includes('(') || mask.startsWith('url') || mask.includes('gradient')) {
    style.WebkitMaskImage = mask;
    style.maskImage = mask;
    style.WebkitMaskSize = '100% 100%';
    style.maskSize = '100% 100%';
  }
  return React.createElement(
    'div',
    { className: 'fibo-mask', 'data-fibo-mask': mask, style },
    child
  );
}

export type ContainerRelativeFrameSpec = {
  axis?: 'horizontal' | 'vertical' | 'both';
  /** Divisions of the container (SwiftUI `count`). Default 1. */
  count?: number;
  /** Spans claimed (SwiftUI `span`). Default 1. */
  span?: number;
};

function nearestSizedAncestor(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 || height > 0) return el;
    el = el.parentElement;
  }
  return null;
}

function ContainerRelativeFrameView({
  child,
  spec,
}: {
  child: ReactElement;
  spec: ContainerRelativeFrameSpec;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const axis = spec.axis ?? 'both';
  const count = Math.max(0.01, spec.count ?? 1);
  const span = Math.max(1, spec.span ?? 1);
  const fraction = span / count;

  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const ancestor = nearestSizedAncestor(host);
    if (!ancestor) return;

    const measure = () => {
      const r = ancestor.getBoundingClientRect();
      setBox({ w: r.width, h: r.height });
    };
    measure();
    if (typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(measure);
    ro.observe(ancestor);
    return () => ro.disconnect();
  }, []);

  const style: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  };
  if (box) {
    if (axis === 'horizontal' || axis === 'both') {
      style.width = box.w * fraction;
      style.maxWidth = box.w * fraction;
    }
    if (axis === 'vertical' || axis === 'both') {
      style.height = box.h * fraction;
      style.maxHeight = box.h * fraction;
    }
  } else {
    // Fallback before measure — CSS % of parent.
    const pct = `${fraction * 100}%`;
    if (axis === 'horizontal' || axis === 'both') {
      style.width = pct;
      style.maxWidth = pct;
    }
    if (axis === 'vertical' || axis === 'both') {
      style.height = pct;
      style.maxHeight = pct;
    }
  }

  return React.createElement(
    'div',
    {
      ref,
      className: 'fibo-container-relative-frame',
      'data-fibo-crf-axis': axis,
      'data-fibo-crf-count': String(count),
      'data-fibo-crf-span': String(span),
      style,
    },
    child
  );
}

/** SwiftUI `containerRelativeFrame` — size vs nearest sized ancestor (px after measure). */
export function wrapContainerRelativeFrame(
  child: ReactElement,
  spec: ContainerRelativeFrameSpec = {}
): ReactElement {
  return React.createElement(ContainerRelativeFrameView, { child, spec });
}

export type AlignmentGuideName =
  | 'leading'
  | 'trailing'
  | 'top'
  | 'bottom'
  | 'centerX'
  | 'centerY'
  | string;

export type AlignmentGuideDims = { width: number; height: number };

export type AlignmentGuideSpec = {
  guide: AlignmentGuideName;
  /** Absolute guide position, or compute from own size (SwiftUI `ViewDimensions`). */
  compute: number | ((dims: AlignmentGuideDims) => number);
};

function defaultGuideValue(guide: AlignmentGuideName, dims: AlignmentGuideDims): number {
  switch (guide) {
    case 'leading':
    case 'top':
      return 0;
    case 'trailing':
      return dims.width;
    case 'bottom':
      return dims.height;
    case 'centerX':
      return dims.width / 2;
    case 'centerY':
      return dims.height / 2;
    default:
      return 0;
  }
}

function AlignmentGuideView({
  child,
  spec,
}: {
  child: ReactElement;
  spec: AlignmentGuideSpec;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState<AlignmentGuideDims>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => {
      const r = node.getBoundingClientRect();
      const d = { width: r.width, height: r.height };
      setDims(d);
      const raw =
        typeof spec.compute === 'function' ? spec.compute(d) : Number(spec.compute);
      const target = Number.isFinite(raw) ? raw : 0;
      const base = defaultGuideValue(spec.guide, d);
      const delta = target - base;
      const horizontal =
        spec.guide === 'leading' ||
        spec.guide === 'trailing' ||
        spec.guide === 'centerX' ||
        String(spec.guide).includes('x') ||
        String(spec.guide).includes('leading') ||
        String(spec.guide).includes('trailing');
      setOffset(horizontal ? { x: delta, y: 0 } : { x: 0, y: delta });
    };
    measure();
    if (typeof ResizeObserver !== 'function') return;
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [spec.guide, spec.compute]);

  const cssVar = `--fibo-align-${spec.guide}`;
  const guidePx =
    typeof spec.compute === 'function'
      ? spec.compute(dims)
      : Number(spec.compute);

  return React.createElement(
    'div',
    {
      ref,
      className: 'fibo-alignment-guide',
      'data-fibo-align-guide': spec.guide,
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        transform:
          offset.x || offset.y ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
        [cssVar]: `${guidePx}px`,
      } as CSSProperties,
    },
    child
  );
}

/**
 * SwiftUI `alignmentGuide` — shifts the view so the named guide sits at `compute`.
 * Also publishes `--fibo-align-{guide}` for CSS consumers.
 */
export function wrapAlignmentGuide(
  child: ReactElement,
  spec: AlignmentGuideSpec
): ReactElement {
  return React.createElement(AlignmentGuideView, { child, spec });
}

/** Namespace map for matchedGeometryEffect (module-level, per page lifetime). */
const matchedGeometryStore = new Map<
  string,
  { id: string; namespace: string; isSource: boolean; rect?: DOMRect }
>();

export type MatchedGeometrySpec = {
  id: string;
  namespace?: string;
  /** SwiftUI `isSource` — source owns the shared geometry. Default true. */
  isSource?: boolean;
};

function MatchedGeometryView({
  child,
  spec,
}: {
  child: ReactElement;
  spec: MatchedGeometrySpec;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const namespace = spec.namespace ?? 'default';
  const isSource = spec.isSource !== false;
  const key = `${namespace}::${spec.id}`;
  const vtName = `fibo-mg-${namespace}-${spec.id}`.replace(/[^a-zA-Z0-9_-]/g, '-');

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const publish = () => {
      const rect = node.getBoundingClientRect();
      const prev = matchedGeometryStore.get(key);
      matchedGeometryStore.set(key, {
        id: spec.id,
        namespace,
        isSource,
        rect: isSource || !prev?.rect ? rect : prev.rect,
      });
    };
    publish();
    if (typeof ResizeObserver !== 'function') {
      return () => {
        const cur = matchedGeometryStore.get(key);
        if (cur?.isSource === isSource) matchedGeometryStore.delete(key);
      };
    }
    const ro = new ResizeObserver(publish);
    ro.observe(node);
    return () => {
      ro.disconnect();
      const cur = matchedGeometryStore.get(key);
      if (cur && cur.isSource === isSource) matchedGeometryStore.delete(key);
    };
  }, [key, namespace, spec.id, isSource]);

  return React.createElement(
    'div',
    {
      ref,
      className: 'fibo-matched-geometry',
      'data-fibo-matched-id': spec.id,
      'data-fibo-matched-ns': namespace,
      'data-fibo-matched-source': isSource ? '1' : '0',
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        viewTransitionName: vtName,
      } as CSSProperties,
    },
    child
  );
}

/**
 * SwiftUI `matchedGeometryEffect` — shared `view-transition-name` + measured rect store.
 * Pair with `startViewTransition` / browser VT for morph; `isSource` marks the owner.
 */
export function wrapMatchedGeometry(
  child: ReactElement,
  spec: MatchedGeometrySpec
): ReactElement {
  return React.createElement(MatchedGeometryView, { child, spec });
}

export function matchedGeometryKeys(): string[] {
  return Array.from(matchedGeometryStore.keys());
}

export function matchedGeometryRect(
  id: string,
  namespace = 'default'
): DOMRect | undefined {
  return matchedGeometryStore.get(`${namespace}::${id}`)?.rect;
}
