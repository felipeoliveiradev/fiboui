import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadFiboConfig, parseFiboConfigSource, resolveGenerateDir } from '../src/cli/config';
import { pluginNames, toKebabCase, toPascalCase } from '../src/cli/names';
import {
  componentTemplate,
  initConfigSource,
  moduleFiles,
  modulePageTemplate,
  pluginTemplate,
} from '../src/cli/templates';

const ROOT = resolve(process.cwd());
const CLI_ROOT = join(ROOT, 'src/cli');

async function listTsFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listTsFiles(full)));
    else if (entry.name.endsWith('.ts')) out.push(full);
  }
  return out;
}

describe('CLI ESM specifiers', () => {
  it('uses explicit .js (or .json) on every relative import', async () => {
    const files = await listTsFiles(CLI_ROOT);
    expect(files.length).toBeGreaterThan(0);
    const bad: string[] = [];
    for (const file of files) {
      const source = await readFile(file, 'utf8');
      for (const match of source.matchAll(/^import\s+[\s\S]*?from\s+['"](\.[^'"]+)['"]/gm)) {
        const spec = match[1];
        if (!/\.(js|json)$/.test(spec)) {
          bad.push(`${relative(CLI_ROOT, file)}: ${spec}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('name sanitization', () => {
  it('turns kebab/snake names into PascalCase identifiers', () => {
    expect(toPascalCase('my-card')).toBe('MyCard');
    expect(toPascalCase('user_profile')).toBe('UserProfile');
    expect(toPascalCase('Hero')).toBe('Hero');
  });

  it('turns PascalCase into kebab paths', () => {
    expect(toKebabCase('AuthPlugin')).toBe('auth-plugin');
    expect(toKebabCase('my-card')).toBe('my-card');
  });
});

describe('generate templates (2.0 playground style)', () => {
  it('component is a function, 2-space indent, no .build() / Component<>()()', () => {
    const src = componentTemplate('Hero');
    expect(src).toContain("import { Row, Text } from 'fiboui'");
    expect(src).toContain('export function Hero(');
    expect(src).toContain('  return Row()');
    expect(src).toContain('    .children([');
    expect(src).toContain("      Text(title).fontSize(18).fontWeight('bold')");
    expect(src).not.toMatch(/\.build\s*\(/);
    expect(src).not.toMatch(/Component\s*</);
    expect(src).not.toContain('FiboBuilder');
    expect(src).not.toContain('\t');
    expect(src).not.toContain("from 'react'");
  });

  it('plugin does not pull lucide-react and uses FiboPlugin', () => {
    const src = pluginTemplate('Auth');
    expect(src).toContain('export const AuthPlugin');
    expect(src).toContain('FiboPlugin');
    expect(src).toContain("path: '/auth'");
    expect(src).not.toContain('lucide-react');
    expect(src).not.toMatch(/\.build\s*\(/);
    expect(src).not.toContain('\t');
  });

  it('module page uses Column/Text without .build() or unused FiboBuilder', () => {
    const src = modulePageTemplate('Billing');
    expect(src).toContain('export function BillingPage');
    expect(src).toContain("Text('Billing Module').variant('h2')");
    expect(src).not.toMatch(/\.build\s*\(/);
    expect(src).not.toContain('FiboBuilder');
    expect(src).not.toContain('\t');
  });

  it('init config is ESM export default, not CommonJS', () => {
    const src = initConfigSource(true);
    expect(src).toMatch(/export default/);
    expect(src).not.toMatch(/module\.exports/);
    expect(src).toContain("modules: 'src/modules'");
  });
});

describe('fibo.config.js paths', () => {
  it('loads an ESM config and resolveGenerateDir honors it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fibo-cli-'));
    await writeFile(
      join(dir, 'fibo.config.js'),
      `export default { paths: { components: 'app/ui', plugins: 'app/plug', modules: 'app/mod' } }\n`
    );
    const config = await loadFiboConfig(dir);
    expect(config?.paths.components).toBe('app/ui');
    expect(resolveGenerateDir('component', dir, config)).toBe(join(dir, 'app/ui'));
    expect(resolveGenerateDir('plugin', dir, config)).toBe(join(dir, 'app/plug'));
    expect(resolveGenerateDir('module', dir, config, 'Billing')).toBe(join(dir, 'app/mod', 'Billing'));
  });

  it('falls back when no config file exists', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fibo-cli-empty-'));
    const config = await loadFiboConfig(dir);
    expect(config).toBeNull();
    expect(resolveGenerateDir('plugin', dir, null)).toBe(join(dir, 'src/plugins'));
    expect(resolveGenerateDir('module', dir, null, 'Shop')).toBe(join(dir, 'src/modules', 'Shop'));
  });
});

describe('CLI package entry', () => {
  it('bin points at the compiled ESM cli', async () => {
    const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.type).toBe('module');
    expect(pkg.bin.fibo).toBe('./dist/cli/bin.js');
  });
});


describe('removed 1.x APIs (Chip / IconButton / .build())', () => {
  function generatedBlob(): string {
    return [
      componentTemplate('my-card'),
      pluginTemplate('auth-plugin'),
      modulePageTemplate('user-profile'),
      ...Object.values(moduleFiles('shop')),
    ].join('\n');
  }

  it('does not emit Chip, IconButton, Component<>()(), lucide-react, or .build()', () => {
    const blob = generatedBlob();
    expect(blob).not.toMatch(/\bChip\s*\(/);
    expect(blob).not.toMatch(/\bIconButton\s*\(/);
    expect(blob).not.toMatch(/Component\s*</);
    expect(blob).not.toContain('lucide-react');
    expect(blob).not.toMatch(/\.build\s*\(/);
    expect(blob).not.toContain('FiboBuilder');
  });

  it('kebab-case names become PascalCase identifiers', () => {
    expect(componentTemplate('my-card')).toContain('export function MyCard(');
    expect(pluginTemplate('auth-plugin')).toContain('export const AuthPlugin');
    expect(pluginTemplate('auth-plugin')).toContain("path: '/auth'");
    expect(pluginNames('my-auth')).toEqual({
      safeName: 'MyAuthPlugin',
      label: 'MyAuth',
      path: '/my-auth',
    });
    expect(modulePageTemplate('user-profile')).toContain('export function UserProfilePage');
    expect(Object.keys(moduleFiles('shop'))).toContain('presentation/pages/ShopPage.tsx');
  });
});

describe('init config parse round-trip', () => {
  it('parses the ESM source fibo init writes, including comment notes', () => {
    const clean = parseFiboConfigSource(initConfigSource(true));
    expect(clean?.paths.modules).toBe('src/modules');
    expect(clean?.paths.plugins).toBe('src/plugins');
    expect(clean?.paths.components).toBe('src/components');
    expect(clean?.architecture).toBe('clean');

    const custom = parseFiboConfigSource(initConfigSource(false));
    expect(custom?.architecture).toBe('custom');
    expect(custom?.paths.core).toBe('src/core');
  });
});
