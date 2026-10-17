import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as corePublic from '../src/core-entry';

const ROOT = resolve(__dirname, '..');
const guide = (name: string) => readFileSync(resolve(ROOT, 'docs/guide', name), 'utf8');

describe('W16-01 docs/guide vs public API', () => {
  it('fiboui/core does not export FiboBuilder or createBuilder', () => {
    expect(corePublic).not.toHaveProperty('FiboBuilder');
    expect(corePublic).not.toHaveProperty('createBuilder');
  });

  it('architecture.md does not import the unpublished FiboBuilder / createBuilder', () => {
    const md = guide('architecture.md');
    expect(md).not.toMatch(
      /import\s*\{[^}]*\b(FiboBuilder|createBuilder)\b[^}]*\}\s*from\s*['"]fiboui\/core['"]/,
    );
  });

  it('state-management.md does not freeze signal text in a static children array', () => {
    const md = guide('state-management.md');
    expect(md).not.toMatch(/\.bindSignal\(count\)[\s\S]{0,120}\.children\(\[/);
    expect(md).toMatch(/\.bindSignal\(count\)[\s\S]{0,120}\.children\(\(\)\s*=>/);
    expect(md).not.toMatch(/onChange\(\(e\)\s*=>[\s\S]{0,80}e\.target\.value/);
  });

  it('state-management.md does not chain .consume() as if it returned this', () => {
    const md = guide('state-management.md');
    expect(md).not.toMatch(/\.consume\([^)]*\)\s*\n\s*\.backgroundColor/);
    expect(md).toMatch(/useProvider/);
  });

  it('state-management.md does not claim Combobox/RadioGroup/Progress skip interp', () => {
    const md = guide('state-management.md');
    expect(md).not.toMatch(/Combobox, RadioGroup, and Progress labels store the raw string/);
  });

  it('getting-started.md does not pass Tailwind palette names to .bg()', () => {
    const md = guide('getting-started.md');
    expect(md).not.toMatch(/\.bg\(\s*['"]gray-\d+['"]\s*\)/);
  });
});
