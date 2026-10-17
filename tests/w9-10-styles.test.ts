import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIBO_MOTION_CSS } from '../src/core/motionCss';
import {
  cupertinoTheme,
  materialTheme,
  noirTheme,
  themeToCssVars,
  webTheme,
} from '../src';

function firstCssVars(source: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const re = /--fibo-([a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const key = match[1];
    if (vars[key] == null) vars[key] = match[2].trim();
  }
  return vars;
}

function hexNorm(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) return trimmed.toUpperCase();
  return trimmed;
}

function canon(value: string): string {
  return hexNorm(value)
    .replace(/['"]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveCssVar(
  css: Record<string, string>,
  key: string,
  depth = 0,
): string {
  const raw = css[key];
  if (!raw || depth > 6) return raw ?? '';
  const ref = raw.match(/^var\(--fibo-([a-z0-9-]+)\)\s*$/i);
  if (ref) return resolveCssVar(css, ref[1], depth + 1);
  return raw;
}

function assertCssDeclarationsAreInRules(source: string, file: string) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = withoutComments.split('\n');
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const open = (line.match(/{/g) || []).length;
    const close = (line.match(/}/g) || []).length;
    const trimmed = line.trim();
    if (depth === 0 && /^[a-z-]+\s*:/.test(trimmed) && !trimmed.endsWith('{')) {
      throw new Error(`${file}:${i + 1} declaration outside a rule: ${trimmed}`);
    }
    depth += open - close;
  }
  if (depth !== 0) {
    throw new Error(`${file} unbalanced braces (depth ${depth})`);
  }
}

const THEME_SHEETS = {
  material: { theme: materialTheme, file: 'src/styles/themes/material.css' },
  cupertino: { theme: cupertinoTheme, file: 'src/styles/themes/cupertino.css' },
  web: { theme: webTheme, file: 'src/styles/themes/web.css' },
  noir: { theme: noirTheme, file: 'src/styles/themes/noir.css' },
} as const;

const STYLE_ROOT = resolve(__dirname, '..');

describe('W9-10 styles / style-entry', () => {
  it('style-entry.ts side-effects the full base sheet (themes + motion)', () => {
    const entry = readFileSync(resolve(STYLE_ROOT, 'src/style-entry.ts'), 'utf8');
    expect(entry).toMatch(/import\s+['"]\.\/styles\/base\.css['"]/);
    const base = readFileSync(resolve(STYLE_ROOT, 'src/styles/base.css'), 'utf8');
    expect(base).toMatch(/@import\s+['"]\.\/core\.css['"]/);
    expect(base).toMatch(/@import\s+['"]\.\/motion\.css['"]/);
    expect(base).toMatch(/@import\s+['"]\.\/themes\/material\.css['"]/);
    expect(base).toMatch(/@import\s+['"]\.\/themes\/cupertino\.css['"]/);
    expect(base).toMatch(/@import\s+['"]\.\/themes\/web\.css['"]/);
    expect(base).toMatch(/@import\s+['"]\.\/themes\/noir\.css['"]/);
  });

  it('motion.css is valid and keeps the noscript Reveal fallback from FIBO_MOTION_CSS', () => {
    const motion = readFileSync(resolve(STYLE_ROOT, 'src/styles/motion.css'), 'utf8');
    assertCssDeclarationsAreInRules(motion, 'src/styles/motion.css');
    expect(FIBO_MOTION_CSS).toMatch(/@media\s*\(scripting:\s*none\)/);
    expect(motion).toMatch(/@media\s*\(scripting:\s*none\)/);
    expect(motion).toMatch(
      /@media\s*\(scripting:\s*none\)\s*\{[\s\S]*\.fibo-reveal\s*\{[\s\S]*opacity:\s*1\s*!important/,
    );
    for (const name of [
      'fibo-fadeIn',
      'fibo-slideUp',
      'fibo-reveal',
      'fibo-scroll-progress',
      'fibo-progress-grow',
    ]) {
      expect(motion).toContain(name);
      expect(FIBO_MOTION_CSS).toContain(name);
    }
  });

  it('theme sheets define every JS themeToCssVars token (semantic colors, type, space, shadow)', () => {
    for (const [name, { theme, file }] of Object.entries(THEME_SHEETS)) {
      const css = firstCssVars(readFileSync(resolve(STYLE_ROOT, file), 'utf8'));
      const vars = themeToCssVars(theme);
      for (const [fullKey, jsValue] of Object.entries(vars)) {
        const key = fullKey.replace(/^--fibo-/, '');
        expect(css[key], `${name} CSS missing ${fullKey}`).toBeTruthy();
        const cssRaw = css[key];
        const cssValue =
          canon(cssRaw) === canon(jsValue) ? cssRaw : resolveCssVar(css, key);
        expect(canon(cssValue), `${name} ${fullKey}`).toBe(canon(jsValue));
      }
    }
  });
});
