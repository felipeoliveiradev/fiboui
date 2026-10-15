import { render } from '@testing-library/react';
import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  Box,
  Button,
  INTERACTION_EFFECTS,
  normalizeInteractionEffect,
  applyInteractionEffect,
  type InteractionEffectName,
  type PseudoStateBuilder,
} from '../src';
import { StyleManager } from '../src/core/styleManager';

describe('interaction effect presets', () => {
  it('lists a stable curated catalog', () => {
    expect(INTERACTION_EFFECTS).toContain('forward');
    expect(INTERACTION_EFFECTS).toContain('nudge');
    expect(INTERACTION_EFFECTS).toContain('glow');
    expect(INTERACTION_EFFECTS).toHaveLength(12);
  });

  it('normalizes Hover.css-style aliases', () => {
    expect(normalizeInteractionEffect('hang')).toBe('float');
    expect(normalizeInteractionEffect('icon-forward')).toBe('forward');
    expect(() => normalizeInteractionEffect('curl-top-left')).toThrow(
      /Unknown interaction effect/,
    );
  });

  it('applies transform presets onto a target', () => {
    const calls: string[] = [];
    const target = {
      translateX(v: number | string) {
        calls.push(`tx:${v}`);
        return this;
      },
      translateY(v: number | string) {
        calls.push(`ty:${v}`);
        return this;
      },
      scale(v: number) {
        calls.push(`scale:${v}`);
        return this;
      },
      opacity(v: number) {
        calls.push(`opacity:${v}`);
        return this;
      },
      shadow(v: string) {
        calls.push(`shadow:${v}`);
        return this;
      },
    };
    applyInteractionEffect(target, 'nudge');
    expect(calls).toEqual(['tx:3']);
    calls.length = 0;
    applyInteractionEffect(target, 'lift');
    expect(calls[0]).toBe('ty:-3');
    expect(calls[1]?.startsWith('shadow:')).toBe(true);
  });

  it('infers .effect() typing inside hover callbacks', () => {
    Box()
      .hover((h) => {
        expectTypeOf(h).toEqualTypeOf<PseudoStateBuilder>();
        expectTypeOf(h.effect).parameter(0).toMatchTypeOf<InteractionEffectName | string>();
        h.effect('forward').bg('var(--card-hover)');
      })
      .children('typed');
  });

  it('wires shortcuts onto builders without throwing', () => {
    StyleManager.resetForTests();
    const { container } = render(
      Box().children([
        Box().key('h').hoverEffect('nudge').children('hover'),
        Button('press').key('p').pressEffect('shrink'),
        Box().key('f').focusEffect('glow').children('focus'),
        Box().key('a').activeEffect('pulse').children('active'),
        Box().key('g').groupHoverEffect('float').children('group'),
        Box()
          .key('compose')
          .hover((h) => {
            h.effect('forward').borderColor('var(--border-mid)');
          })
          .children('compose'),
      ]).build(),
    );
    expect(container.querySelectorAll('.fibo-box, .fibo-button').length).toBeGreaterThan(3);
  });

  it('registers pseudo transform rules for .effect("forward")', () => {
    StyleManager.resetForTests();
    render(Box().hoverEffect('forward').children('fwd').build());
    const css = StyleManager.getInstance().getCss();
    expect(css).toMatch(/translateX\(4px\)/);
    expect(css).toMatch(/:hover/);
  });
});
