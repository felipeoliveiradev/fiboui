import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

const ROOT = resolve(__dirname, '..');

const JS_SUBPATHS = [
  'core',
  'layout',
  'content',
  'interactive',
  'structure',
  'navigation',
  'theme',
  'server',
] as const;

function namedExports(src: string): string[] {
  const exported: string[] = [];
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const token = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (token) exported.push(token);
    }
  }
  return exported;
}

function entryFile(name: string): string {
  return name === 'server' ? 'src/server-entry.ts' : `src/${name}-entry.ts`;
}

describe('W15-10 subpath types (not the full index.d.ts)', () => {
  it('each JS subpath exports a dedicated .d.ts, never index.d.ts', () => {
    for (const name of JS_SUBPATHS) {
      const exp = pkg.exports[`./${name}`] as { types?: string; import?: string };
      expect(exp.types, `${name} types`).toBe(`./dist/${name}.d.ts`);
      expect(exp.types, `${name} must not type-claim index.d.ts`).not.toBe(
        './dist/index.d.ts',
      );
      expect(Object.keys(exp)[0], `${name} types condition first`).toBe('types');
      expect(exp.import, `${name} import`).toBe(`./dist/${name}.js`);
    }
  });

  it('root still types from the bundled index.d.ts', () => {
    expect(pkg.types).toBe('./dist/index.d.ts');
    expect(pkg.exports['.'].types).toBe('./dist/index.d.ts');
  });

  it('style.css stays a CSS subpath (no JS types claim)', () => {
    expect(pkg.exports['./style.css']).toBe('./dist/style.css');
  });

  const ready = JS_SUBPATHS.every((name) =>
    existsSync(resolve(ROOT, 'dist', `${name}.d.ts`)),
  );

  it.skipIf(!ready)('subpath .d.ts re-export only that entry’s names from index.js', () => {
    for (const name of JS_SUBPATHS) {
      const dts = readFileSync(resolve(ROOT, 'dist', `${name}.d.ts`), 'utf8');
      expect(dts, name).not.toMatch(/export\s+\*\s+from/);
      expect(dts, name).not.toContain('index.d.ts');
      expect(dts, name).toMatch(/from ['"]\.\/index\.js['"]/);

      const entryNames = namedExports(
        readFileSync(resolve(ROOT, entryFile(name)), 'utf8'),
      );
      const dtsNames = namedExports(dts);
      expect(dtsNames.sort(), name).toEqual([...entryNames].sort());
    }
  });

  it.skipIf(!existsSync(resolve(ROOT, 'dist/core.d.ts')))(
    'fiboui/core types do not claim Button / Router / Form',
    () => {
      const dts = readFileSync(resolve(ROOT, 'dist/core.d.ts'), 'utf8');
      expect(namedExports(dts)).toContain('signal');
      expect(namedExports(dts)).not.toContain('Button');
      expect(namedExports(dts)).not.toContain('Router');
      expect(namedExports(dts)).not.toContain('Form');
    },
  );

  it.skipIf(!existsSync(resolve(ROOT, 'dist/server.d.ts')))(
    'fiboui/server types expose page() but not Router / signal / mount',
    () => {
      const dts = readFileSync(resolve(ROOT, 'dist/server.d.ts'), 'utf8');
      const names = namedExports(dts);
      expect(names).toContain('page');
      expect(names).toContain('getStyleTag');
      expect(names).not.toContain('Router');
      expect(names).not.toContain('signal');
      expect(names).not.toContain('mount');
    },
  );

  it('vite lib entries cover every JS subpath plus index/style', () => {
    const vite = readFileSync(resolve(ROOT, 'vite.config.ts'), 'utf8');
    for (const name of JS_SUBPATHS) {
      if (name === 'server') continue;
      expect(vite, name).toMatch(
        new RegExp(`${name}:\\s*path\\.resolve\\(__dirname,\\s*'src/${name}-entry\\.ts'\\)`),
      );
    }
    expect(vite).toMatch(/index:\s*path\.resolve\(__dirname,\s*'src\/index\.ts'\)/);
    expect(vite).toMatch(/style:\s*path\.resolve\(__dirname,\s*'src\/style-entry\.ts'\)/);
  });
});
