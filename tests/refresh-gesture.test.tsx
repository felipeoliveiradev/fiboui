import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RefreshIndicator } from '../src/structure/RefreshIndicator';

afterEach(cleanup);

/** This jsdom has no PointerEvent, so fireEvent would drop clientY. */
function installPointerEvent() {
  if (typeof window.PointerEvent === 'function') return;
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  }
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    writable: true,
    value: PointerEventPolyfill,
  });
}

describe('RefreshIndicator pull gesture', () => {
  it('calls onRefresh once when the pull passes 48px at scroll top', () => {
    installPointerEvent();
    const onRefresh = vi.fn();
    const { rerender } = render(
      RefreshIndicator().refreshing(false).onRefresh(onRefresh).child('Rows').build() as React.ReactElement,
    );
    const host = screen.getByText('Pull').closest('.fibo-refresh') as HTMLElement;

    fireEvent.pointerDown(host, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(host, { clientY: 40, pointerId: 1 });
    expect(screen.getByText('Pull')).toBeInTheDocument();
    fireEvent.pointerUp(host, { clientY: 40, pointerId: 1 });
    expect(onRefresh).not.toHaveBeenCalled();

    fireEvent.pointerDown(host, { clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(host, { clientY: 80, pointerId: 1 });
    expect(screen.getByText('Release')).toBeInTheDocument();
    fireEvent.pointerUp(host, { clientY: 80, pointerId: 1 });
    expect(onRefresh).toHaveBeenCalledOnce();

    Object.defineProperty(host, 'scrollTop', { configurable: true, value: 12 });
    fireEvent.pointerDown(host, { clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(host, { clientY: 90, pointerId: 1 });
    fireEvent.pointerUp(host, { clientY: 90, pointerId: 1 });
    expect(onRefresh).toHaveBeenCalledOnce();

    rerender(
      RefreshIndicator().refreshing(true).onRefresh(onRefresh).child('Rows').build() as React.ReactElement,
    );
    expect(screen.getByText('Rows').closest('[aria-busy="true"]')).toBeInTheDocument();
  });
});
