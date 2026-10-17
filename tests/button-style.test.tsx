import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('runs onPress then rest.onClick; rest.onClick does not clobber the inner handler', () => {
    const order: string[] = [];
    render(
      Button('mix')
        .onPress(() => order.push('press'))
        .onClick(() => order.push('click'))
    );
    fireEvent.click(screen.getByRole('button', { name: 'mix' }));
    expect(order).toEqual(['press', 'click']);
  });

  it('resetStyle drops size, shape, variant, hover, and press utilities', () => {
    render(Button('bare').variant('filled').resetStyle());
    const button = screen.getByRole('button', { name: 'bare' });
    expect(button.className).toContain('fibo-reset');
    expect(button.className).not.toMatch(/h-\[44px\]/);
    expect(button.className).not.toMatch(/px-\[22px\]/);
    expect(button.className).not.toMatch(/rounded-\[14px\]/);
    expect(button.className).not.toMatch(/hover:opacity/);
    expect(button.className).not.toMatch(/hover:shadow/);
    expect(button.className).not.toMatch(/active:scale/);
  });

  it('disabled does not apply hover or press utilities', () => {
    render(Button('off').variant('filled').disabled());
    const button = screen.getByRole('button', { name: 'off' });
    expect(button).toBeDisabled();
    expect(button.className).not.toMatch(/hover:opacity/);
    expect(button.className).not.toMatch(/hover:shadow/);
    expect(button.className).not.toMatch(/active:scale/);
    expect(button.className).toMatch(/pointer-events-none|disabled:/);
  });

  it('disabled elevated also skips hover:shadow', () => {
    render(Button('dim').disabled());
    const button = screen.getByRole('button', { name: 'dim' });
    expect(button.className).not.toMatch(/hover:shadow/);
    expect(button.className).not.toMatch(/active:scale/);
  });

  it('host is relative overflow-hidden so ripple stays inside', () => {
    render(Button('ink'));
    const button = screen.getByRole('button', { name: 'ink' });
    expect(button.className).toMatch(/\brelative\b/);
    expect(button.className).toMatch(/\boverflow-hidden\b/);
  });

  it('does not fire onPress when disabled even if onClick is set', () => {
    const onPress = vi.fn();
    const onClick = vi.fn();
    render(Button('nope').disabled().onPress(onPress).onClick(onClick));
    fireEvent.click(screen.getByRole('button', { name: 'nope' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

