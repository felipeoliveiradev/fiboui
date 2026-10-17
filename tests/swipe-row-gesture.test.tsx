import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SwipeRow } from '../src/structure/SwipeRow';

afterEach(cleanup);

function pointer(target: Element, type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number) {
  act(() => {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX,
        clientY: 8,
        button: 0,
      }),
    );
  });
}

describe('SwipeRow gesture', () => {
  it('reveals the action after a left drag and keeps the button clickable', () => {
    const onPress = vi.fn();
    const { container } = render(
      SwipeRow()
        .child('Message')
        .actions([{ label: 'Delete', onPress }])
        .build() as React.ReactElement,
    );

    const row = container.querySelector('.fibo-swipe-row') as HTMLElement;
    const child = container.querySelector('.fibo-swipe-row-child') as HTMLElement;

    pointer(row, 'pointerdown', 120);
    pointer(row, 'pointermove', 40);
    pointer(row, 'pointerup', 40);

    expect(child.style.transform).toBe('translateX(-80px)');

    const action = screen.getByRole('button', { name: 'Delete' });
    expect(action).toBeVisible();
    fireEvent.click(action);
    expect(onPress).toHaveBeenCalledOnce();
  });
});
