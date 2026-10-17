import { isValidElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../src';

describe('Button HTML type without .build()', () => {
  it('Button("Save").type("submit") is a valid element with HTML type submit', () => {
    const node = Button('Save').type('submit');
    expect(isValidElement(node)).toBe(true);
    render(node);
    const button = screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement;
    expect(button.type).toBe('submit');
  });

  it('.htmlType("reset") sets HTML type reset', () => {
    render(Button('Undo').htmlType('reset'));
    const button = screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement;
    expect(button.type).toBe('reset');
  });

  it('.reset() sets HTML type reset', () => {
    render(Button('Clear').reset());
    const button = screen.getByRole('button', { name: 'Clear' }) as HTMLButtonElement;
    expect(button.type).toBe('reset');
  });
});
