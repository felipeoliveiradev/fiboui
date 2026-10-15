import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Box, signal, themeToCssVars, noirTheme } from '../src';
import { Effect } from '../src/core/state';
import { StyleManager } from '../src/core/styleManager';
import { FIBO_INTERACTION_FX_CSS } from '../src/core/interactionFxCss';

describe('audit 2.4.3 regressions', () => {
  it('groupFocus stamps focus-within trigger class', () => {
    StyleManager.resetForTests();
    const { container } = render(
      Box()
        .group()
        .children(
          Box()
            .groupFocus((f) => {
              f.effect('grow');
            })
            .children('child')
            .build(),
        )
        .build(),
    );
    expect(container.querySelector('.fibo-fx-on-group-focus-within')).toBeTruthy();
    expect(container.querySelector('.fibo-fx-on-group-focus')).toBeNull();
  });

  it('effect does not stamp resting translate3d', () => {
    StyleManager.resetForTests();
    const { container } = render(
      Box().id('fx').hoverEffect('bob').children('x').build(),
    );
    const el = container.querySelector('#fx') as HTMLElement;
    expect(el.style.transform).toBe('');
  });

  it('bob keyframes start at identity', () => {
    expect(FIBO_INTERACTION_FX_CSS).toMatch(
      /@keyframes fibo-fx-bob \{\s*0%,100% \{ transform: translateY\(0\); \}/,
    );
  });

  it('themeToCssVars emits M3 container aliases + success resolves', () => {
    const vars = themeToCssVars(noirTheme);
    expect(vars['--fibo-secondary-container']).toBeTruthy();
    expect(vars['--fibo-on-secondary-container']).toBeTruthy();
    expect(vars['--fibo-primary-container']).toBeTruthy();
  });

  it('signal update loop does not stack-overflow', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const n = signal(0);
    // Creating Effect runs once; writing n from inside re-enters notify.
    new Effect(() => {
      if (n.value < 1000) n.value = n.value + 1;
    });
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });

  it('comma-string .transition emits per-property duration', () => {
    StyleManager.resetForTests();
    render(
      Box()
        .id('t')
        .transition('transform, opacity', 240, 'ease-out')
        .children('x')
        .build(),
    );
    const css = StyleManager.getInstance().getCss();
    expect(css).toMatch(/transform 240ms ease-out,\s*opacity 240ms ease-out/);
  });
});
