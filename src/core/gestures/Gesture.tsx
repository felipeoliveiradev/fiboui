'use client';

import React, { useEffect, useMemo, useRef, ReactNode } from 'react';
import { PanRecognizer, PanCallback } from './Pan';

interface GestureProps {
  onPanStart?: PanCallback;
  onPanUpdate?: PanCallback;
  onPanEnd?: PanCallback;
  children: ReactNode;
}

export type PanSessionCallbacks = {
  onStart?: PanCallback;
  onUpdate?: PanCallback;
  onEnd?: PanCallback;
};

function pointerFromReact(e: React.PointerEvent): PointerEvent {
  const native = e.nativeEvent;
  const clientX = typeof native.clientX === 'number' ? native.clientX : e.clientX;
  const clientY = typeof native.clientY === 'number' ? native.clientY : e.clientY;
  if (typeof native.clientX === 'number' && typeof native.clientY === 'number') {
    return native;
  }
  return Object.assign(native, {
    pointerId: e.pointerId,
    clientX: typeof clientX === 'number' ? clientX : 0,
    clientY: typeof clientY === 'number' ? clientY : 0,
  });
}

export function usePanSession(callbacks: PanSessionCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const recognizer = useMemo(
    () =>
      new PanRecognizer({
        onStart: (event) => callbacksRef.current.onStart?.(event),
        onUpdate: (event) => callbacksRef.current.onUpdate?.(event),
        onEnd: (event) => callbacksRef.current.onEnd?.(event),
      }),
    []
  );

  const session = useMemo(() => {
    const state = {
      attached: false,
      active: false,
      host: null as HTMLElement | null,
      pointerId: undefined as number | undefined,
      lastMove: null as PointerEvent | null,
    };

    const releaseCapture = () => {
      const host = state.host;
      const id = state.pointerId;
      if (!host || id === undefined) return;
      try {
        if (host.hasPointerCapture?.(id)) host.releasePointerCapture(id);
      } catch {
        /* jsdom / disconnected node */
      }
    };

    const detachWindow = () => {
      if (!state.attached) return;
      state.attached = false;
      if (typeof window === 'undefined') return;
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onWindowUp);
      window.removeEventListener('pointercancel', onWindowCancel);
    };

    const attachWindow = () => {
      if (state.attached || typeof window === 'undefined') return;
      state.attached = true;
      window.addEventListener('pointermove', onWindowMove);
      window.addEventListener('pointerup', onWindowUp);
      window.addEventListener('pointercancel', onWindowCancel);
    };

    const isSessionPointer = (pointerId: number | undefined) => {
      if (!state.active) return false;
      if (state.pointerId === undefined || pointerId === undefined) return true;
      return pointerId === state.pointerId;
    };

    const endSession = () => {
      detachWindow();
      releaseCapture();
      state.active = false;
      state.pointerId = undefined;
      state.host = null;
      state.lastMove = null;
    };

    const onWindowMove = (e: PointerEvent) => {
      if (!isSessionPointer(e.pointerId)) return;
      if (state.lastMove === e) return;
      state.lastMove = e;
      recognizer.onPointerMove(e);
    };

    const onWindowUp = (e: PointerEvent) => {
      if (!isSessionPointer(e.pointerId)) return;
      recognizer.onPointerUp(e);
      endSession();
    };

    const onWindowCancel = (e: PointerEvent) => {
      if (!isSessionPointer(e.pointerId)) return;
      recognizer.onPointerCancel(e);
      endSession();
    };

    const onPointerDown = (e: React.PointerEvent) => {
      if (state.active && !isSessionPointer(e.pointerId)) return;
      const target = e.currentTarget as HTMLElement;
      state.host = target;
      state.active = true;
      if (e.pointerId !== undefined) state.pointerId = e.pointerId;
      try {
        target.setPointerCapture?.(e.pointerId);
      } catch {
        /* jsdom / InvalidStateError */
      }
      recognizer.onPointerDown(pointerFromReact(e));
      attachWindow();
      e.preventDefault();
      e.stopPropagation();
    };

    const onPointerMove = (e: React.PointerEvent) => {
      if (!isSessionPointer(e.pointerId)) return;
      const native = pointerFromReact(e);
      if (state.lastMove === native) return;
      state.lastMove = native;
      recognizer.onPointerMove(native);
      e.stopPropagation();
    };

    const onPointerUp = (e: React.PointerEvent) => {
      if (!isSessionPointer(e.pointerId)) return;
      const target = e.currentTarget as HTMLElement;
      try {
        if (target.hasPointerCapture?.(e.pointerId)) {
          target.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* jsdom */
      }
      recognizer.onPointerUp(pointerFromReact(e));
      endSession();
      e.stopPropagation();
    };

    const onPointerCancel = (e: React.PointerEvent) => {
      if (!isSessionPointer(e.pointerId)) return;
      const target = e.currentTarget as HTMLElement;
      try {
        if (target.hasPointerCapture?.(e.pointerId)) {
          target.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* jsdom */
      }
      recognizer.onPointerCancel(pointerFromReact(e));
      endSession();
      e.stopPropagation();
    };

    const dispose = () => {
      endSession();
      recognizer.cancel();
    };

    return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, dispose };
  }, [recognizer]);

  useEffect(() => session.dispose, [session]);

  return {
    onPointerDown: session.onPointerDown,
    onPointerMove: session.onPointerMove,
    onPointerUp: session.onPointerUp,
    onPointerCancel: session.onPointerCancel,
  };
}

export function Gesture({ onPanStart, onPanUpdate, onPanEnd, children }: GestureProps) {
  const handlers = usePanSession({
    onStart: onPanStart,
    onUpdate: onPanUpdate,
    onEnd: onPanEnd,
  });

  return (
    <div
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onPointerUp={handlers.onPointerUp}
      onPointerCancel={handlers.onPointerCancel}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
}
