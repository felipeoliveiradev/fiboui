import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

describe('library bundle', () => {
  const esmPath = resolve(__dirname, '../dist/index.js');

  it.skipIf(!existsSync(esmPath))('does not inline React DOM / scheduler', () => {
    const source = readFileSync(esmPath, 'utf8');
    expect(source).not.toContain('react.transitional.element');
    expect(source).not.toContain('unstable_scheduleCallback');
    expect(source).toMatch(/from ["']react["']/);
  });

  it.skipIf(!existsSync(esmPath))('is ESM-only and does not import CSS', () => {
    const source = readFileSync(esmPath, 'utf8');
    expect(source).not.toMatch(/require\(/);
    expect(source).not.toMatch(/style\.css/);
    expect(source).not.toMatch(/base\.css/);
  });
});

describe('package exports / sideEffects', () => {
  it('is ESM-only with subpath exports and no src/ pack', () => {
    expect(pkg.type).toBe('module');
    expect(pkg.version).toBe('2.0.0');
    expect(pkg.main).toBe('./dist/index.js');
    expect(pkg.module).toBe('./dist/index.js');
    expect(pkg.types).toBe('./dist/index.d.ts');
    expect(pkg.exports['.'].import).toBe('./dist/index.js');
    expect(pkg.exports['.']).not.toHaveProperty('require');
    expect(pkg.exports['./core'].import).toBe('./dist/core.js');
    expect(pkg.exports['./layout'].import).toBe('./dist/layout.js');
    expect(pkg.exports['./content'].import).toBe('./dist/content.js');
    expect(pkg.exports['./interactive'].import).toBe('./dist/interactive.js');
    expect(pkg.exports['./structure'].import).toBe('./dist/structure.js');
    expect(pkg.exports['./navigation'].import).toBe('./dist/navigation.js');
    expect(pkg.exports['./theme'].import).toBe('./dist/theme.js');
    expect(pkg.exports['./style.css']).toBe('./dist/style.css');
    expect(pkg.files).toEqual(['dist']);
    expect(pkg.sideEffects).toEqual(['**/*.css']);
    expect(pkg.peerDependencies.react).toBe('>=18.0.0');
  });

  it('publish workflow reads version under type=module', () => {
    const version = execSync(
      `node --input-type=commonjs -e "const fs=require('fs'); process.stdout.write(JSON.parse(fs.readFileSync('package.json','utf8')).version)"`,
      { encoding: 'utf8', cwd: resolve(__dirname, '..') }
    );
    expect(version).toBe('2.0.0');
  });
});

describe('built artifacts', () => {
  const dist = resolve(__dirname, '../dist');
  const ready = existsSync(resolve(dist, 'index.js')) && existsSync(resolve(dist, 'index.d.ts'));

  it.skipIf(!ready)('emits subpath JS, style.css, types, and CLI', () => {
    for (const file of [
      'index.js',
      'index.d.ts',
      'core.js',
      'layout.js',
      'content.js',
      'interactive.js',
      'structure.js',
      'navigation.js',
      'theme.js',
      'style.css',
      'cli/bin.js',
    ]) {
      expect(existsSync(resolve(dist, file)), file).toBe(true);
    }
    const dts = readFileSync(resolve(dist, 'index.d.ts'), 'utf8');
    expect(dts).toContain('export declare const Column');
    expect(dts).toContain('export declare function createReactivityRoot');
    expect(dts).toContain('export declare function bindText');
    expect(readFileSync(resolve(dist, 'index.js'), 'utf8')).not.toMatch(/style\.css|base\.css/);
  });

  it.skipIf(!ready)('npm pack file list is dist-only (no src/)', () => {
    const raw = execSync('npm pack --dry-run --json', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '..'),
    });
    const parsed = JSON.parse(raw) as Array<{ files: Array<{ path: string }> }>;
    const files = parsed[0].files.map((f) => f.path);
    expect(files.some((p) => p.startsWith('src/'))).toBe(false);
    expect(files).toContain('dist/index.js');
    expect(files).toContain('dist/index.d.ts');
    expect(files).toContain('dist/style.css');
    expect(files).toContain('package.json');
  });
});
