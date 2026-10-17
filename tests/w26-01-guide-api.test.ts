import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as corePublic from '../src/core-entry';
import * as fiboPublic from '../src/index';

const ROOT = resolve(__dirname, '..');
const guide = (name: string) => readFileSync(resolve(ROOT, 'docs/guide', name), 'utf8');

describe('W26-01 docs/guide vs shipped API', () => {
  it('responsive.md does not call .responsive() a JS viewport API', () => {
    const md = guide('responsive.md');
    expect(md).not.toMatch(/\.responsive\(\)[^\n]*JS viewport/);
    expect(md).not.toMatch(/unless you need JS/);
    expect(md).toMatch(/\.responsive\([\s\S]{0,200}CSS `@media`/);
  });

  it('responsive.md does not claim Grid().columns() is Tailwind classes', () => {
    const md = guide('responsive.md');
    expect(md).not.toMatch(/real API \(Tailwind classes\)/);
    expect(md).toMatch(/Grid\(\)\.columns\(\{\s*sm:\s*1,\s*md:\s*2,\s*lg:\s*3\s*\}\)/);
    expect(md).toMatch(/grid-template-columns|repeat\(/);
  });

  it('ssr.md does not claim Presence first-render is false', () => {
    const md = guide('ssr.md');
    expect(md).not.toMatch(/`Presence`\s*\/\s*`usePrefersReducedMotion\(\)`[^\n]*`false`/);
    expect(md).toMatch(/`usePrefersReducedMotion\(\)`[^\n]*`false`/);
    expect(md).toMatch(/`Presence`[^\n]*`show`/);
  });

  it('fiboui/core does not export useStore (decorator useStore is fiboui root)', () => {
    expect(corePublic).not.toHaveProperty('useStore');
    expect(fiboPublic).toHaveProperty('useStore');
    expect(fiboPublic).toHaveProperty('useReactiveStore');
    const md = guide('state-management.md');
    expect(md).not.toMatch(/useStore['"]?\s+from\s+`fiboui\/core`/);
    expect(md).not.toMatch(/exported historically as `useStore` from `fiboui\/core`/);
  });

  it('state-management.md has no broken file: links and defines sample locals', () => {
    const md = guide('state-management.md');
    expect(md).not.toMatch(/\]\(file:\//);
    expect(md).not.toMatch(/exemplo-completo/);
    if (md.includes('ProductSidebar()')) {
      expect(md).toMatch(/function ProductSidebar/);
    }
    if (md.includes('signal(lightTheme)')) {
      expect(md).toMatch(/const lightTheme\s*=/);
    }
  });
});
