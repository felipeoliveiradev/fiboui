import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { joinBasename, resolveGenerateDir, resolveUnderRoot } from '../src/cli/config';
import { pluginNames, toPascalCase } from '../src/cli/names';

describe('joinBasename', () => {
  const dir = resolve('/tmp/fibo-proj/src/components');

  it('joins a single segment under the directory', () => {
    expect(joinBasename(dir, 'Hero')).toBe(resolve(dir, 'Hero'));
    expect(joinBasename(dir, 'AuthPlugin.ts')).toBe(resolve(dir, 'AuthPlugin.ts'));
  });

  it('rejects parent segments, separators, and empty names', () => {
    expect(() => joinBasename(dir, '..')).toThrow(/path segment/i);
    expect(() => joinBasename(dir, '../etc')).toThrow(/path segment/i);
    expect(() => joinBasename(dir, `foo${sep}bar`)).toThrow(/path segment/i);
    expect(() => joinBasename(dir, 'foo/bar')).toThrow(/path segment/i);
    expect(() => joinBasename(dir, '')).toThrow(/path segment/i);
    expect(() => joinBasename(dir, '.')).toThrow(/path segment/i);
  });
});

describe('resolveGenerateDir path traversal', () => {
  it('rejects config paths that escape cwd (relative .. and absolute)', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'fibo-w8-01-'));
    const escaped = {
      paths: {
        components: `..${sep}..${sep}etc`,
        plugins: resolve('/tmp/fibo-w8-01-evil'),
        modules: `..${sep}outside`,
      },
    };

    expect(() => resolveGenerateDir('component', cwd, escaped)).toThrow(/escapes project/i);
    expect(() => resolveGenerateDir('plugin', cwd, escaped)).toThrow(/escapes project/i);
    expect(() => resolveGenerateDir('module', cwd, escaped, 'Billing')).toThrow(/escapes project/i);
  });

  it('rejects extra module segments that would leave the modules root', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'fibo-w8-01-mod-'));
    expect(() => resolveGenerateDir('module', cwd, null, `..${sep}evil`)).toThrow(/path segment/i);
    expect(() => resolveGenerateDir('module', cwd, null, 'foo/bar')).toThrow(/path segment/i);
  });

  it('keeps in-project relative paths', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'fibo-w8-01-ok-'));
    const config = { paths: { components: 'app/ui', plugins: 'app/plug', modules: 'app/mod' } };
    expect(resolveGenerateDir('component', cwd, config)).toBe(resolve(cwd, 'app/ui'));
    expect(resolveGenerateDir('plugin', cwd, config)).toBe(resolve(cwd, 'app/plug'));
    expect(resolveGenerateDir('module', cwd, config, 'Billing')).toBe(resolve(cwd, 'app/mod', 'Billing'));
  });
});

describe('resolveUnderRoot', () => {
  it('allows a nested path and rejects escape', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'fibo-w8-01-root-'));
    expect(resolveUnderRoot(cwd, 'src/components')).toBe(resolve(cwd, 'src/components'));
    expect(() => resolveUnderRoot(cwd, '../../etc')).toThrow(/escapes project/i);
  });
});

describe('missing / invalid generate names', () => {
  it('does not turn undefined/null into Undefined/Null identifiers', () => {
    expect(toPascalCase(undefined as unknown as string)).toBe('');
    expect(toPascalCase(null as unknown as string)).toBe('');
  });

  it('yields a valid TS identifier when the raw name starts with a digit', () => {
    expect(toPascalCase('123')).toMatch(/^[A-Za-z_][A-Za-z0-9]*$/);
    expect(toPascalCase('2fa')).toMatch(/^[A-Za-z_][A-Za-z0-9]*$/);
    expect(pluginNames('123').safeName).toMatch(/^[A-Za-z_][A-Za-z0-9]*$/);
  });
});
