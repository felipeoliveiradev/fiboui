import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dismissible } from '../src/structure/Dismissible';

afterEach(() => {
  cleanup();
});

/** jsdom in this suite has no PointerEvent; stamp coords onto a cancelable Event. */
function firePointer(
  target: EventTarget,
  type: string,
  init: { pointerId?: number; clientX?: number; clientY?: number },
) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(ev, { pointerId: 1, clientX: 0, clientY: 0, button: 0, buttons: 1, ...init });
  target.dispatchEvent(ev);
}

function row(): HTMLElement {
  return screen.getByText('Note').closest('.fibo-dismissible') as HTMLElement;
}

function drag(host: HTMLElement, from: number, to: number) {
  act(() => {
    firePointer(host, 'pointerdown', { clientX: from });
    firePointer(host, 'pointermove', { clientX: to });
    firePointer(host, 'pointerup', { clientX: to });
  });
}

describe('Dismissible horizontal swipe', () => {
  it('snaps back when the drag is 80px or shorter', () => {
    const onDismiss = vi.fn();
    render(Dismissible().child('Note').onDismiss(onDismiss).build());
    const host = row();

    act(() => {
      firePointer(host, 'pointerdown', { clientX: 0 });
      firePointer(host, 'pointermove', { clientX: 80 });
    });
    expect(host.style.transform).toBe('translateX(80px)');
    act(() => {
      firePointer(host, 'pointerup', { clientX: 80 });
    });

    expect(onDismiss).not.toHaveBeenCalled();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(host.style.transform).toBe('translateX(0px)');
  });

  it('calls onDismiss once and hides the row past 80px', () => {
    const onDismiss = vi.fn();
    render(Dismissible().child('Note').onDismiss(onDismiss).build());
    const host = row();

    drag(host, 0, 81);
    act(() => {
      firePointer(host, 'pointerup', { clientX: 200 });
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
  });

  it('dismisses a leftward drag past 80px', () => {
    const onDismiss = vi.fn();
    render(Dismissible().child('Note').onDismiss(onDismiss).build());

    drag(row(), 100, 19);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
  });
});
