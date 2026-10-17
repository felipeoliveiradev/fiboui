import React, { ReactNode } from 'react';
import { PanCallback } from './Pan';
import { usePanSession } from './Gesture';

export abstract class GestureBuilder {
  abstract wrap(children: ReactNode): ReactNode;
}

export class DragGestureBuilder extends GestureBuilder {
  private _onStart?: PanCallback;
  private _onUpdate?: PanCallback;
  private _onEnd?: PanCallback;

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
    return React.createElement(DragGestureWrapper, {
      onStart: this._onStart,
      onUpdate: this._onUpdate,
      onEnd: this._onEnd,
      children
    });
  }
}

export class TapGestureBuilder extends GestureBuilder {
  private _onStart?: () => void;
  private _onEnd?: () => void;

  onStart(callback: () => void): this {
    this._onStart = callback;
    return this;
  }

  onEnd(callback: () => void): this {
    this._onEnd = callback;
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    return React.createElement(TapGestureWrapper, {
      onStart: this._onStart,
      onEnd: this._onEnd,
      children
    });
  }
}

export class LongPressGestureBuilder extends GestureBuilder {
  private _duration: number = 500;
  private _onStart?: () => void;
  private _onEnd?: () => void;

  duration(ms: number): this {
    this._duration = ms;
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

  wrap(children: ReactNode): ReactNode {
    return React.createElement(LongPressGestureWrapper, {
      duration: this._duration,
      onStart: this._onStart,
      onEnd: this._onEnd,
      children
    });
  }
}

export function DragGesture(): DragGestureBuilder {
  return new DragGestureBuilder();
}

export function TapGesture(): TapGestureBuilder {
  return new TapGestureBuilder();
}

export function LongPressGesture(options?: { duration?: number }): LongPressGestureBuilder {
  const builder = new LongPressGestureBuilder();
  if (options?.duration) {
    builder.duration(options.duration);
  }
  return builder;
}

interface DragGestureWrapperProps {
  onStart?: PanCallback;
  onUpdate?: PanCallback;
  onEnd?: PanCallback;
  children: ReactNode;
}

function DragGestureWrapper({ onStart, onUpdate, onEnd, children }: DragGestureWrapperProps) {
  const handlers = usePanSession({ onStart, onUpdate, onEnd });

  return (
    <div
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      style={{
        width: '100%',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}

interface TapGestureWrapperProps {
  onStart?: () => void;
  onEnd?: () => void;
  children: ReactNode;
}

function isTrackedPointer(pressed: boolean, tracked: number | undefined, pointerId: number | undefined) {
  if (!pressed) return false;
  if (tracked === undefined || pointerId === undefined) return true;
  return pointerId === tracked;
}

function trySetPointerCapture(target: HTMLElement, pointerId: number) {
  try {
    target.setPointerCapture?.(pointerId);
  } catch {
    /* jsdom / InvalidStateError */
  }
}

function tryReleasePointerCapture(target: HTMLElement | null, pointerId: number | undefined) {
  if (!target || pointerId === undefined) return;
  try {
    if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId);
  } catch {
    /* jsdom */
  }
}

function TapGestureWrapper({ onStart, onEnd, children }: TapGestureWrapperProps) {
  const callbacksRef = React.useRef({ onStart, onEnd });
  callbacksRef.current = { onStart, onEnd };

  const session = React.useMemo(() => {
    const state = {
      pressed: false,
      attached: false,
      pointerId: undefined as number | undefined,
      host: null as HTMLElement | null,
    };

    const detachWindow = () => {
      if (!state.attached) return;
      state.attached = false;
      if (typeof window === 'undefined') return;
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointercancel', onWindowCancel);
    };

    const attachWindow = () => {
      if (state.attached || typeof window === 'undefined') return;
      state.attached = true;
      window.addEventListener('pointerup', onWindowUp);
      window.addEventListener('pointercancel', onWindowCancel);
    };

    const finish = () => {
      if (!state.pressed) return;
      detachWindow();
      tryReleasePointerCapture(state.host, state.pointerId);
      state.pressed = false;
      state.pointerId = undefined;
      state.host = null;
      callbacksRef.current.onEnd?.();
    };

    const onWindowUp = (e: PointerEvent) => {
      if (!isTrackedPointer(state.pressed, state.pointerId, e.pointerId)) return;
      finish();
    };

    const onWindowCancel = (e: PointerEvent) => {
      if (!isTrackedPointer(state.pressed, state.pointerId, e.pointerId)) return;
      finish();
    };

    const onPointerDown = (e: React.PointerEvent) => {
      if (state.pressed && !isTrackedPointer(state.pressed, state.pointerId, e.pointerId)) return;
      const target = e.currentTarget as HTMLElement;
      state.host = target;
      state.pressed = true;
      if (e.pointerId !== undefined) state.pointerId = e.pointerId;
      trySetPointerCapture(target, e.pointerId);
      callbacksRef.current.onStart?.();
      attachWindow();
      e.stopPropagation();
    };

    const onPointerUp = (e: React.PointerEvent) => {
      if (!isTrackedPointer(state.pressed, state.pointerId, e.pointerId)) return;
      finish();
      e.stopPropagation();
    };

    const onPointerCancel = (e: React.PointerEvent) => {
      if (!isTrackedPointer(state.pressed, state.pointerId, e.pointerId)) return;
      finish();
      e.stopPropagation();
    };

    return { onPointerDown, onPointerUp, onPointerCancel, dispose: finish };
  }, []);

  React.useEffect(() => session.dispose, [session]);

  return (
    <div
      onPointerDown={session.onPointerDown}
      onPointerUp={session.onPointerUp}
      onPointerCancel={session.onPointerCancel}
      style={{
        width: '100%',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}

interface LongPressGestureWrapperProps {
  duration: number;
  onStart?: () => void;
  onEnd?: () => void;
  children: ReactNode;
}

function LongPressGestureWrapper({ duration, onStart, onEnd, children }: LongPressGestureWrapperProps) {
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerIdRef = React.useRef<number | undefined>(undefined);
  const hostRef = React.useRef<HTMLElement | null>(null);
  const pressedRef = React.useRef(false);
  const callbacksRef = React.useRef({ onStart, onEnd, duration });
  callbacksRef.current = { onStart, onEnd, duration };

  const resetPress = React.useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    tryReleasePointerCapture(hostRef.current, pointerIdRef.current);
    pressedRef.current = false;
    pointerIdRef.current = undefined;
    hostRef.current = null;
  }, []);

  React.useEffect(() => resetPress, [resetPress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (pressedRef.current && !isTrackedPointer(pressedRef.current, pointerIdRef.current, e.pointerId)) return;
    const target = e.currentTarget as HTMLElement;
    hostRef.current = target;
    pressedRef.current = true;
    if (e.pointerId !== undefined) pointerIdRef.current = e.pointerId;
    trySetPointerCapture(target, e.pointerId);
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
    }
    callbacksRef.current.onStart?.();
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      callbacksRef.current.onEnd?.();
    }, callbacksRef.current.duration);
    e.stopPropagation();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isTrackedPointer(pressedRef.current, pointerIdRef.current, e.pointerId)) return;
    resetPress();
    e.stopPropagation();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: '100%',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}
