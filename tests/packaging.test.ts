import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

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

