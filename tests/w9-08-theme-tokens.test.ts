import { describe, expect, it } from 'vitest';
import { extendTheme, materialTheme, noirTheme, resolveTheme, themeToCssVars } from '../src';
import { Colors, MaterialColor, Shade, ThemeType } from '../src/theme/colorEnums';
import { color, getCSSVar } from '../src/theme/colorPalette';
import type { ColorScheme } from '../src/theme/themeTypes';

describe('W9-08 palette OOB / M3 aliases / type-runtime', () => {
  it('color() keeps published swatches', () => {
    expect(color(MaterialColor.Red, Shade.S500)).toBe('#F44336');
    expect(color(MaterialColor.Red, Shade.A100)).toBe('#FF8A80');
    expect(color(MaterialColor.BlueGrey, Shade.S200)).toBe('#B0BEC5');
  });

  it('color() does not paint #000000 on missing accent / OOB shade', () => {
    const grey500 = color(MaterialColor.Grey, Shade.S500);
    expect(grey500).toBe('#9E9E9E');
    expect(color(MaterialColor.Grey, Shade.A100)).toBe(grey500);
    expect(color(MaterialColor.Brown, Shade.A700)).toBe(color(MaterialColor.Brown, Shade.S500));
    expect(color(MaterialColor.BlueGrey, Shade.A200)).toBe(
      color(MaterialColor.BlueGrey, Shade.S500),
    );
    expect(color(MaterialColor.Red, 950 as Shade)).toBe(color(MaterialColor.Red, Shade.S500));
    expect(color(MaterialColor.Grey, Shade.A100)).not.toBe('#000000');
    expect(color(MaterialColor.Red, 950 as Shade)).not.toBe('#000000');
  });

  it('color() throws on unknown family instead of silent black', () => {
    expect(() => color('notAColor' as MaterialColor, Shade.S500)).toThrow(/unknown material color/i);
  });

  it('ThemeType includes noir (runtime preset)', () => {
    expect(ThemeType.Noir).toBe('noir');
    expect(resolveTheme(ThemeType.Noir).name).toBe('noir');
    expect(Object.values(ThemeType)).toContain('noir');
  });

  it('ColorScheme carries success/warning/info like Colors / ThemeColors', () => {
    const scheme: ColorScheme = {
      primary: '#6750A4',
      success: '#4CAF50',
      warning: '#FF9800',
      info: '#2196F3',
    };
    expect(scheme.success).toBe('#4CAF50');
    expect(scheme.warning).toBe('#FF9800');
    expect(scheme.info).toBe('#2196F3');
    expect(Colors.Success).toBe('success');
    expect(Colors.Warning).toBe('warning');
    expect(Colors.Info).toBe('info');
  });

  it('themeToCssVars emits M3 surface-container-low + error-container aliases', () => {
    const materialVars = themeToCssVars(materialTheme);
    expect(materialVars['--fibo-surface-container-low']).toBe(
      materialTheme.colors.surfaceContainerLow ?? materialTheme.colors.surface,
    );
    expect(materialVars['--fibo-error-container']).toBe(
      materialTheme.colors.errorContainer ?? materialTheme.colors.error,
    );
    expect(materialVars['--fibo-on-error-container']).toBe(
      materialTheme.colors.onErrorContainer ?? materialTheme.colors.onError,
    );

    const painted = extendTheme(materialTheme, { colors: { surface: '#ABCDEF', error: '#110000' } });
    const paintedVars = themeToCssVars(painted);
    expect(paintedVars['--fibo-surface-container-low']).toBe('#ABCDEF');
    expect(paintedVars['--fibo-error-container']).toBe('#110000');

    const noirVars = themeToCssVars(noirTheme);
    expect(noirVars['--fibo-surface-container-low']).toBe(noirTheme.colors.surface);
    expect(noirVars['--fibo-error-container']).toBe(noirTheme.colors.error);
    expect(noirVars['--fibo-on-error-container']).toBe(noirTheme.colors.onError);
  });

  it('getCSSVar maps semantic tokens and does not invent vars for literals', () => {
    expect(getCSSVar(Colors.Primary)).toBe('var(--fibo-primary)');
    expect(getCSSVar(Colors.PrimaryContainer)).toBe('var(--fibo-primary-container)');
    expect(getCSSVar(Colors.Transparent)).toBe('transparent');
    expect(getCSSVar(Colors.Black)).toBe('black');
    expect(getCSSVar(Colors.White)).toBe('white');
  });

  it('keeps JS --fibo-elevation-* (do not undo W6-07)', () => {
    const vars = themeToCssVars(materialTheme);
    expect(vars['--fibo-elevation-1']).toBe(materialTheme.shadows.sm);
    expect(vars['--fibo-elevation-2']).toBe(materialTheme.shadows.md);
    expect(vars['--fibo-elevation-3']).toBe(materialTheme.shadows.lg);
    expect(vars['--fibo-shadow-sm']).toBe(vars['--fibo-elevation-1']);
  });
});
