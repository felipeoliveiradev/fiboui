import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../src';

describe('Button user .style() wins', () => {
  it('does not overwrite user border-radius, padding, font-size, height, font-weight', () => {
    render(
      Button('styled')
        .style({
          borderRadius: '0px',
          padding: '1px',
          fontSize: '20px',
          height: '30px',
          fontWeight: 400,
        })
        .build()
    );

    const button = screen.getByRole('button', { name: 'styled' });
    expect(button.style.borderRadius).toBe('0px');
    expect(button.style.padding).toBe('1px');
    expect(button.style.fontSize).toBe('20px');
    expect(button.style.height).toBe('30px');
    expect(button.style.fontWeight).toBe('400');
  });

  it('keeps default chrome when the user did not set those style keys', () => {
    render(Button('plain').build());
    const button = screen.getByRole('button', { name: 'plain' });
    expect(button.className).toMatch(/rounded/);
    expect(button.className).toMatch(/h-\[44px\]|font-semibold|px-/);
  });

  it('defaults to type="button" so it does not submit forms', () => {
    render(Button('go').build());
    expect(screen.getByRole('button', { name: 'go' })).toHaveAttribute('type', 'button');
  });
});
