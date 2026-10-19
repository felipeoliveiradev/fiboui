import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import rootPkg from '../package.json';

const root = resolve(__dirname, '..');
const extDir = resolve(root, 'extensions/vscode-fiboui');
const workflowPath = resolve(root, '.github/workflows/publish-extension.yml');
const ciPath = resolve(root, '.github/workflows/ci.yml');
const scriptPath = resolve(root, 'scripts/marketplace-version-check.sh');

function read(rel: string): string {
  return readFileSync(resolve(root, rel), 'utf8');
}

describe('extension marketplace pipeline', () => {
  it('keeps the npm library version independent of the editor extension', () => {
    expect(rootPkg.version).toBe('2.8.1');
    const ext = JSON.parse(read('extensions/vscode-fiboui/package.json'));
    expect(ext.version).toBe('0.1.0');
    expect(ext.name).toBe('fiboui');
    expect(ext.publisher).toBe('felipeoliveiradev');
    expect(ext.engines.vscode).toBe('^1.85.0');
  });

  it('ships the editor and FiboUI Noir in one VSIX (no second theme package)', () => {
    const ext = JSON.parse(read('extensions/vscode-fiboui/package.json'));
    const themes = ext.contributes.themes.map((t: { label: string; path: string }) => t.label);
    expect(themes).toEqual(['FiboUI Noir']);
    expect(ext.contributes.themes[0].path).toBe('./themes/fiboui-noir-color-theme.json');
    expect(ext.categories).toContain('Themes');
    expect(existsSync(resolve(root, 'extensions/vscode-fiboui-theme'))).toBe(false);
    expect(existsSync(resolve(root, 'extensions/fiboui-noir'))).toBe(false);
  });

  it('includes an MIT LICENSE so vsce package does not warn', () => {
    const license = read('extensions/vscode-fiboui/LICENSE');
    expect(license).toMatch(/MIT License/);
    expect(license).toMatch(/Permission is hereby granted/);
    const ignore = read('extensions/vscode-fiboui/.vscodeignore');
    expect(ignore).not.toMatch(/^LICENSE$/m);
  });

  it('gitignores packaged .vsix files', () => {
    expect(read('.gitignore')).toMatch(/^\*\.vsix$/m);
  });

  it('CI runs extension tests and vsce package', () => {
    const ci = readFileSync(ciPath, 'utf8');
    expect(ci).toContain('vscode-extension');
    expect(ci).toContain('npm --prefix extensions/vscode-fiboui test');
    expect(ci).toContain('@vscode/vsce');
    expect(ci).toContain('package');
    expect(ci).not.toContain('vsce publish');
    expect(ci).not.toContain('ovsx publish');
  });

  it('publish-extension.yml packages once and publishes to both stores', () => {
    expect(existsSync(workflowPath)).toBe(true);
    const yml = readFileSync(workflowPath, 'utf8');
    expect(yml).toContain('workflow_dispatch');
    expect(yml).toContain('extensions/vscode-fiboui/**');
    expect(yml).toContain('scripts/marketplace-version-check.sh');
    expect(yml).toContain('@vscode/vsce');
    expect(yml).toMatch(/vsce package/);
    expect(yml).toMatch(/vsce publish/);
    expect(yml).toMatch(/ovsx publish/);
    expect(yml).toContain('--skip-duplicate');
    expect(yml).toContain('--packagePath');
    expect(yml).toMatch(/secrets\.VSCE_PAT/);
    expect(yml).toMatch(/secrets\.OVSX_PAT/);
    expect(yml).toContain('VSCE_PAT missing');
    expect(yml).toContain('OVSX_PAT missing');
    expect(yml).toContain('working-directory: extensions/vscode-fiboui');
    expect(yml).not.toMatch(/set\s+-x/);
    expect(yml).not.toMatch(/echo\s+.*\$\{?\s*VSCE_PAT/);
    expect(yml).not.toMatch(/echo\s+.*\$\{?\s*OVSX_PAT/);
    expect(yml).not.toMatch(/pull_request_target/);
    expect(yml).not.toContain('NPM_TOKEN');
    expect(yml).not.toContain('create-namespace');
    expect(yml).not.toContain('v2.7.1');
    expect(yml).toContain('concurrency:');
    expect(yml).toContain('extension-publish');
  });

  it('marketplace-version-check.sh reads the extension manifest under type=module', () => {
    expect(existsSync(scriptPath)).toBe(true);
    const out = execSync('bash scripts/marketplace-version-check.sh', {
      encoding: 'utf8',
      cwd: root,
    });
    expect(out).toContain('version=0.1.0');
    expect(out).toContain('publisher=felipeoliveiradev');
    expect(out).toContain('name=fiboui');
    expect(out).toMatch(/vsce_exists=(true|false)/);
    expect(out).toMatch(/ovsx_exists=(true|false)/);
  });

  it('marketplace-version-check.sh treats a missing version as exists=false (exit 0)', () => {
    const out = execSync(
      'bash scripts/marketplace-version-check.sh felipeoliveiradev fiboui 0.0.0-never',
      { encoding: 'utf8', cwd: root },
    );
    expect(out).toMatch(/version=0\.0\.0-never/);
    expect(out).toMatch(/vsce_exists=false/);
    expect(out).toMatch(/ovsx_exists=false/);
  });

  it('marketplace-version-check.sh treats a published Open VSX version as ovsx_exists=true', () => {
    const out = execSync('bash scripts/marketplace-version-check.sh redhat vscode-yaml 1.14.0', {
      encoding: 'utf8',
      cwd: root,
    });
    expect(out).toMatch(/ovsx_exists=true/);
  });

  it('docs tell the owner how to add VSCE_PAT and OVSX_PAT', () => {
    const publish = read('extensions/vscode-fiboui/PUBLISH.md');
    expect(publish).toContain('VSCE_PAT');
    expect(publish).toContain('OVSX_PAT');
    expect(publish).toContain('open-vsx.org');
    expect(publish).toContain('create-namespace');
    expect(publish).toContain('publish-extension.yml');
    expect(publish).toContain('FiboUI Noir');
    expect(publish).toContain('Cursor');
    const contributing = read('CONTRIBUTING.md');
    expect(contributing).toContain('VSCE_PAT');
    expect(contributing).toContain('OVSX_PAT');
    const changelog = read('CHANGELOG.md');
    const unreleased = changelog.slice(
      changelog.indexOf('## [Unreleased]'),
      changelog.indexOf('## [2.7.1]'),
    );
    expect(unreleased).toMatch(/VSCE_PAT/);
    expect(unreleased).toMatch(/OVSX_PAT/);
    expect(unreleased).toMatch(/FiboUI Noir/);
  });
});

describe('extension unit tests still pass', () => {
  it('runs the vscode-fiboui node test scripts', () => {
    execSync('npm --prefix extensions/vscode-fiboui test', {
      encoding: 'utf8',
      cwd: root,
      stdio: 'pipe',
    });
    expect(existsSync(resolve(extDir, 'src/extension.js'))).toBe(true);
  });
});
