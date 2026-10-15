import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Box } from '../src';
import { StyleManager } from '../src/core/styleManager';
import {
  formatCssTransition,
  promoteSurfaceLonghandsInStyle,
  toTranslate3d,
  withRestTransform,
} from '../src/core/smoothInteraction';

describe('smoothInteraction helpers', () => {
  it('formats multi-property transitions with duration on every property', () => {
    expect(formatCssTransition(['transform', 'opacity', 'border-color'], 240, 'ease-out')).toBe(
      'transform 240ms ease-out, opacity 240ms ease-out, border-color 240ms ease-out',
    );
    // Regression: joining props then appending duration once makes only the last prop animate.
    expect(formatCssTransition(['a', 'b'], 200, 'ease')).not.toBe('a, b 200ms ease');
  });

  it('promotes background/border shorthands to longhands', () => {
    const next = promoteSurfaceLonghandsInStyle({
      background: 'var(--card)',
      border: '1px solid var(--border-subtle)',
      padding: 12,
    });
    expect(next.background).toBeUndefined();
    expect(next.backgroundColor).toBe('var(--card)');
    expect(next.border).toBeUndefined();
    expect(next.borderWidth).toBe('1px');
    expect(next.borderStyle).toBe('solid');
    expect(next.borderColor).toBe('var(--border-subtle)');
    expect(next.padding).toBe(12);
  });

  it('leaves gradients on background shorthand', () => {
    const gradient = 'linear-gradient(90deg, #000, #fff)';
    const next = promoteSurfaceLonghandsInStyle({ background: gradient });
    expect(next.background).toBe(gradient);
    expect(next.backgroundColor).toBeUndefined();
  });

  it('stamps resting translate3d when missing', () => {
    expect(withRestTransform({}).transform).toBe('translate3d(0, 0, 0)');
    expect(withRestTransform({ transform: 'scale(1)' }).transform).toBe('scale(1)');
  });

  it('builds translate3d axis helpers', () => {
    expect(toTranslate3d('x', 4)).toBe('translate3d(4px, 0, 0)');
    expect(toTranslate3d('y', '-6px')).toBe('translate3d(0, -6px, 0)');
  });
});

describe('hover surface smoothing', () => {
  it('promotes inline shorthand + rests translate3d for hover transform/bg', () => {
    StyleManager.resetForTests();

    const { container } = render(
      Box()
        .id('card')
        .style({
          background: 'var(--card)',
          border: '1px solid var(--border-subtle)',
        })
        .hover((h) => {
          h.bg('var(--card-hover)').borderColor('var(--border-mid)').translateX(4);
        })
        .children('voice')
        .build(),
    );

    const el = container.querySelector('#card') as HTMLElement;
    expect(el.style.background).toBe('');
    expect(el.style.backgroundColor).toBe('var(--card)');
    expect(el.style.border).toBe('');
    expect(el.style.borderColor).toBe('var(--border-subtle)');
    expect(el.style.transform).toBe('translate3d(0, 0, 0)');

    const css = StyleManager.getInstance().getCss();
    expect(css).toMatch(/background-color:\s*var\(--card-hover\)\s*!important/);
    expect(css).toMatch(/border-color:\s*var\(--border-mid\)\s*!important/);
    expect(css).toMatch(/translate3d\(4px,\s*0,\s*0\)/);
    // Every listed property must carry its own duration (not "a, b, c 240ms").
    expect(css).toMatch(
      /transform 240ms ease-out,\s*opacity 240ms ease-out,\s*box-shadow 240ms ease-out,\s*background-color 240ms ease-out,\s*border-color 240ms ease-out/,
    );
  });

  it('does not stamp rest transform for color-only hover', () => {
    StyleManager.resetForTests();

    const { container } = render(
      Box()
        .id('plain')
        .style({ backgroundColor: 'var(--card)' })
        .hover((h) => {
          h.bg('var(--card-hover)');
        })
        .children('x')
        .build(),
    );

    const el = container.querySelector('#plain') as HTMLElement;
    expect(el.style.transform).toBe('');
  });
});
