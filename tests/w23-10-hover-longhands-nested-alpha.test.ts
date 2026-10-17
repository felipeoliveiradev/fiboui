import { describe, expect, it } from 'vitest';
import { promoteSurfaceLonghandsInStyle } from '../src/core/smoothInteraction';

describe('W23-10 hover longhands — nested / alpha in color wrappers', () => {
  it('promotes light-dark() wrapping rgb() / alpha (slash is inside parens, not bg-size)', () => {
    const value = 'light-dark(rgb(0 0 0 / 0.5), rgb(255 255 255 / 0.8))';
    const next = promoteSurfaceLonghandsInStyle({ background: value });
    expect(next.background).toBeUndefined();
    expect(next.backgroundColor).toBe(value);
  });

  it('promotes color-mix() wrapping rgb() / alpha', () => {
    const value = 'color-mix(in srgb, rgb(0 0 0 / 0.5), white)';
    const next = promoteSurfaceLonghandsInStyle({ background: value });
    expect(next.background).toBeUndefined();
    expect(next.backgroundColor).toBe(value);
  });

  it('still treats a real size separator outside functions as non-color shorthand', () => {
    const sized = 'red / 50%';
    expect(promoteSurfaceLonghandsInStyle({ background: sized }).background).toBe(sized);
    expect(promoteSurfaceLonghandsInStyle({ background: sized }).backgroundColor).toBeUndefined();
  });
});
