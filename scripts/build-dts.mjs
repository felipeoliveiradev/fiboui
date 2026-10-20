/**
 * Generates bundled .d.ts for the main entry and each package subpath.
 * Run after `vite build`. Invoked by `npm run build:dts`.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const dtsBin = path.join(
  root,
  'node_modules/dts-bundle-generator/dist/bin/dts-bundle-generator.js',
);

const SHARED = [
  '--no-check',
  '--export-referenced-types',
  'false',
  '--project',
  path.join(root, 'tsconfig.dts.json'),
  '--external-imports=@metagptx/css-to-tailwind',
  '--external-imports=react',
  '--external-imports=react-dom',
  '--external-imports=leaflet',
];

/** @type {[outRel: string, inRel: string][]} */
const ENTRIES = [
  ['dist/index.d.ts', 'src/index.ts'],
  ['dist/core.d.ts', 'src/core-entry.ts'],
  ['dist/layout.d.ts', 'src/layout-entry.ts'],
  ['dist/content.d.ts', 'src/content-entry.ts'],
  ['dist/interactive.d.ts', 'src/interactive-entry.ts'],
  ['dist/structure.d.ts', 'src/structure-entry.ts'],
  ['dist/navigation.d.ts', 'src/navigation-entry.ts'],
  ['dist/theme.d.ts', 'src/theme-entry.ts'],
  ['dist/server.d.ts', 'src/server-entry.ts'],
];

function bundleOne([outRel, inRel]) {
  const out = path.join(root, outRel);
  const input = path.join(root, inRel);
  const args = [...SHARED, '-o', out, input];

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [dtsBin, ...args], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let err = '';
    child.stderr.on('data', (chunk) => {
      err += String(chunk);
    });
    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`ok ${outRel}`);
        resolve();
      } else {
        reject(new Error(`dts failed ${inRel} → ${outRel} (exit ${code})\n${err}`));
      }
    });
  });
}

try {
  await Promise.all(ENTRIES.map(bundleOne));
} catch (e) {
  console.error(e);
  process.exit(1);
}
