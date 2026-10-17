import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIBO_THEMES } from '../src/theme/themeData';

const ROOT = resolve(__dirname, '..');
const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
const index = readFileSync(resolve(ROOT, 'docs/index.md'), 'utf8');

const PRESETS = Object.keys(FIBO_THEMES);

describe('W26-04 README + docs/index.md vs shipped theme presets', () => {
  it('ships material, cupertino, web, and noir', () => {
    expect(PRESETS.sort()).toEqual(['cupertino', 'material', 'noir', 'web']);
  });

  it('docs/index.md Theme System names every preset (including noir)', () => {
    const themeBlock = index.match(/title:\s*Theme System\n\s*details:\s*.+/);
    expect(themeBlock, 'Theme System feature').not.toBeNull();
    const details = themeBlock![0];
    for (const name of PRESETS) {
      expect(details, `docs/index.md Theme System missing ${name}`).toMatch(
        new RegExp(name, 'i'),
      );
    }
  });

  it('README names every theme preset', () => {
    for (const name of PRESETS) {
      expect(readme, `README missing ${name}`).toMatch(new RegExp(name, 'i'));
    }
  });
});
