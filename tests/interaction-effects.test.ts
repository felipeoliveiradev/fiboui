import { render } from '@testing-library/react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  Box,
  Button,
  INTERACTION_EFFECTS,
  normalizeInteractionEffect,
  interactionEffectClass,
  FIBO_INTERACTION_FX_CSS,
  type InteractionEffectName,
  type PseudoStateBuilder,
} from '../src';
import { StyleManager } from '../src/core/styleManager';
import { resetInteractionFxCssForTests } from '../src/core/ensureInteractionFx';

describe('interaction effect presets (full catalog)', () => {
  it('covers the Hover.css-inspired catalog', () => {
    expect(INTERACTION_EFFECTS.length).toBeGreaterThanOrEqual(100);
    for (const name of [
      'grow',
      'sweepToRight',
      'iconForward',
      'underlineFromLeft',
      'shadowGlow',
      'bubbleTop',
      'curlTopLeft',
      'wobbleHorizontal',
      'shutterInHorizontal',
      'nudge',
    ] as InteractionEffectName[]) {
      expect(INTERACTION_EFFECTS).toContain(name);
    }
  });

  it('normalizes kebab / hvr aliases', () => {
    expect(normalizeInteractionEffect('sweep-to-right')).toBe('sweepToRight');
    expect(normalizeInteractionEffect('hvr-float')).toBe('float');
    expect(normalizeInteractionEffect('icon-forward')).toBe('iconForward');
    expect(normalizeInteractionEffect('curl-top-left')).toBe('curlTopLeft');
    expect(() => normalizeInteractionEffect('not-a-real-effect')).toThrow(
      /Unknown interaction effect/,
    );
  });

  it('ships CSS for every catalog id', () => {
    for (const name of INTERACTION_EFFECTS) {
      const cls = interactionEffectClass(name);
      expect(FIBO_INTERACTION_FX_CSS).toContain(`.${cls}`);
    }
  });

  it('infers .effect() typing inside hover callbacks', () => {
    Box()
      .hover((h) => {
        expectTypeOf(h).toEqualTypeOf<PseudoStateBuilder>();
        expectTypeOf(h.effect).parameter(0).toMatchTypeOf<InteractionEffectName | string>();
        h.effect('nudge').bg('var(--card-hover)');
      })
      .children('typed');
  });

  it('stamps fibo-fx classes for any trigger shortcut', () => {
    StyleManager.resetForTests();
    resetInteractionFxCssForTests();

    const { container } = render(
      Box()
        .children([
          Box().key('h').hoverEffect('forward').children('hover'),
          Button('press').key('p').pressEffect('shrink'),
          Box().key('f').focusEffect('glow').children('focus'),
          Box().key('s').hoverEffect('sweepToRight').children('sweep'),
          Box().key('c').hoverEffect('curlTopLeft').children('curl'),
        ])
        .build(),
    );

    const forward = container.querySelector('.fibo-fx-forward');
    expect(forward?.className).toMatch(/fibo-fx-on-hover/);
    expect(container.querySelector('.fibo-fx-sweep-to-right')).toBeTruthy();
    expect(container.querySelector('.fibo-fx-curl-top-left')).toBeTruthy();
    expect(container.querySelector('.fibo-fx-shrink')).toBeTruthy();

    const css = StyleManager.getInstance().getCss();
    expect(css).toMatch(/fibo-fx-forward/);
    expect(css).toMatch(/@keyframes fibo-fx-pulse/);
  });
});
