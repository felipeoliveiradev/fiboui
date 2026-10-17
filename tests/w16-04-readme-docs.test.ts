import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

const ROOT = resolve(__dirname, '..');
const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
const index = readFileSync(resolve(ROOT, 'docs/index.md'), 'utf8');

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

describe('W16-04 README + docs/index.md vs package exports / live URLs', () => {
  it('README names every JS subpath plus fiboui/style.css', () => {
    const exports = pkg.exports as Record<string, unknown>;
    for (const key of Object.keys(exports)) {
      if (key === '.' || key === './package.json') continue;
      const spec = `fiboui/${key.slice(2)}`;
      expect(readme, spec).toContain(spec);
    }
    for (const name of JS_SUBPATHS) {
      expect(pkg.exports).toHaveProperty(`./${name}`);
    }
  });

  it('README advertises live /shop and /play (not only the origin)', () => {
    expect(readme).toContain('https://fiboui.vercel.app/shop');
    expect(readme).toContain('https://fiboui.vercel.app/play');
    expect(readme).toContain('https://github.com/felipeoliveiradev/fiboui');
  });

  it('docs/index.md GitHub + getting-started paths are real', () => {
    expect(index).toContain('https://github.com/felipeoliveiradev/fiboui');
    expect(index).toContain('/guide/getting-started');
  });

  it('docs/index.md names the JS subpaths', () => {
    for (const name of JS_SUBPATHS) {
      expect(index, `fiboui/${name}`).toContain(`fiboui/${name}`);
    }
  });
});
