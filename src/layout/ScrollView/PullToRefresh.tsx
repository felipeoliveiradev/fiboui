'use client';

import React, { ReactNode, useCallback, useRef, useState } from 'react';

const THRESHOLD = 64;

/**
 * Vertical pull-to-refresh when the scroll host is at the top.
 * Used by `ScrollView.refreshable`.
 */
export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const hostRef = useRef<HTMLDivElement>(null);

  const atTop = useCallback(() => {
    const el = hostRef.current?.querySelector(
      '.fibo-scrollview, [data-fibo-scroll-host]'
    ) as HTMLElement | null;
    const scroller =
      el ??
      (hostRef.current?.firstElementChild as HTMLElement | null) ??
      hostRef.current;
    if (!scroller) return true;
    return scroller.scrollTop <= 0;
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (refreshing) return;
    if (!atTop()) return;
    startY.current = e.clientY;
    pulling.current = true;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pulling.current || startY.current == null || refreshing) return;
    if (!atTop()) {
      setPull(0);
      return;
    }
    const dy = e.clientY - startY.current;
    if (dy > 0) {
      e.preventDefault();
      setPull(Math.min(dy * 0.45, THRESHOLD * 1.4));
    } else {
      setPull(0);
    }
  };

  const finish = async () => {
    pulling.current = false;
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD * 0.6);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const indicatorH = Math.max(pull, refreshing ? 36 : 0);

  return (
    <div
      ref={hostRef}
      className="fibo-pull-to-refresh"
      style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, flex: 1 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
    >
      <div
        className="fibo-pull-to-refresh-indicator"
        aria-hidden={indicatorH <= 0}
        style={{
          height: indicatorH,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          fontSize: 12,
          opacity: indicatorH > 8 ? 1 : 0,
          transition: refreshing ? undefined : 'height 120ms ease-out',
          color: 'var(--fibo-muted, #888)',
          userSelect: 'none',
        }}
      >
        {refreshing ? '…' : pull >= THRESHOLD ? 'Release' : 'Pull'}
      </div>
      <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
