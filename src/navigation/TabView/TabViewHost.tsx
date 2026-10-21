'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { buildChild } from '../../core/children';

export interface TabViewTab {
  value: string;
  label: ReactNode;
  child?: ReactNode;
  icon?: ReactNode;
}

export type TabBarPosition = 'top' | 'bottom' | 'none';

export interface TabViewHostProps {
  tabs: TabViewTab[];
  value?: string;
  onChange?: (value: string) => void;
  /** Where the tablist sits. Default `bottom` (Material / BottomAppBar feel). */
  barPosition?: TabBarPosition;
  /** Horizontal drag to change tab. Default true. */
  swipe?: boolean;
  /**
   * Keep off-screen panels mounted (memo + Activity when available).
   * Default true — swipe feels instant; set false to mount only neighbors.
   */
  keepAlive?: boolean;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

const Activity = (React as unknown as { Activity?: React.ComponentType<{
  mode: 'visible' | 'hidden';
  children?: ReactNode;
}> }).Activity;

/** Touch/pen only — mouse never starts a tab swipe (clicks / drag-select). */
const SWIPE_ARM_PX = 12;
const SWIPE_THRESHOLD_PX = 48;
const SWIPE_THRESHOLD_RATIO = 0.18;

type DragSession = {
  id: number;
  startX: number;
  startY: number;
  width: number;
  fromIndex: number;
  /** True only after horizontal intent is recognized — then we capture. */
  armed: boolean;
};

function isTouchLikePointer(pointerType: string): boolean {
  return pointerType === 'touch' || pointerType === 'pen';
}

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

const TabPanelBody = memo(function TabPanelBody({
  child,
}: {
  child: ReactNode;
}) {
  return React.createElement(
    'div',
    { className: 'fibo-tabview-panel-body' },
    slot(child),
  );
});

function wrapActivity(active: boolean, node: ReactNode): ReactNode {
  if (Activity) {
    return React.createElement(Activity, { mode: active ? 'visible' : 'hidden' }, node);
  }
  return node;
}

export function TabViewHost(props: TabViewHostProps) {
  const {
    tabs,
    value,
    onChange,
    barPosition = 'bottom',
    swipe = true,
    keepAlive = true,
    className,
    style,
    ...rest
  } = props;

  const selected = value ?? tabs[0]?.value;
  const index = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === selected),
  );
  const safeIndex = tabs.length === 0 ? 0 : index < 0 ? 0 : index;

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const dragPxRef = useRef(0);
  const rafRef = useRef(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const flushDragPx = useCallback(() => {
    rafRef.current = 0;
    setDragPx(dragPxRef.current);
  }, []);

  const selectIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(tabs.length - 1, next));
      const tab = tabs[clamped];
      if (tab && tab.value !== selected) onChange?.(tab.value);
    },
    [tabs, selected, onChange],
  );

  const clearDragVisual = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    dragPxRef.current = 0;
    setDragging(false);
    setDragPx(0);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!swipe || tabs.length < 2) return;
      // Desktop mouse: never own the gesture — BottomBar / tablist change tabs.
      // (Empty pointerType also skipped: some paths omit it and used to fall
      // through to a 12px arm that stole clicks.)
      if (!isTouchLikePointer(event.pointerType ?? '')) return;
      if (event.pointerId == null || Number.isNaN(event.clientX)) return;
      // Arm only — do NOT setPointerCapture / setDragging here.
      // Capture retargets pointerup to the viewport so nested Tap never sees
      // release (same failure LongPress already documents).
      const width = viewportRef.current?.clientWidth ?? 1;
      dragRef.current = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        width,
        fromIndex: safeIndex,
        armed: false,
      };
    },
    [swipe, tabs.length, safeIndex],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;

      if (!drag.armed) {
        if (Math.abs(dx) < SWIPE_ARM_PX && Math.abs(dy) < SWIPE_ARM_PX) return;
        // Vertical / diagonal scroll intent — abandon swipe so nested
        // ScrollView / Tap keep the pointer (no capture).
        if (Math.abs(dy) >= Math.abs(dx)) {
          dragRef.current = null;
          return;
        }
        // Nested horizontal ScrollView owns the pan (movie strips, etc.).
        const target = event.target;
        if (target instanceof Element) {
          const scrollHost = target.closest('[data-fibo-scroll-host]');
          if (scrollHost instanceof HTMLElement) {
            const ox = scrollHost.style.overflowX || getComputedStyle(scrollHost).overflowX;
            if (ox === 'auto' || ox === 'scroll') {
              dragRef.current = null;
              return;
            }
          }
        }
        drag.armed = true;
        setDragging(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          /* capture optional */
        }
      }

      let delta = event.clientX - drag.startX;
      if (
        (drag.fromIndex === 0 && delta > 0) ||
        (drag.fromIndex === tabs.length - 1 && delta < 0)
      ) {
        delta *= 0.35;
      }
      dragPxRef.current = delta;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(flushDragPx);
      }
    },
    [tabs.length, flushDragPx],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.id !== event.pointerId) return;
      const armed = drag.armed;
      const delta = event.clientX - drag.startX;
      const threshold = Math.max(SWIPE_THRESHOLD_PX, drag.width * SWIPE_THRESHOLD_RATIO);
      dragRef.current = null;

      if (!armed) {
        // Pure tap / aborted vertical — leave nested gestures alone.
        clearDragVisual();
        return;
      }

      let next = drag.fromIndex;
      if (delta <= -threshold) next = drag.fromIndex + 1;
      else if (delta >= threshold) next = drag.fromIndex - 1;

      clearDragVisual();
      selectIndex(next);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    },
    [selectIndex, clearDragVisual],
  );

  const trackStyle = useMemo((): CSSProperties => {
    // Track is 100% of the viewport; each panel is flex 0 0 100%.
    // translate % is relative to the track (= one page width).
    const x = dragPx === 0
      ? `-${safeIndex * 100}%`
      : `calc(-${safeIndex * 100}% + ${dragPx}px)`;
    return {
      transform: `translate3d(${x}, 0, 0)`,
      transition: dragging ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
      willChange: 'transform',
    };
  }, [safeIndex, dragPx, dragging]);

  const tablist =
    barPosition === 'none'
      ? null
      : React.createElement(
          'div',
          {
            role: 'tablist',
            className: 'fibo-tabview-list',
            'data-bar-position': barPosition,
          },
          ...tabs.map((tab, i) =>
            React.createElement(
              'button',
              {
                key: tab.value,
                type: 'button',
                role: 'tab',
                className: 'fibo-tabview-tab',
                'aria-selected': i === safeIndex ? 'true' : 'false',
                'data-selected': i === safeIndex ? 'true' : undefined,
                onClick: () => onChange?.(tab.value),
              },
              tab.icon != null
                ? React.createElement(
                    'span',
                    { className: 'fibo-tabview-tab-icon', 'aria-hidden': true },
                    slot(tab.icon),
                  )
                : null,
              React.createElement('span', { className: 'fibo-tabview-tab-label' }, slot(tab.label)),
            ),
          ),
        );

  const panels = tabs.map((tab, i) => {
    const active = i === safeIndex;
    const near = Math.abs(i - safeIndex) <= 1;
    if (!keepAlive && !near && !active) {
      return React.createElement('div', {
        key: tab.value,
        className: 'fibo-tabview-panel',
        role: 'tabpanel',
        'aria-hidden': 'true',
      });
    }
    return React.createElement(
      'div',
      {
        key: tab.value,
        className: 'fibo-tabview-panel',
        role: 'tabpanel',
        'aria-hidden': active ? 'false' : 'true',
      },
      wrapActivity(active, React.createElement(TabPanelBody, { child: tab.child })),
    );
  });

  const viewport = React.createElement(
    'div',
    {
      ref: viewportRef,
      className: 'fibo-tabview-viewport',
      'data-dragging': dragging ? 'true' : undefined,
      onPointerDown: onPointerDown,
      onPointerMove: onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    React.createElement(
      'div',
      { className: 'fibo-tabview-track', style: trackStyle },
      ...panels,
    ),
  );

  const rootClass = ['fibo-tabview', className].filter(Boolean).join(' ');
  const children =
    barPosition === 'top'
      ? [tablist, viewport]
      : barPosition === 'bottom'
        ? [viewport, tablist]
        : [viewport];

  return React.createElement(
    'div',
    {
      ...rest,
      className: rootClass,
      style,
      'data-swipe': swipe ? 'true' : 'false',
      'data-bar-position': barPosition,
    },
    ...children.filter(Boolean),
  );
}
