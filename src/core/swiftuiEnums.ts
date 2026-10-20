/**
 * SwiftUI-facing enums / const objects for FiboUI.
 * Prefer these over raw strings in app code.
 */

/** SwiftUI `Edge` */
export const Edge = {
  top: 'top',
  bottom: 'bottom',
  leading: 'leading',
  trailing: 'trailing',
} as const;
export type Edge = (typeof Edge)[keyof typeof Edge];

/**
 * SwiftUI `Edge.Set` — which sides receive padding/margin.
 * `leading`/`trailing` map to left/right in LTR (CSS).
 */
export const EdgeSet = {
  top: 'top',
  bottom: 'bottom',
  leading: 'leading',
  trailing: 'trailing',
  horizontal: 'horizontal',
  vertical: 'vertical',
  all: 'all',
} as const;
export type EdgeSet = (typeof EdgeSet)[keyof typeof EdgeSet];

/** SwiftUI `ContentShape` / hit region names */
export const ContentShape = {
  rectangle: 'rectangle',
  circle: 'circle',
  rounded: 'rounded',
  square: 'square',
} as const;
export type ContentShape = (typeof ContentShape)[keyof typeof ContentShape];

/** SwiftUI `ClipShape` names */
export const ClipShape = {
  circle: 'circle',
  rounded: 'rounded',
  square: 'square',
  rectangle: 'rectangle',
} as const;
export type ClipShape = (typeof ClipShape)[keyof typeof ClipShape];

/** Named / built-in coordinate spaces for GeometryProxy */
export const CoordinateSpace = {
  local: 'local',
  global: 'global',
  named: (name: string) => `named:${name}`,
} as const;

/** Drag axis lock */
export const DragAxis = {
  free: 'free',
  horizontal: 'horizontal',
  vertical: 'vertical',
} as const;

/** GestureMask (also on GestureBuilders) */
export const GestureMaskEnum = {
  all: 'all',
  gesture: 'gesture',
  subviews: 'subviews',
  none: 'none',
} as const;

/** Scroll target / position anchors */
export const ScrollAnchor = {
  start: 'start',
  center: 'center',
  end: 'end',
} as const;
export type ScrollAnchor = (typeof ScrollAnchor)[keyof typeof ScrollAnchor];

/** Unit for containerRelativeFrame */
export const ContainerRelativeAxis = {
  horizontal: 'horizontal',
  vertical: 'vertical',
  both: 'both',
} as const;
export type ContainerRelativeAxis =
  (typeof ContainerRelativeAxis)[keyof typeof ContainerRelativeAxis];

export type EdgeInsetsValue = {
  top?: number | string;
  bottom?: number | string;
  leading?: number | string;
  trailing?: number | string;
  /** CSS left — alias of leading in LTR */
  left?: number | string;
  /** CSS right — alias of trailing in LTR */
  right?: number | string;
};

export function resolveEdgeInsets(insets: EdgeInsetsValue): {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
} {
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.leading ?? insets.left,
    right: insets.trailing ?? insets.right,
  };
}

export function applyEdgeSet(
  set: EdgeSet,
  value: number | string
): { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string } {
  switch (set) {
    case EdgeSet.top:
      return { top: value };
    case EdgeSet.bottom:
      return { bottom: value };
    case EdgeSet.leading:
      return { left: value };
    case EdgeSet.trailing:
      return { right: value };
    case EdgeSet.horizontal:
      return { left: value, right: value };
    case EdgeSet.vertical:
      return { top: value, bottom: value };
    case EdgeSet.all:
    default:
      return { top: value, right: value, bottom: value, left: value };
  }
}
