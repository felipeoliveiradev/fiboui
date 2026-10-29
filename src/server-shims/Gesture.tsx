import type { ReactNode } from 'react';

/**
 * RSC stand-in for `core/gestures/Gesture`.
 * Renders children. Pointer session is a no-op (no refs, no effects).
 */

export type PanSessionCallbacks = {
  onStart?: unknown;
  onUpdate?: unknown;
  onEnd?: unknown;
  minimumDistance?: number;
  axis?: string;
};

const noop = () => undefined;

export function usePanSession(_callbacks: PanSessionCallbacks) {
  return {
    onPointerDown: noop,
    onPointerMove: noop,
    onPointerUp: noop,
    onPointerCancel: noop,
    dispose: noop,
  };
}

export function Gesture({ children }: { children?: ReactNode }) {
  return children ?? null;
}
