import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { componentCommand } from '../src/cli/commands/generate/component';
import { loadFiboConfig, resolveGenerateDir } from '../src/cli/config';

describe('loadFiboConfig native ESM', () => {
  it('evaluates computed export default in fibo.config.mjs (not JSON-ish regex)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fibo-w26-08-esm-'));
    await writeFile(
      join(dir, 'fibo.config.mjs'),
      `const root = 'app';
export default {
  paths: {
    components: root + '/ui',
    plugins: root + '/plug',
    modules: root + '/mod',
  },
  architecture: 'clean',
};
`
    );

    const config = await loadFiboConfig(dir);
    expect(config?.paths.components).toBe('app/ui');
    expect(config?.paths.plugins).toBe('app/plug');
    expect(config?.paths.modules).toBe('app/mod');
    expect(config?.architecture).toBe('clean');
    expect(resolveGenerateDir('component', dir, config)).toBe(join(dir, 'app/ui'));
  });

  it('evaluates computed module.exports in fibo.config.cjs', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fibo-w26-08-cjs-'));
    await writeFile(
      join(dir, 'fibo.config.cjs'),
      `const root = 'lib';
module.exports = {
  paths: { components: root + '/widgets', plugins: root + '/plug' },
  architecture: 'custom',
};
`
    );

    const config = await loadFiboConfig(dir);
    expect(config?.paths.components).toBe('lib/widgets');
    expect(config?.paths.plugins).toBe('lib/plug');
    expect(config?.architecture).toBe('custom');
  });

  it('throws when a config file exists but is not a valid FiboUI config', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fibo-w26-08-bad-'));
    await writeFile(join(dir, 'fibo.config.mjs'), 'export const nope = 1;\n');

    await expect(loadFiboConfig(dir)).rejects.toThrow(/invalid/i);
  });
});

describe('generate exit code', () => {
  const prevCwd = process.cwd();
  const prevExit = process.exitCode;

  afterEach(() => {
    process.chdir(prevCwd);
    process.exitCode = prevExit;
  });

  it('sets exitCode 1 when config paths escape the project', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fibo-w26-08-exit-'));
    await writeFile(
      join(dir, 'fibo.config.mjs'),
      `export default { paths: { components: '../outside' } };\n`
    );
    process.exitCode = 0;
    process.chdir(dir);
    await componentCommand.parseAsync(['Hero'], { from: 'user' });
    expect(process.exitCode).toBe(1);
  });
});
