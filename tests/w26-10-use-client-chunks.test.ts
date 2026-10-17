import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');

function walkTs(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkTs(full, acc);
    else if (/\.[cm]?[jt]sx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function useClientSources(): string[] {
  return walkTs(SRC).filter((file) => {
    const head = readFileSync(file, 'utf8').slice(0, 256);
    return /^\uFEFF?\s*['"]use client['"]/.test(head);
  });
}

describe('W26-10 vite client islands keep the use-client directive', () => {
  it('Scaffold, Sidebar, and mount are use-client (hooks on advertised entries)', () => {
    for (const rel of [
      'src/layout/Scaffold/index.ts',
      'src/layout/Sidebar/index.ts',
      'src/core/mount.ts',
    ]) {
      const head = readFileSync(resolve(ROOT, rel), 'utf8').slice(0, 64);
      expect(head.trimStart(), rel).toMatch(/^['"]use client['"]/);
    }
  });

  it('Column is a server-safe layout factory (not a client island)', () => {
    const head = readFileSync(resolve(ROOT, 'src/layout/Column/index.ts'), 'utf8').slice(0, 64);
    expect(head.trimStart()).not.toMatch(/^['"]use client['"]/);
  });

  it('manualChunks classifies by the source directive so layout hook factories stay in the client chunk', () => {
    const vite = readFileSync(resolve(ROOT, 'vite.config.ts'), 'utf8');
    const code = stripComments(vite);
    const files = useClientSources().map((file) =>
      relative(ROOT, file).replace(/\\/g, '/'),
    );
    expect(files.length).toBeGreaterThan(20);
    expect(files).toEqual(
      expect.arrayContaining([
        'src/layout/Scaffold/index.ts',
        'src/layout/Sidebar/index.ts',
        'src/core/mount.ts',
        'src/interactive/SecureField/index.ts',
      ]),
    );

    const scansSource =
      /function\s+\w*(hasUseClient|clientIsland)/.test(code) ||
      /readFileSync\([^)]*\)[\s\S]{0,240}use client/.test(code);

    if (scansSource) return;

    const reMatch = vite.match(/const clientRe\s*=\s*(\/[\s\S]*?\/[gimsuy]*);/);
    expect(reMatch, 'clientRe allowlist or use-client file scan').toBeTruthy();
    const clientRe = eval(reMatch![1]) as RegExp;
    const misses = files.filter((file) => !clientRe.test(file));
    expect(misses, `uncovered use-client modules:\n${misses.join('\n')}`).toEqual([]);
  });
});
