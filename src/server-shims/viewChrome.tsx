import {
  createElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { buildChild } from '../core/children';
import { StackAlign, stackAlignFlex } from '../core/tokens';
import type { FiboChild } from '../core/types';

/**
 * RSC stand-in for `core/viewChrome`.
 * CSS wrappers stay. Geometry, alignment, and matched-geometry hosts pass children through.
 */

export type ClipShapeName = 'circle' | 'rounded' | 'square';

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

export function wrapOffset(child: ReactElement, offset: OffsetSpec): ReactElement {
  const x = offset.x ?? 0;
  const y = offset.y ?? 0;
  if (x === 0 && y === 0) return child;
  return createElement(
    'div',
    {
      className: 'fibo-offset',
      'data-fibo-offset': `${x},${y}`,
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        transform: `translate(${x}px, ${y}px)`,
      } satisfies CSSProperties,
    },
    child
  );
}

export function wrapClipped(child: ReactElement): ReactElement {
  return createElement(
    'div',
    {
      className: 'fibo-clipped',
      style: {
        display: 'inline-flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxWidth: '100%',
        alignSelf: 'stretch',
      } satisfies CSSProperties,
    },
    child
  );
}

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
  return createElement(
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

export const HIT_FILM_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  zIndex: 10,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0)',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
};

export function HitFilm(): ReactElement {
  return createElement('div', {
    className: 'fibo-hit-film',
    'data-fibo-hit-film': '1',
    'aria-hidden': true,
    style: HIT_FILM_STYLE,
  });
}

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

  return createElement(
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
    createElement(
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
    createElement('div', {
      className: 'fibo-hit-film',
      'data-fibo-hit-film': '1',
      'data-fibo-hit-shape': shape,
      'aria-hidden': true,
      style: filmStyle,
    })
  );
}

export function wrapLayoutPriority(child: ReactElement, priority: number): ReactElement {
  const grow = priority > 0 ? priority : 0;
  const shrink = priority < 0 ? 1 + Math.abs(priority) : priority > 0 ? 0 : 1;
  return createElement(
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
  return createElement('div', { className: 'fibo-fixed-size', style }, child);
}

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
  const layerHost = createElement(
    'div',
    {
      className: `fibo-view-${layer.kind}`,
      'data-fibo-align': resolveAlign(layer.alignment),
      style: {
        ...abs,
        pointerEvents: 'none',
      },
    },
    createElement(
      'div',
      { style: { pointerEvents: 'auto', maxWidth: '100%', maxHeight: '100%' } },
      layerNode
    )
  );

  const base = createElement(
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

  return createElement(
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

/** No measurement on the server — child renders as-is. */
export function wrapOnGeometryChange(
  child: ReactElement,
  _onChange: (rect: GeometryRect) => void
): ReactElement {
  return child;
}

export function wrapCompositingGroup(child: ReactElement): ReactElement {
  return createElement(
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

export function wrapMask(
  child: ReactElement,
  mask: ClipShapeName | 'rectangle' | string
): ReactElement {
  const clipPath = shapeClipPath(mask);
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
  return createElement(
    'div',
    { className: 'fibo-mask', 'data-fibo-mask': mask, style },
    child
  );
}

export type ContainerRelativeFrameSpec = {
  axis?: 'horizontal' | 'vertical' | 'both';
  count?: number;
  span?: number;
};

export function wrapContainerRelativeFrame(
  child: ReactElement,
  _spec: ContainerRelativeFrameSpec = {}
): ReactElement {
  return child;
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
  compute: number | ((dims: AlignmentGuideDims) => number);
};

export function wrapAlignmentGuide(
  child: ReactElement,
  _spec: AlignmentGuideSpec
): ReactElement {
  return child;
}

export type MatchedGeometrySpec = {
  id: string;
  namespace?: string;
  isSource?: boolean;
};

export function wrapMatchedGeometry(
  child: ReactElement,
  _spec: MatchedGeometrySpec
): ReactElement {
  return child;
}

export function matchedGeometryKeys(): string[] {
  return [];
}

export function matchedGeometryRect(
  _id: string,
  _namespace = 'default'
): DOMRect | undefined {
  return undefined;
}
