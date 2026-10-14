import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { render } from '@testing-library/react';
const root = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname), '..');

function extract() {
  execSync('node scripts/extract-doc-snippets.mjs', { cwd: root, stdio: 'pipe' });
}

describe('documentation snippets', () => {
  extract();

  const manifestPath = path.join(root, 'tests/.generated-snippets/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    id: string;
    file: string;
    index: number;
    out: string;
  }[];

  it('extracts at least one snippet per required guide', () => {
    const files = new Set(manifest.map((m) => m.file));
    const required = [
      'guide/getting-started.md',
      'guide/mental-model.md',
      'guide/migration.md',
      'guide/builders.md',
      'guide/theming.md',
      'guide/responsive.md',
      'guide/state-management.md',
      'guide/animation.md',
      'guide/scroll.md',
      'guide/routing.md',
      'guide/ssr.md',
      'examples/forms.md',
      'examples/dashboard.md',
      'examples/list-keys.md',
      'examples/modal-presence.md',
    ];
    for (const file of required) {
      expect(files.has(file), `missing snippet in docs/${file}`).toBe(true);
    }
    expect(manifest.length).toBeGreaterThan(40);
  });

  it('type-checks every extracted snippet with tsc', () => {
    execSync('npx tsc --noEmit -p tsconfig.docs-snippets.json', {
      cwd: root,
      stdio: 'pipe',
    });
  });

  it.each(manifest.map((m) => [m.id, m]))('renders %s', async (_id, item) => {
    const rel = './' + path.relative(path.join(root, 'tests'), path.join(root, item.out)).replace(/\\/g, '/');
    const mod = await import(/* @vite-ignore */ `${rel}?snippet=${item.id}`);
    const Component =
      mod.default ??
      mod.Example ??
      mod.App ??
      Object.values(mod).find((v) => typeof v === 'function');
    if (typeof Component !== 'function') {
      return;
    }
    const result = render(createElement(Component));
    expect(result.container).toBeTruthy();
    result.unmount();
  });
});
