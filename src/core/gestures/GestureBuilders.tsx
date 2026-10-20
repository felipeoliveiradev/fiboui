import React, { type CSSProperties, type ReactNode } from 'react';
import { PanCallback } from './Pan';
import type { DragAxis } from './Recognizer';
import { usePanSession } from './Gesture';
import { ExclusiveCtx, createExclusiveArena } from './exclusiveArena';

/** SwiftUI `GestureMask` — which gestures participate. */
export type GestureMask = 'all' | 'gesture' | 'subviews' | 'none';

export type TapLocation = { x: number; y: number };

export type MagnifyValue = { magnification: number; velocity?: number };
export type RotateValue = { radians: number; degrees: number };

export type { DragAxis };

/**
 * `none` / `subviews` → this gesture is skipped (subviews may still receive).
 * `gesture` → this gesture wraps and blocks hit-testing into children.
 * `all` → normal.
 */
function shouldAttachGesture(enabled: boolean, including: GestureMask): boolean {
  if (!enabled) return false;
  return including === 'all' || including === 'gesture';
}

function blockSubviewHits(including: GestureMask): boolean {
  return including === 'gesture';
}

export abstract class GestureBuilder {
  protected _enabled = true;
  protected _including: GestureMask = 'all';
  /** When true, wrappers must not stopPropagation (simultaneous). */
  protected _bubble = false;
  /** @internal Fired when the gesture successfully recognizes (Sequence / Exclusive). */
  protected _onRecognized?: () => void;

  enabled(value: boolean = true): this {
    this._enabled = value;
    return this;
  }

  /** SwiftUI `gesture(_:including:)`. */
  including(mask: GestureMask): this {
    this._including = mask;
    return this;
  }

  /** Internal — set by SimultaneousGesture / `.simultaneousGesture`. */
  bubble(value: boolean = true): this {
    this._bubble = value;
    return this;
  }

  /** @internal Used by SequenceGesture / ExclusiveGesture. */
  onRecognized(callback: () => void): this {
    this._onRecognized = callback;
    return this;
  }

  /** @internal */
  protected notifyRecognized(): void {
    this._onRecognized?.();
  }

  abstract wrap(children: ReactNode): ReactNode;
}

function passthrough(children: ReactNode): ReactNode {
  return children;
}

function isTrackedPointer(
  pressed: boolean,
  tracked: number | undefined,
  pointerId: number | undefined
) {
  if (!pressed) return false;
  if (tracked === undefined || pointerId === undefined) return true;
  return pointerId === tracked;
}

function tryReleasePointerCapture(target: HTMLElement | null, pointerId: number | undefined) {
  if (!target || pointerId === undefined) return;
  try {
    if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
  } catch {
    /* jsdom */
  }
}

const TAP_SLOP_PX = 10;
/** Match typical OS double-click window (~500ms). 300ms was too tight in real UIs. */
const MULTI_TAP_MS = 500;

/**
 * Visual children. The transparent hit film lives on `.contentShape` (auto-added
 * with the first gesture) so nested tap+longPress both see capture on the path
 * to that single top film.
 */
const GESTURE_CONTENT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0,
  maxWidth: '100%',
  alignSelf: 'stretch',
  flex: '1 1 auto',
};

function gestureContentStyle(blockHits: boolean): CSSProperties {
  return blockHits
    ? { ...GESTURE_CONTENT_STYLE, pointerEvents: 'none' }
    : GESTURE_CONTENT_STYLE;
}

/** Pointer ids whose long-press already fired — tap must not also fire. */
const longPressConsumedPointers = new Set<number>();

const TAP_HOST_STYLE: CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  width: 'fit-content',
  maxWidth: '100%',
  height: 'fit-content',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  position: 'relative',
};

const LONG_PRESS_HOST_STYLE: CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  width: 'fit-content',
  maxWidth: '100%',
  height: 'fit-content',
  cursor: 'pointer',
  touchAction: 'manipulation',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  position: 'relative',
};

const PINCH_HOST_STYLE: CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  width: 'fit-content',
  maxWidth: '100%',
  height: 'fit-content',
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  position: 'relative',
};

function clientPoint(e: { clientX?: number; clientY?: number }): { x: number; y: number } {
  return {
    x: typeof e.clientX === 'number' && Number.isFinite(e.clientX) ? e.clientX : 0,
    y: typeof e.clientY === 'number' && Number.isFinite(e.clientY) ? e.clientY : 0,
  };
}

function relativePoint(
  e: { clientX?: number; clientY?: number },
  host: HTMLElement | null
): TapLocation {
  const pt = clientPoint(e);
  if (!host) return pt;
  const r = host.getBoundingClientRect();
  return { x: pt.x - r.left, y: pt.y - r.top };
}

// ─── Drag ───────────────────────────────────────────────────────────────────

export class DragGestureBuilder extends GestureBuilder {
  private _onStart?: PanCallback;
  private _onUpdate?: PanCallback;
  private _onEnd?: PanCallback;
  private _minimumDistance = 10;
  private _axis: DragAxis = 'free';

  /** SwiftUI `minimumDistance` — pixels before the drag begins (default 10). */
  minimumDistance(px: number): this {
    this._minimumDistance = Math.max(0, px);
    return this;
  }

  /** Lock drag to one axis (`free` | `horizontal` | `vertical`). */
  axis(value: DragAxis): this {
    this._axis = value;
    return this;
  }

  onStart(callback: PanCallback): this {
    this._onStart = callback;
    return this;
  }

  onUpdate(callback: PanCallback): this {
    this._onUpdate = callback;
    return this;
  }

  onEnd(callback: PanCallback): this {
    this._onEnd = callback;
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    const self = this;
    return React.createElement(DragGestureWrapper, {
      onStart: this._onStart,
      onUpdate: this._onUpdate,
      onEnd: (e) => {
        this._onEnd?.(e);
        self.notifyRecognized();
      },
      minimumDistance: this._minimumDistance,
      axis: this._axis,
      blockSubviewHits: blockSubviewHits(this._including),
      children,
    });
  }
}

function DragGestureWrapper({
  onStart,
  onUpdate,
  onEnd,
  minimumDistance,
  axis,
  blockSubviewHits: blockHits,
  children,
}: {
  onStart?: PanCallback;
  onUpdate?: PanCallback;
  onEnd?: PanCallback;
  minimumDistance: number;
  axis: DragAxis;
  blockSubviewHits: boolean;
  children: ReactNode;
}) {
  const exclusive = React.useContext(ExclusiveCtx);
  const handlers = usePanSession({
    onStart: (e) => {
      if (exclusive) exclusive.arena.tryClaim(undefined, exclusive.slot);
      onStart?.(e);
    },
    onUpdate,
    onEnd: (e) => {
      onEnd?.(e);
    },
    minimumDistance,
    axis,
  });
  const onPointerDown = (e: React.PointerEvent) => {
    if (exclusive && exclusive.arena.isBlocked(e.pointerId, exclusive.slot)) return;
    handlers.onPointerDown(e);
  };
  return (
    <div
      className="fibo-gesture fibo-gesture-drag"
      onPointerDown={onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      style={{
        width: '100%',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        position: 'relative',
      }}
    >
      <div className="fibo-gesture-content" style={gestureContentStyle(blockHits)}>
        {children}
      </div>
    </div>
  );
}

// ─── Tap / SpatialTap ───────────────────────────────────────────────────────

export class TapGestureBuilder extends GestureBuilder {
  private _count = 1;
  private _reportLocation = false;
  private _onStart?: () => void;
  private _onEnd?: ((location?: TapLocation) => void) | (() => void);

  /** SwiftUI `TapGesture(count:)` — 2 = double-tap. */
  count(n: number): this {
    this._count = Math.max(1, Math.floor(n));
    return this;
  }

  /** SwiftUI `SpatialTapGesture` — `onEnd` receives `{ x, y }` in view coords. */
  spatial(value: boolean = true): this {
    this._reportLocation = value;
    return this;
  }

  onStart(callback: () => void): this {
    this._onStart = callback;
    return this;
  }

  onEnd(callback: ((location?: TapLocation) => void) | (() => void)): this {
    this._onEnd = callback;
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    const self = this;
    return React.createElement(TapGestureWrapper, {
      onStart: this._onStart,
      onEnd: (loc?: TapLocation) => {
        if (this._reportLocation) (this._onEnd as ((l?: TapLocation) => void) | undefined)?.(loc);
        else (this._onEnd as (() => void) | undefined)?.();
        self.notifyRecognized();
      },
      count: this._count,
      reportLocation: this._reportLocation,
      bubble: this._bubble,
      blockSubviewHits: blockSubviewHits(this._including),
      children,
    });
  }
}

interface TapGestureWrapperProps {
  onStart?: () => void;
  onEnd?: ((location?: TapLocation) => void) | (() => void);
  count: number;
  reportLocation: boolean;
  bubble: boolean;
  blockSubviewHits: boolean;
  children: ReactNode;
}

const TapGestureWrapper = React.memo(
  function TapGestureWrapper({
    onStart,
    onEnd,
    count,
    reportLocation,
    bubble,
    blockSubviewHits: blockHits,
    children,
  }: TapGestureWrapperProps) {
    const callbacksRef = React.useRef({ onStart, onEnd, count, reportLocation, bubble });
    callbacksRef.current = { onStart, onEnd, count, reportLocation, bubble };
    const hostRef = React.useRef<HTMLDivElement>(null);
    const exclusive = React.useContext(ExclusiveCtx);
    const exclusiveRef = React.useRef(exclusive);
    exclusiveRef.current = exclusive;

    const session = React.useRef({
      pressed: false,
      pointerId: undefined as number | undefined,
      x: 0,
      y: 0,
      moved: false,
      consumed: false,
      /** Suppress native dblclick after we already fired from the tap counter. */
      dblHandled: false,
      taps: 0,
      tapTimer: undefined as ReturnType<typeof setTimeout> | undefined,
      lastLoc: undefined as TapLocation | undefined,
    });

    const handlers = React.useMemo(() => {
      const fireEnd = (loc?: TapLocation) => {
        const { onEnd, reportLocation: spatial } = callbacksRef.current;
        if (spatial) (onEnd as (l?: TapLocation) => void)?.(loc);
        else (onEnd as () => void)?.();
      };

      const activate = (loc?: TapLocation) => {
        const { count: need } = callbacksRef.current;
        const s = session.current;
        s.taps += 1;
        s.lastLoc = loc;
        if (s.tapTimer !== undefined) clearTimeout(s.tapTimer);
        if (s.taps >= need) {
          s.taps = 0;
          s.tapTimer = undefined;
          // count≥2: mark so native `dblclick` does not fire a second time
          if (need >= 2) s.dblHandled = true;
          fireEnd(loc);
          return;
        }
        s.tapTimer = setTimeout(() => {
          s.taps = 0;
          s.tapTimer = undefined;
        }, MULTI_TAP_MS);
      };

      return {
        onPointerDownCapture(e: React.PointerEvent) {
          if (e.button != null && e.button !== 0) return;
          const ex = exclusiveRef.current;
          // Exclusive: if another slot already recognized this pointer, ignore.
          if (ex && ex.arena.isBlocked(e.pointerId, ex.slot)) return;
          const s = session.current;
          const pt = clientPoint(e);
          s.pressed = true;
          s.pointerId = e.pointerId;
          s.x = pt.x;
          s.y = pt.y;
          s.moved = false;
          s.consumed = false;
          callbacksRef.current.onStart?.();
          // Never stopPropagation on down — outer long-press + ScrollView + hit
          // film must all see the same press.
        },
        onPointerMoveCapture(e: React.PointerEvent) {
          const s = session.current;
          if (!isTrackedPointer(s.pressed, s.pointerId, e.pointerId)) return;
          const pt = clientPoint(e);
          const dx = pt.x - s.x;
          const dy = pt.y - s.y;
          // Generous slop inside horizontal ScrollView (finger jitter ≠ drag).
          if (dx * dx + dy * dy > TAP_SLOP_PX * TAP_SLOP_PX * 4) s.moved = true;
        },
        onPointerUpCapture(e: React.PointerEvent) {
          const s = session.current;
          if (!isTrackedPointer(s.pressed, s.pointerId, e.pointerId)) return;
          const pt = clientPoint(e);
          const dx = pt.x - s.x;
          const dy = pt.y - s.y;
          const wasTap = !s.moved && dx * dx + dy * dy <= TAP_SLOP_PX * TAP_SLOP_PX * 4;
          const pointerId = s.pointerId;
          s.pressed = false;
          s.pointerId = undefined;
          // Long-press on an outer host already recognized — suppress tap (SwiftUI).
          if (pointerId != null && longPressConsumedPointers.has(pointerId)) {
            longPressConsumedPointers.delete(pointerId);
            s.consumed = true;
            return;
          }
          const ex = exclusiveRef.current;
          if (ex && pointerId != null && ex.arena.isBlocked(pointerId, ex.slot)) {
            s.consumed = true;
            return;
          }
          if (!wasTap) return;
          if (ex && pointerId != null) ex.arena.tryClaim(pointerId, ex.slot);
          s.consumed = true;
          const loc = relativePoint(e, hostRef.current);
          activate(loc);
        },
        onPointerCancelCapture(e: React.PointerEvent) {
          const s = session.current;
          if (!isTrackedPointer(s.pressed, s.pointerId, e.pointerId)) return;
          s.pressed = false;
          s.pointerId = undefined;
          s.moved = true;
        },
        onClick(e: React.MouseEvent) {
          const s = session.current;
          if (s.consumed) {
            s.consumed = false;
            return;
          }
          // Browser `detail` is 1,2,3… — use it as a hint for multi-tap when
          // pointerup was swallowed (e.g. by ScrollView).
          const detail = typeof e.detail === 'number' ? e.detail : 1;
          if (detail > 1 && callbacksRef.current.count > 1) {
            const need = callbacksRef.current.count;
            if (detail >= need) {
              if (s.tapTimer !== undefined) clearTimeout(s.tapTimer);
              s.taps = 0;
              s.dblHandled = true;
              fireEnd(relativePoint(e, hostRef.current));
              return;
            }
          }
          activate(relativePoint(e, hostRef.current));
        },
        onDoubleClick(e: React.MouseEvent) {
          const need = callbacksRef.current.count;
          if (need < 2) return;
          if (!callbacksRef.current.bubble) e.stopPropagation();
          e.preventDefault();
          const s = session.current;
          if (s.dblHandled) {
            s.dblHandled = false;
            return;
          }
          if (s.tapTimer !== undefined) clearTimeout(s.tapTimer);
          s.taps = 0;
          fireEnd(relativePoint(e, hostRef.current));
        },
        onKeyDown(e: React.KeyboardEvent) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          if (!callbacksRef.current.bubble) e.stopPropagation();
          activate({ x: 0, y: 0 });
        },
      };
    }, []);

    return (
      <div
        ref={hostRef}
        role="button"
        tabIndex={0}
        className="fibo-gesture fibo-gesture-tap"
        style={TAP_HOST_STYLE}
        {...handlers}
      >
        <div className="fibo-gesture-content" style={gestureContentStyle(blockHits)}>
          {children}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.children === next.children &&
    prev.count === next.count &&
    prev.reportLocation === next.reportLocation &&
    prev.bubble === next.bubble &&
    prev.blockSubviewHits === next.blockSubviewHits
);

/** SwiftUI `SpatialTapGesture` — tap that reports location. */
export function SpatialTapGesture(): TapGestureBuilder {
  return TapGesture().spatial(true);
}

// ─── Long press ─────────────────────────────────────────────────────────────

export class LongPressGestureBuilder extends GestureBuilder {
  private _duration = 500;
  private _maximumDistance = TAP_SLOP_PX * 2;
  private _onStart?: () => void;
  private _onEnd?: () => void;
  private _onPressingChanged?: (pressing: boolean) => void;

  duration(ms: number): this {
    this._duration = ms;
    return this;
  }

  /** Abort if finger moves farther than this (SwiftUI `maximumDistance`). */
  maximumDistance(px: number): this {
    this._maximumDistance = px;
    return this;
  }

  onStart(callback: () => void): this {
    this._onStart = callback;
    return this;
  }

  onEnd(callback: () => void): this {
    this._onEnd = callback;
    return this;
  }

  /** SwiftUI `onPressingChanged`. */
  onPressingChanged(callback: (pressing: boolean) => void): this {
    this._onPressingChanged = callback;
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    const self = this;
    return React.createElement(LongPressGestureWrapper, {
      duration: this._duration,
      maximumDistance: this._maximumDistance,
      onStart: this._onStart,
      onEnd: () => {
        this._onEnd?.();
        self.notifyRecognized();
      },
      onPressingChanged: this._onPressingChanged,
      bubble: this._bubble,
      blockSubviewHits: blockSubviewHits(this._including),
      children,
    });
  }
}

const LongPressGestureWrapper = React.memo(
  function LongPressGestureWrapper({
    duration,
    maximumDistance,
    onStart,
    onEnd,
    onPressingChanged,
    bubble,
    blockSubviewHits: blockHits,
    children,
  }: {
    duration: number;
    maximumDistance: number;
    onStart?: () => void;
    onEnd?: () => void;
    onPressingChanged?: (pressing: boolean) => void;
    bubble: boolean;
    blockSubviewHits: boolean;
    children: ReactNode;
  }) {
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pointerIdRef = React.useRef<number | undefined>(undefined);
    const hostRef = React.useRef<HTMLElement | null>(null);
    const pressedRef = React.useRef(false);
    const origin = React.useRef({ x: 0, y: 0 });
    const firedRef = React.useRef(false);
    const callbacksRef = React.useRef({
      onStart,
      onEnd,
      onPressingChanged,
      duration,
      maximumDistance,
      bubble,
    });
    callbacksRef.current = {
      onStart,
      onEnd,
      onPressingChanged,
      duration,
      maximumDistance,
      bubble,
    };

    const exclusive = React.useContext(ExclusiveCtx);

    const resetPress = React.useCallback((notify = true) => {
      if (timerRef.current !== undefined) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      tryReleasePointerCapture(hostRef.current, pointerIdRef.current);
      if (pressedRef.current && notify) {
        callbacksRef.current.onPressingChanged?.(false);
      }
      pressedRef.current = false;
      pointerIdRef.current = undefined;
      hostRef.current = null;
      firedRef.current = false;
    }, []);

    React.useEffect(() => () => resetPress(false), [resetPress]);

    const handlePointerDown = (e: React.PointerEvent) => {
      if (
        pressedRef.current &&
        !isTrackedPointer(pressedRef.current, pointerIdRef.current, e.pointerId)
      ) {
        return;
      }
      if (exclusive && exclusive.arena.isBlocked(e.pointerId, exclusive.slot)) return;
      const target = e.currentTarget as HTMLElement;
      const pt = clientPoint(e);
      hostRef.current = target;
      pressedRef.current = true;
      firedRef.current = false;
      origin.current = pt;
      if (e.pointerId !== undefined) {
        pointerIdRef.current = e.pointerId;
        longPressConsumedPointers.delete(e.pointerId);
      }
      // Do NOT setPointerCapture — it retargets pointerup to this host and
      // nested Tap (inside) never sees the release → "click several times".
      // Do not stopPropagation on down — tap + hit film must see the press.
      if (timerRef.current !== undefined) clearTimeout(timerRef.current);
      callbacksRef.current.onStart?.();
      callbacksRef.current.onPressingChanged?.(true);
      timerRef.current = setTimeout(() => {
        timerRef.current = undefined;
        firedRef.current = true;
        const id = pointerIdRef.current;
        if (id != null) longPressConsumedPointers.add(id);
        if (exclusive && id != null) exclusive.arena.tryClaim(id, exclusive.slot);
        callbacksRef.current.onEnd?.();
      }, callbacksRef.current.duration);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isTrackedPointer(pressedRef.current, pointerIdRef.current, e.pointerId)) return;
      const pt = clientPoint(e);
      const dx = pt.x - origin.current.x;
      const dy = pt.y - origin.current.y;
      const max = callbacksRef.current.maximumDistance;
      if (dx * dx + dy * dy > max * max) {
        resetPress(true);
      }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (!isTrackedPointer(pressedRef.current, pointerIdRef.current, e.pointerId)) return;
      const didFire = firedRef.current;
      resetPress(true);
      // Only steal the event after a recognized long-press (suppress tap/click).
      if (didFire && !callbacksRef.current.bubble) e.stopPropagation();
    };

    return (
      <div
        className="fibo-gesture fibo-gesture-longpress"
        data-block-subviews={blockHits ? '1' : undefined}
        onPointerDownCapture={handlePointerDown}
        onPointerMoveCapture={handlePointerMove}
        onPointerUpCapture={handlePointerUp}
        onPointerCancelCapture={handlePointerUp}
        style={LONG_PRESS_HOST_STYLE}
      >
        <div className="fibo-gesture-content" style={gestureContentStyle(blockHits)}>
          {children}
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.children === next.children &&
    prev.duration === next.duration &&
    prev.maximumDistance === next.maximumDistance &&
    prev.bubble === next.bubble &&
    prev.blockSubviewHits === next.blockSubviewHits
);

// ─── Magnify (pinch / ctrl+wheel) ───────────────────────────────────────────

export class MagnifyGestureBuilder extends GestureBuilder {
  private _onStart?: (v: MagnifyValue) => void;
  private _onUpdate?: (v: MagnifyValue) => void;
  private _onEnd?: (v: MagnifyValue) => void;

  onStart(callback: (v: MagnifyValue) => void): this {
    this._onStart = callback;
    return this;
  }

  onUpdate(callback: (v: MagnifyValue) => void): this {
    this._onUpdate = callback;
    return this;
  }

  onEnd(callback: (v: MagnifyValue) => void): this {
    this._onEnd = callback;
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    const self = this;
    return React.createElement(MagnifyGestureWrapper, {
      onStart: this._onStart,
      onUpdate: this._onUpdate,
      onEnd: (v: MagnifyValue) => {
        this._onEnd?.(v);
        self.notifyRecognized();
      },
      blockSubviewHits: blockSubviewHits(this._including),
      children,
    });
  }
}

function touchDistance(a: React.Touch, b: React.Touch) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

function MagnifyGestureWrapper({
  onStart,
  onUpdate,
  onEnd,
  blockSubviewHits: blockHits,
  children,
}: {
  onStart?: (v: MagnifyValue) => void;
  onUpdate?: (v: MagnifyValue) => void;
  onEnd?: (v: MagnifyValue) => void;
  blockSubviewHits: boolean;
  children: ReactNode;
}) {
  const cb = React.useRef({ onStart, onUpdate, onEnd });
  cb.current = { onStart, onUpdate, onEnd };
  const pinch = React.useRef({ active: false, startDist: 0, last: 1 });

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const magnification = Math.max(0.1, 1 - e.deltaY * 0.01);
    if (!pinch.current.active) {
      pinch.current.active = true;
      cb.current.onStart?.({ magnification: 1 });
    }
    pinch.current.last = magnification;
    cb.current.onUpdate?.({ magnification });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return;
    pinch.current.active = true;
    pinch.current.startDist = touchDistance(e.touches[0], e.touches[1]);
    pinch.current.last = 1;
    cb.current.onStart?.({ magnification: 1 });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!pinch.current.active || e.touches.length < 2) return;
    const dist = touchDistance(e.touches[0], e.touches[1]);
    const magnification =
      pinch.current.startDist > 0 ? dist / pinch.current.startDist : 1;
    pinch.current.last = magnification;
    cb.current.onUpdate?.({ magnification });
  };

  const onTouchEnd = () => {
    if (!pinch.current.active) return;
    cb.current.onEnd?.({ magnification: pinch.current.last });
    pinch.current.active = false;
  };

  return (
    <div
      className="fibo-gesture fibo-gesture-magnify"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={PINCH_HOST_STYLE}
    >
      <div className="fibo-gesture-content" style={gestureContentStyle(blockHits)}>
        {children}
      </div>
    </div>
  );
}

// ─── Rotate (two-finger) ────────────────────────────────────────────────────

export class RotateGestureBuilder extends GestureBuilder {
  private _onStart?: (v: RotateValue) => void;
  private _onUpdate?: (v: RotateValue) => void;
  private _onEnd?: (v: RotateValue) => void;

  onStart(callback: (v: RotateValue) => void): this {
    this._onStart = callback;
    return this;
  }

  onUpdate(callback: (v: RotateValue) => void): this {
    this._onUpdate = callback;
    return this;
  }

  onEnd(callback: (v: RotateValue) => void): this {
    this._onEnd = callback;
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    const self = this;
    return React.createElement(RotateGestureWrapper, {
      onStart: this._onStart,
      onUpdate: this._onUpdate,
      onEnd: (v: RotateValue) => {
        this._onEnd?.(v);
        self.notifyRecognized();
      },
      blockSubviewHits: blockSubviewHits(this._including),
      children,
    });
  }
}

function touchAngle(a: React.Touch, b: React.Touch) {
  return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
}

function RotateGestureWrapper({
  onStart,
  onUpdate,
  onEnd,
  blockSubviewHits: blockHits,
  children,
}: {
  onStart?: (v: RotateValue) => void;
  onUpdate?: (v: RotateValue) => void;
  onEnd?: (v: RotateValue) => void;
  blockSubviewHits: boolean;
  children: ReactNode;
}) {
  const cb = React.useRef({ onStart, onUpdate, onEnd });
  cb.current = { onStart, onUpdate, onEnd };
  const rot = React.useRef({ active: false, startAngle: 0, last: 0 });

  const emit = (radians: number, phase: 'start' | 'update' | 'end') => {
    const value: RotateValue = { radians, degrees: (radians * 180) / Math.PI };
    if (phase === 'start') cb.current.onStart?.(value);
    else if (phase === 'update') cb.current.onUpdate?.(value);
    else cb.current.onEnd?.(value);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return;
    rot.current.active = true;
    rot.current.startAngle = touchAngle(e.touches[0], e.touches[1]);
    rot.current.last = 0;
    emit(0, 'start');
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!rot.current.active || e.touches.length < 2) return;
    const angle = touchAngle(e.touches[0], e.touches[1]);
    let delta = angle - rot.current.startAngle;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    rot.current.last = delta;
    emit(delta, 'update');
  };

  const onTouchEnd = () => {
    if (!rot.current.active) return;
    emit(rot.current.last, 'end');
    rot.current.active = false;
  };

  return (
    <div
      className="fibo-gesture fibo-gesture-rotate"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={PINCH_HOST_STYLE}
    >
      <div className="fibo-gesture-content" style={gestureContentStyle(blockHits)}>
        {children}
      </div>
    </div>
  );
}

// ─── Composition helpers (SwiftUI Simultaneous / Exclusive / Sequence) ──────

export class SimultaneousGestureBuilder extends GestureBuilder {
  constructor(private readonly _gestures: GestureBuilder[]) {
    super();
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    let node = children;
    for (const g of this._gestures) {
      g.bubble(true);
      node = g.wrap(node);
    }
    return node;
  }
}

/**
 * Exclusive — first listed gesture is highest priority (outermost).
 * Arena: first slot to claim a pointerId wins; others ignore that pointer.
 */
export class ExclusiveGestureBuilder extends GestureBuilder {
  constructor(private readonly _gestures: GestureBuilder[]) {
    super();
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    return React.createElement(ExclusiveGestureHost, {
      gestures: this._gestures,
      children,
    });
  }
}

function ExclusiveGestureHost({
  gestures,
  children,
}: {
  gestures: GestureBuilder[];
  children: ReactNode;
}) {
  const arena = React.useMemo(() => createExclusiveArena(), []);
  let node = children;
  // First listed = outermost (highest priority), same as SwiftUI.
  for (let i = gestures.length - 1; i >= 0; i--) {
    const wrapped = gestures[i].wrap(node);
    node = React.createElement(
      ExclusiveCtx.Provider,
      { value: { arena, slot: i } },
      wrapped
    );
  }
  return (
    <div
      className="fibo-gesture fibo-gesture-exclusive"
      data-exclusive-arena={arena.id}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      {node}
    </div>
  );
}

/** SwiftUI `SequenceGesture` — second only after first recognizes. */
export class SequenceGestureBuilder extends GestureBuilder {
  constructor(
    private readonly _first: GestureBuilder,
    private readonly _second: GestureBuilder
  ) {
    super();
  }

  wrap(children: ReactNode): ReactNode {
    if (!shouldAttachGesture(this._enabled, this._including)) return passthrough(children);
    return React.createElement(SequenceGestureHost, {
      first: this._first,
      second: this._second,
      children,
    });
  }
}

function SequenceGestureHost({
  first,
  second,
  children,
}: {
  first: GestureBuilder;
  second: GestureBuilder;
  children: ReactNode;
}) {
  const [phase, setPhase] = React.useState<0 | 1>(0);
  const phaseRef = React.useRef<0 | 1>(0);
  phaseRef.current = phase;
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    return () => {
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
    };
  }, []);

  // Bind recognition hooks once — builders are stable for the host lifetime.
  React.useLayoutEffect(() => {
    const onFirst = () => {
      phaseRef.current = 1;
      setPhase(1);
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        phaseRef.current = 0;
        setPhase(0);
      }, 2500);
    };
    const onSecond = () => {
      if (resetTimer.current !== undefined) clearTimeout(resetTimer.current);
      phaseRef.current = 0;
      setPhase(0);
    };
    const prevFirst = (first as GestureBuilder & { _onRecognized?: () => void })._onRecognized;
    const prevSecond = (second as GestureBuilder & { _onRecognized?: () => void })._onRecognized;
    first.onRecognized(() => {
      prevFirst?.();
      onFirst();
    });
    second.onRecognized(() => {
      prevSecond?.();
      onSecond();
    });
    return () => {
      (first as GestureBuilder & { _onRecognized?: () => void })._onRecognized = prevFirst;
      (second as GestureBuilder & { _onRecognized?: () => void })._onRecognized = prevSecond;
    };
  }, [first, second]);

  const active = phase === 0 ? first : second;
  return (
    <div
      className="fibo-gesture fibo-gesture-sequence"
      data-sequence-phase={phase}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        width: 'fit-content',
        maxWidth: '100%',
      }}
    >
      {/* key forces remount — TapGestureWrapper memo ignores onEnd identity */}
      <React.Fragment key={phase}>{active.wrap(children)}</React.Fragment>
    </div>
  );
}

// ─── Factories ──────────────────────────────────────────────────────────────

export function DragGesture(options?: {
  minimumDistance?: number;
  axis?: DragAxis;
}): DragGestureBuilder {
  const builder = new DragGestureBuilder();
  if (options?.minimumDistance != null) builder.minimumDistance(options.minimumDistance);
  if (options?.axis != null) builder.axis(options.axis);
  return builder;
}

export function TapGesture(): TapGestureBuilder {
  return new TapGestureBuilder();
}

export function LongPressGesture(options?: {
  duration?: number;
  maximumDistance?: number;
}): LongPressGestureBuilder {
  const builder = new LongPressGestureBuilder();
  if (options?.duration != null) builder.duration(options.duration);
  if (options?.maximumDistance != null) builder.maximumDistance(options.maximumDistance);
  return builder;
}

export function MagnifyGesture(): MagnifyGestureBuilder {
  return new MagnifyGestureBuilder();
}

/** Alias of MagnifyGesture (older SwiftUI name). */
export function MagnificationGesture(): MagnifyGestureBuilder {
  return MagnifyGesture();
}

export function RotateGesture(): RotateGestureBuilder {
  return new RotateGestureBuilder();
}

export function SimultaneousGesture(
  ...gestures: GestureBuilder[]
): SimultaneousGestureBuilder {
  return new SimultaneousGestureBuilder(gestures);
}

export function ExclusiveGesture(...gestures: GestureBuilder[]): ExclusiveGestureBuilder {
  return new ExclusiveGestureBuilder(gestures);
}

/** SwiftUI `SequenceGesture(first, second)`. */
export function SequenceGesture(
  first: GestureBuilder,
  second: GestureBuilder
): SequenceGestureBuilder {
  return new SequenceGestureBuilder(first, second);
}
