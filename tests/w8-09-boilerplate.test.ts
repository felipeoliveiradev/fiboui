import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '..');
const BOILER = resolve(ROOT, 'boilerplate');

function readBoiler(rel: string): string {
  return readFileSync(resolve(BOILER, rel), 'utf8');
}

describe('W8-09 boilerplate entry', () => {
  const main = readBoiler('src/main.tsx');
  const html = readBoiler('index.html');
  const vite = readBoiler('vite.config.ts');
  const pkg = JSON.parse(readBoiler('package.json')) as {
    dependencies?: Record<string, string>;
  };

  it('index.html mounts #root and loads /src/main.tsx', () => {
    expect(html).toMatch(/<div id="root"><\/div>/);
    expect(html).toContain('src="/src/main.tsx"');
  });

  it('loads fiboui/style.css (not dist path or missing CSS)', () => {
    expect(main).toContain("import 'fiboui/style.css'");
    expect(main).not.toContain('fiboui/dist/style.css');
  });

  it('depends on the fiboui package, not a relative src import', () => {
    expect(pkg.dependencies?.fiboui).toBeTruthy();
    expect(main).toMatch(/from ['"]fiboui['"]/);
    expect(main).not.toMatch(/from ['"]\.\.\/src/);
  });

  it('boots with FiboApp().root().mount("root") instead of react-dom createRoot', () => {
    expect(main).toMatch(/FiboApp\s*\(/);
    expect(main).toMatch(/\.root\s*\(/);
    expect(main).toMatch(/\.mount\s*\(\s*['"]root['"]/);
    expect(main).not.toMatch(/from ['"]react-dom\/client['"]/);
    expect(main).not.toMatch(/ReactDOM\.createRoot/);
    expect(main).not.toMatch(/createRoot\s*\(/);
  });

  it('still wraps the tree in FiboThemeProvider', () => {
    expect(main).toMatch(/FiboThemeProvider/);
  });

  it('dedupes react so linked fiboui does not pull a second copy', () => {
    expect(vite).toMatch(/dedupe\s*:/);
    expect(vite).toMatch(/['"]react['"]/);
    expect(vite).toMatch(/['"]react-dom['"]/);
  });
});
