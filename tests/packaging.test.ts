import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

describe('library bundle', () => {
  const esmPath = resolve(__dirname, '../dist/index.esm.js');

  it.skipIf(!existsSync(esmPath))('does not inline React DOM / scheduler', () => {
    const source = readFileSync(esmPath, 'utf8');
    expect(source).not.toContain('react.transitional.element');
    expect(source).not.toContain('unstable_scheduleCallback');
    expect(source).toMatch(/from ["']react["']/);
    expect(source).toMatch(/from ["']react-dom\/client["']/);
  });

  const cjsPath = resolve(__dirname, '../dist/index.cjs.js');

  it.skipIf(!existsSync(cjsPath))('emits a CJS build that requires react (not UMD globals)', () => {
    const source = readFileSync(cjsPath, 'utf8');
    expect(source).toMatch(/require\(["']react["']\)/);
    expect(source).not.toContain('react.transitional.element');
  });
});

describe('package exports / sideEffects', () => {
  it('exports map covers ESM, CJS, types, and CSS', () => {
    expect(pkg.main).toBe('dist/index.cjs.js');
    expect(pkg.module).toBe('dist/index.esm.js');
    expect(pkg.types).toBe('dist/index.d.ts');
    expect(pkg.exports['.'].types).toBe('./dist/index.d.ts');
    expect(pkg.exports['.'].import).toBe('./dist/index.esm.js');
    expect(pkg.exports['.'].require).toBe('./dist/index.cjs.js');
    expect(pkg.exports['./style.css']).toBe('./dist/style.css');
    expect(pkg.sideEffects).toEqual(expect.arrayContaining(['**/*.css', './src/index.ts']));
    expect(pkg.peerDependencies.react).toBe('>=18.0.0');
  });
});

