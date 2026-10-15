import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
}

describe('theme CSS', () => {
  it('has no orphan declarations in web.css', () => {
    const file = resolve(__dirname, '../src/styles/themes/web.css');
    const source = readFileSync(file, 'utf8');
    expect(source).toContain('.fibo-theme-web .fibo-tag');
    assertCssDeclarationsAreInRules(source, 'src/styles/themes/web.css');
  });

  it('has no orphan declarations in other theme sheets', () => {
    for (const rel of [
      'src/styles/themes/material.css',
      'src/styles/themes/cupertino.css',
      'src/styles/themes/noir.css',
      'src/styles/base.css',
      'src/styles/core.css',
    ]) {
      const file = resolve(__dirname, '..', rel);
      assertCssDeclarationsAreInRules(readFileSync(file, 'utf8'), rel);
    }
  });

  it('noir theme sheet exposes dark editorial tokens', () => {
    const source = readFileSync(
      resolve(__dirname, '../src/styles/themes/noir.css'),
      'utf8',
    );
    expect(source).toContain('.fibo-theme-noir');
    expect(source).toContain('--fibo-text-h1-size');
    expect(source).toContain('color-scheme: dark');
  });
});

