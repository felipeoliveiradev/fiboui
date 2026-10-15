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
    expect(pkg.version).toBe('2.2.1');
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
    expect(pkg.repository.url).toBe('https://github.com/felipeoliveiradev/fiboui');
    const readme = readFileSync(resolve(__dirname, '../README.md'), 'utf8');
    expect(readme).toMatch(/^# FiboUI v2\.2\.1\b/m);
  });

  it('2.0.0 CHANGELOG names the release APIs used as GitHub Release notes', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.0.0]');
    const end = log.indexOf('## [1.0.3]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    for (const token of [
      'shape',
      'size',
      'tone',
      'expand',
      'Row.hug()',
      'ListTile',
      'Avatar.icon()',
      'ring',
      'segments',
      'mount(',
      'Text.nowrap()',
    ]) {
      expect(section, token).toContain(token);
    }
  });

  it('2.1.0 CHANGELOG says builders render without .build()', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.1.0]');
    const end = log.indexOf('## [2.0.0]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    expect(section).toContain('.build()');
    expect(section).toMatch(/React element/i);
  });

  it('2.2.1 CHANGELOG is dated and names SSR hydration fixes', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.2.1]');
    const end = log.indexOf('## [2.2.0]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const heading = log.slice(start, log.indexOf('\n', start));
    expect(heading).toContain('2026-10-15');
    const section = log.slice(start, end);
    expect(section).toContain('fibo-ps-');
    expect(section).toContain('getStyleTag()');
    expect(section).toContain('.responsive()');
  });

  it('2.2.0 CHANGELOG names media queries, motion, Presence, and security', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.2.0]');
    const end = log.indexOf('## [2.1.0]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    for (const token of [
      '.media(',
      '.animate(',
      '.onScroll()',
      'Presence(',
      'Gitleaks',
      '.scrollMargin()',
      'PseudoStateBuilder',
    ]) {
      expect(section, token).toContain(token);
    }
  });

  it('publish workflow creates a GitHub Release from the CHANGELOG section', () => {
    const yml = readFileSync(resolve(__dirname, '../.github/workflows/publish.yml'), 'utf8');
    expect(yml).toContain('gh release create');
    expect(yml).toContain('CHANGELOG.md');
    expect(yml).toContain('github.event_name == \'push\'');
    expect(yml).toContain('scripts/npm-version-check.sh');
    expect(yml).toContain('scripts/secret-scan.sh --pack');
    expect(yml).not.toMatch(/set\s+-x/);
    expect(yml).not.toMatch(/echo\s+.*NPM_TOKEN/);
    expect(yml).not.toMatch(/echo\s+.*NODE_AUTH_TOKEN/);
    expect(yml).not.toMatch(/pull_request_target/);
    expect(yml).toMatch(/NODE_AUTH_TOKEN:\s*\$\{\{\s*secrets\.NPM_TOKEN\s*\}\}/);
    expect(yml).not.toMatch(/VERSION="\$\(node --input-type=commonjs -e "/);
  });

  it('CI runs gitleaks and prepublishOnly scans the pack', () => {
    const ci = readFileSync(resolve(__dirname, '../.github/workflows/ci.yml'), 'utf8');
    expect(ci).toContain('scripts/secret-scan.sh --git');
    expect(ci).toMatch(/permissions:\s*\n\s*contents:\s*read/);
    expect(ci).not.toMatch(/pull_request_target/);
    expect(pkg.scripts['secret-scan']).toBe('bash scripts/secret-scan.sh --dir');
    expect(pkg.scripts.prepublishOnly).toBe('bash scripts/secret-scan.sh --pack');
    expect(existsSync(resolve(__dirname, '../scripts/secret-scan.sh'))).toBe(true);
    expect(existsSync(resolve(__dirname, '../.gitleaks.toml'))).toBe(true);
    const ignore = readFileSync(resolve(__dirname, '../.gitignore'), 'utf8');
    const npmignore = readFileSync(resolve(__dirname, '../.npmignore'), 'utf8');
    expect(ignore).toMatch(/^\.env$/m);
    expect(ignore).toMatch(/^\.npmrc$/m);
    expect(npmignore).toMatch(/^\.env$/m);
    expect(npmignore).toMatch(/^\.npmrc$/m);
    expect(pkg.files).toEqual(['dist']);
  });

  it('publish workflow reads version under type=module', () => {
    const version = execSync(
      `node --input-type=commonjs -p 'require("./package.json").version'`,
      { encoding: 'utf8', cwd: resolve(__dirname, '..') }
    ).trim();
    expect(version).toBe('2.2.1');
  });

  it('npm-version-check.sh treats a missing version as exists=false (exit 0)', () => {
    const out = execSync('bash scripts/npm-version-check.sh fiboui 0.0.0-never-published', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '..'),
    });
    expect(out).toMatch(/version=0\.0\.0-never-published/);
    expect(out).toMatch(/exists=false/);
    expect(out).toMatch(/will publish/);
  });

  it('npm-version-check.sh treats a published version as exists=true', () => {
    const out = execSync('bash scripts/npm-version-check.sh react 18.3.1', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '..'),
    });
    expect(out).toMatch(/version=18\.3\.1/);
    expect(out).toMatch(/exists=true/);
    expect(out).toMatch(/already on npm/);
  });

  it('npm-version-check.sh reads 2.2.1 from package.json and does not die on E404', () => {
    const out = execSync('bash scripts/npm-version-check.sh', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '..'),
    });
    expect(out).toMatch(/version=2\.2\.1/);
    expect(out).toMatch(/exists=(true|false)/);
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
