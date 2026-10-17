import { describe, expect, it } from 'vitest';
import { pluginNames, toPascalCase } from '../src/cli/names';
import { pluginTemplate } from '../src/cli/templates';

describe('pluginNames does not clobber the app root', () => {
  it('keeps a stem when the raw name is only "plugin"/"Plugin"', () => {
    expect(pluginNames('plugin')).toEqual({
      safeName: 'Plugin',
      label: 'Plugin',
      path: '/plugin',
    });
    expect(pluginNames('Plugin')).toEqual({
      safeName: 'Plugin',
      label: 'Plugin',
      path: '/plugin',
    });
  });

  it('still strips a redundant Plugin suffix on real names', () => {
    expect(pluginNames('auth-plugin')).toEqual({
      safeName: 'AuthPlugin',
      label: 'Auth',
      path: '/auth',
    });
    expect(pluginNames('my-auth')).toEqual({
      safeName: 'MyAuthPlugin',
      label: 'MyAuth',
      path: '/my-auth',
    });
  });

  it('does not invent Plugin at path "/" for empty or punctuation names', () => {
    expect(toPascalCase('')).toBe('');
    expect(toPascalCase('@@@')).toBe('');
    expect(toPascalCase('___')).toBe('');
    for (const raw of ['', '@@@', '___']) {
      const names = pluginNames(raw);
      expect(names.safeName).toBe('');
      expect(names.path).not.toBe('/');
    }
  });
});

describe('pluginTemplate sidebar item', () => {
  it('registers /plugin with a visible label, not path "/"', () => {
    const src = pluginTemplate('plugin');
    expect(src).toContain("label: 'Plugin'");
    expect(src).toContain("path: '/plugin'");
    expect(src).not.toMatch(/path:\s*'\/'/);
    expect(src).not.toMatch(/label:\s*''/);
  });
});
