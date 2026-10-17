import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../package.json';

function walkFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else acc.push(full);
  }
  return acc;
}

function namedExports(src: string): string[] {
  const exported: string[] = [];
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const token = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (token) exported.push(token);
    }
  }
  return exported;
}

function readSrc(rel: string): string {
  return readFileSync(resolve(__dirname, '..', rel), 'utf8');
}


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
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(pkg.homepage).toBe('https://fiboui.vercel.app');
    expect(pkg.main).toBe('./dist/index.js');
    expect(pkg.module).toBe('./dist/index.js');
    expect(pkg.types).toBe('./dist/index.d.ts');
    expect(pkg.exports['.'].import).toBe('./dist/index.js');
    expect(pkg.exports['.']).not.toHaveProperty('require');
    expect(pkg.exports['./core'].import).toBe('./dist/core.js');
    expect(pkg.exports['./core'].types).toBe('./dist/core.d.ts');
    expect(pkg.exports['./core'].types).not.toBe('./dist/index.d.ts');
    expect(pkg.exports['./layout'].import).toBe('./dist/layout.js');
    expect(pkg.exports['./layout'].types).toBe('./dist/layout.d.ts');
    expect(pkg.exports['./content'].import).toBe('./dist/content.js');
    expect(pkg.exports['./content'].types).toBe('./dist/content.d.ts');
    expect(pkg.exports['./interactive'].import).toBe('./dist/interactive.js');
    expect(pkg.exports['./interactive'].types).toBe('./dist/interactive.d.ts');
    expect(pkg.exports['./structure'].import).toBe('./dist/structure.js');
    expect(pkg.exports['./structure'].types).toBe('./dist/structure.d.ts');
    expect(pkg.exports['./navigation'].import).toBe('./dist/navigation.js');
    expect(pkg.exports['./navigation'].types).toBe('./dist/navigation.d.ts');
    expect(pkg.exports['./theme'].import).toBe('./dist/theme.js');
    expect(pkg.exports['./theme'].types).toBe('./dist/theme.d.ts');
    expect(pkg.exports['./server'].import).toBe('./dist/server.js');
    expect(pkg.exports['./server'].types).toBe('./dist/server.d.ts');
    expect(pkg.exports['./server'].types).not.toBe('./dist/index.d.ts');
    expect(pkg.exports['./style.css']).toBe('./dist/style.css');
    expect(pkg.files).toEqual(['dist']);
    expect(pkg.sideEffects).toEqual(['**/*.css']);
    expect(pkg.peerDependencies.react).toBe('>=18.0.0');
    expect(pkg.repository.url).toMatch(/github\.com\/felipeoliveiradev\/fiboui/);
    const readme = readFileSync(resolve(__dirname, '../README.md'), 'utf8');
    expect(readme).toMatch(/^# FiboUI\b/m);
    expect(readme).toContain('https://fiboui.vercel.app');
    expect(readme).toContain('https://fiboui.vercel.app/shop');
  });

  it('2.4.3 CHANGELOG covers audit batch fixes', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.4.3]');
    const end = log.indexOf('## [2.4.2]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    expect(section).toContain('groupFocus');
    expect(section).toContain('endSsrRequest');
    expect(section).toContain('bob/hang/buzz');
  });

  it('2.4.2 CHANGELOG fixes multi-property transition snap', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.4.2]');
    const end = log.indexOf('## [2.4.1]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(log.slice(start, end)).toContain('Multi-property CSS transitions');
  });

  it('2.4.1 CHANGELOG fixes fx transform jump', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.4.1]');
    const end = log.indexOf('## [2.4.0]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(log.slice(start, end)).toContain('smoothness');
  });

  it('2.4.0 CHANGELOG names interaction effect presets', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.4.0]');
    const end = log.indexOf('## [2.3.0]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    expect(section).toContain('hoverEffect');
    expect(section).toContain('.effect(');
    expect(section).toContain('sweep');
    expect(section).toContain('INTERACTION_EFFECTS');
    expect(section).toContain('fiboui-owned');
  });

  it('2.3.0 CHANGELOG names fluent theme engine + noir', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.3.0]');
    const end = log.indexOf('## [2.2.4]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    expect(section).toContain('noir');
    expect(section).toContain('.theme(');
    expect(section).toContain('extendTheme');
    expect(section).toContain('SSR-safe');
  });

  it('2.2.4 CHANGELOG keeps open + aliases without break', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.2.4]');
    const end = log.indexOf('## [2.2.3]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    expect(section).toContain('writeClipboard');
    expect(section).toContain('bindHotkeys');
    expect(section).toContain('open(url)');
    expect(section).toContain('openExternal');
    expect(section).toContain('goHash(id)');
    expect(section).toContain('scrollTo');
  });

  it('2.2.3 CHANGELOG names ScrollController and Reveal carousel fix', () => {
    const log = readFileSync(resolve(__dirname, '../CHANGELOG.md'), 'utf8');
    const start = log.indexOf('## [2.2.3]');
    const end = log.indexOf('## [2.2.2]');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    const section = log.slice(start, end);
    expect(section).toContain('ScrollController');
    expect(section).toContain('scrollByChild');
    expect(section).toContain('Reveal');
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
    const scan = readFileSync(resolve(__dirname, '../scripts/secret-scan.sh'), 'utf8');
    expect(scan).toMatch(/gitleaks git --redact/);
    expect(scan).toMatch(/gitleaks dir --redact/);
    expect(scan).not.toMatch(/echo\s+"\$\{got\}"/);
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
    expect(version).toBe(pkg.version);
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

  it('npm-version-check.sh reads package.json version and does not die on E404', () => {
    const out = execSync('bash scripts/npm-version-check.sh', {
      encoding: 'utf8',
      cwd: resolve(__dirname, '..'),
    });
    expect(out).toContain(`version=${pkg.version}`);
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
      'core.d.ts',
      'layout.js',
      'layout.d.ts',
      'content.js',
      'content.d.ts',
      'interactive.js',
      'interactive.d.ts',
      'structure.js',
      'structure.d.ts',
      'navigation.js',
      'navigation.d.ts',
      'theme.js',
      'theme.d.ts',
      'style.css',
      'server.js',
      'server.d.ts',
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
    expect(files).toContain('dist/core.d.ts');
    expect(files).toContain('dist/server.d.ts');
    expect(files).toContain('dist/style.css');
    expect(files).toContain('package.json');
  });
});


describe('subpath source barrels (public factories)', () => {
  it('interactive-entry re-exports Form, formDataToValues, validators, FormErrorMode', () => {
    const src = readSrc('src/interactive-entry.ts');
    const names = namedExports(src);
    for (const name of [
      'Form',
      'formDataToValues',
      'required',
      'minLength',
      'maxLength',
      'email',
      'pattern',
      'min',
      'max',
      'rule',
      'FormErrorMode',
    ]) {
      expect(names, name).toContain(name);
    }
    expect(readSrc('src/interactive/index.ts')).toMatch(/export \* from '\.\/Form'/);
  });

  it('navigation-entry re-exports Outlet, lazyRoute, preloadRoute, useRouteMeta', () => {
    const names = namedExports(readSrc('src/navigation-entry.ts'));
    for (const name of [
      'Router',
      'Link',
      'NavLink',
      'Outlet',
      'lazyRoute',
      'preloadRoute',
      'useRouteMeta',
      'DefaultLoader',
    ]) {
      expect(names, name).toContain(name);
    }
  });

  it('layout-entry re-exports ScrollController with ScrollView', () => {
    const names = namedExports(readSrc('src/layout-entry.ts'));
    expect(names).toContain('ScrollView');
    expect(names).toContain('ScrollController');
  });

  it('structure-entry re-exports public card factories', () => {
    const names = namedExports(readSrc('src/structure-entry.ts'));
    for (const name of ['AssetCard', 'ProfileCard', 'CollectionCard', 'ContentCard', 'Box', 'List']) {
      expect(names, name).toContain(name);
    }
  });

  it('core-entry re-exports listSignal, interp, and createPage', () => {
    const names = namedExports(readSrc('src/core-entry.ts'));
    for (const name of ['listSignal', 'collection', 'interp', 'createPage', 'page', 'signal']) {
      expect(names, name).toContain(name);
    }
  });

  it('root index re-exports createPage next to page()', () => {
    const names = namedExports(readSrc('src/index.ts'));
    expect(names).toContain('page');
    expect(names).toContain('createPage');
    expect(names).toContain('Form');
    expect(names).toContain('formDataToValues');
  });

  it('vite lib interactive entry is interactive-entry and Form is a client island', () => {
    const vite = readSrc('vite.config.ts');
    expect(vite).toMatch(/interactive:\s*path\.resolve\(__dirname,\s*'src\/interactive-entry\.ts'\)/);
    expect(vite).toMatch(/interactive\\?\/Form/);
  });
});

describe('server-entry vs docs / fixtures', () => {
  const serverEntry = readFileSync(resolve(__dirname, '../src/server-entry.ts'), 'utf8');
  const exported: string[] = [];
  for (const m of serverEntry.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const token = part.trim().split(/\s+as\s+/).pop()?.trim();
      if (token) exported.push(token);
    }
  }

  it('exports documented RSC names plus Header/Grid used by SSR fixtures', () => {
    for (const name of [
      'page',
      'withFiboStyles',
      'createPage',
      'FiboStyles',
      'getStyleTag',
      'getCss',
      'endSsrRequest',
      'Column',
      'Row',
      'Box',
      'Text',
      'Button',
      'Card',
      'Header',
      'Grid',
    ]) {
      expect(exported, name).toContain(name);
    }
  });

  it('does not export client-only APIs (Router, mount, signal)', () => {
    expect(exported).not.toContain('Router');
    expect(exported).not.toContain('mount');
    expect(exported).not.toContain('signal');
  });
});

describe('fixtures consume the public package surface', () => {
  it('boilerplate imports fiboui/style.css (not fiboui/dist/style.css)', () => {
    const main = readFileSync(resolve(__dirname, '../boilerplate/src/main.tsx'), 'utf8');
    expect(main).toContain("fiboui/style.css");
    expect(main).not.toContain('fiboui/dist/style.css');
  });

  it('boilerplate does not import unpublished fiboui names', () => {
    const banned =
      /\b(Colors|createFiboComponent|SignalType|Injectable|DragGesture)\b|fiboui\/dist\/style|@Signal\b|container\.resolve/;
    const files = walkFiles(resolve(__dirname, '../boilerplate/src')).filter((f) =>
      /\.(ts|tsx)$/.test(extname(f))
    );
    expect(files.length).toBeGreaterThan(5);
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      expect(src, file.replace(resolve(__dirname, '..') + '/', '')).not.toMatch(banned);
    }
  });

  it('SSR Next fixture is a Server Component using page()', () => {
    const page = readFileSync(
      resolve(__dirname, '../examples/ssr-fixtures/next/app/page.tsx'),
      'utf8'
    );
    expect(page).not.toMatch(/['"]use client['"]/);
    expect(page).toMatch(/\bpage\s*\(/);
  });

  it('SSR fixture App is a static tree (no useEffect)', () => {
    const app = readFileSync(
      resolve(__dirname, '../examples/ssr-fixtures/shared/App.tsx'),
      'utf8'
    );
    expect(app).not.toMatch(/\buseEffect\b/);
    expect(app).toContain('Hydration audit');
    expect(app).toContain('Header');
    expect(app).toContain('Grid');
  });
});

describe('dist barrels match source barrels (W6-08)', () => {
  const interactiveDist = resolve(__dirname, '../dist/interactive.js');
  const navigationDist = resolve(__dirname, '../dist/navigation.js');

  it.skipIf(!existsSync(interactiveDist))(
    'dist/interactive.js exports Form and source interactive-entry still does',
    () => {
      const srcNames = namedExports(readSrc('src/interactive-entry.ts'));
      expect(srcNames).toContain('Form');
      expect(srcNames).toContain('formDataToValues');
      const distNames = namedExports(readFileSync(interactiveDist, 'utf8'));
      expect(distNames, 'dist/interactive.js Form').toContain('Form');
      expect(distNames, 'dist/interactive.js formDataToValues').toContain('formDataToValues');
    },
  );

  it.skipIf(!existsSync(navigationDist))(
    'dist/navigation.js exports Outlet when navigation-entry does',
    () => {
      const srcNames = namedExports(readSrc('src/navigation-entry.ts'));
      expect(srcNames).toContain('Outlet');
      const distNames = namedExports(readFileSync(navigationDist, 'utf8'));
      expect(distNames, 'dist/navigation.js Outlet').toContain('Outlet');
    },
  );
});

