import React, { useMemo, ReactNode } from 'react';
import { PanRecognizer, PanCallback } from './Pan';

interface GestureProps {
  onPanStart?: PanCallback;
  onPanUpdate?: PanCallback;
  onPanEnd?: PanCallback;
  children: ReactNode;
}

export function Gesture({ onPanStart, onPanUpdate, onPanEnd, children }: GestureProps) {
  const panRecognizer = useMemo(() => new PanRecognizer({
    onStart: onPanStart,
    onUpdate: onPanUpdate,
    onEnd: onPanEnd
  }), [onPanStart, onPanUpdate, onPanEnd]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    panRecognizer.onPointerDown(e.nativeEvent);
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      panRecognizer.onPointerMove(e.nativeEvent);
      e.stopPropagation();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    panRecognizer.onPointerUp(e.nativeEvent);
    e.stopPropagation();
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    panRecognizer.onPointerCancel(e.nativeEvent);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
