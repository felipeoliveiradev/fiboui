import React, { ReactNode } from 'react';
import { PanRecognizer, PanCallback } from './Pan';

// Base Gesture Builder
export abstract class GestureBuilder {
  abstract wrap(children: ReactNode): ReactNode;
}

// Drag Gesture Builder
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

// Tap Gesture Builder
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

// LongPress Gesture Builder
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

// Factory functions
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

// Wrapper Components
interface DragGestureWrapperProps {
  onStart?: PanCallback;
  onUpdate?: PanCallback;
  onEnd?: PanCallback;
  children: ReactNode;
}

function DragGestureWrapper({ onStart, onUpdate, onEnd, children }: DragGestureWrapperProps) {
  const recognizer = React.useMemo(() => new PanRecognizer({
    onStart,
    onUpdate,
    onEnd
  }), [onStart, onUpdate, onEnd]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    recognizer.onPointerDown(e.nativeEvent);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      recognizer.onPointerMove(e.nativeEvent);
      e.stopPropagation();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    recognizer.onPointerUp(e.nativeEvent);
    e.stopPropagation();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    recognizer.onPointerCancel(e.nativeEvent);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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

function TapGestureWrapper({ onStart, onEnd, children }: TapGestureWrapperProps) {
  const handlePointerDown = (e: React.PointerEvent) => {
    onStart?.();
    e.stopPropagation();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    onEnd?.();
    e.stopPropagation();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
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
  const timerRef = React.useRef<number>();

  const handlePointerDown = (e: React.PointerEvent) => {
    onStart?.();
    timerRef.current = window.setTimeout(() => {
      onEnd?.();
    }, duration);
    e.stopPropagation();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
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
