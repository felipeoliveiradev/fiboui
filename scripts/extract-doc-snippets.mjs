#!/usr/bin/env node
/**
 * Extract ```tsx snippet / ```ts snippet fences from docs/ into
 * tests/.generated-snippets/*.tsx for type-check + render tests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(root, 'docs');
const outDir = path.join(root, 'tests/.generated-snippets');

const EXPORTS = [
  'signal', 'computed', 'observable', 'createStore', 'Signal', 'ComputedSignal',
  'Observable', 'createReactivityRoot', 'runInScope', 'getCurrentScope',
  'useSignal', 'useReactiveStore', 'useObservable', 'useBuilderState', 'Observer',
  'ProviderWrapper', 'useProvider', 'ReactivityRoot', 'FineGrainText', 'bindText',
  'applyResponsiveStyles', 'useTransition', 'useSpring', 'useStagger',
  'useMountTransition', 'usePrefersReducedMotion', 'useScrollProgress', 'Easing',
  'cssCurve', 'Presence', 'Reveal', 'ScrollProgress', 'scrollTo',
  'startViewTransition', 'supportsViewTimeline', 'supportsScrollTimeline',
  'springEase', 'resolveCssEase', 'MOTION_PRESETS', 'normalizePreset',
  'FIBO_MOTION_CSS', 'MotionStyles', 'getMotionCss', 'ensureMotionCss',
  'FIBO_BREAKPOINTS', 'toMediaQuery', 'useViewportWidth', 'FiboApp',
  'FiboAppBuilder', 'mount', 'Fibo', 'toElement', 'PluginManager',
  'ValueBuilder', 'FiboThemeProvider', 'useFiboTheme', 'materialTheme',
  'cupertinoTheme', 'webTheme', 'Center', 'Column', 'Container', 'Row', 'Spacer',
  'Scaffold', 'Header', 'Sidebar', 'DashboardLayout', 'ZStack', 'Line',
  'ScrollView', 'VirtualColumn', 'Avatar', 'Badge', 'Text', 'Label', 'Image',
  'Spinner', 'Skeleton', 'Alert', 'Progress', 'Icon', 'Integration', 'Button',
  'TextField', 'Switch', 'Checkbox', 'RadioGroup', 'Textarea', 'Select',
  'Combobox', 'Box', 'Card', 'List', 'ListTile', 'Table', 'Tags', 'Banner',
  'Collapse', 'Grid', 'GridItem', 'AssetCard', 'ProfileCard', 'CollectionCard',
  'ContentCard', 'Canvas', 'Circle', 'Rect', 'Path', 'LinearGradient',
  'BurgerIcon', 'Router', 'Link', 'NavLink', 'useRouter', 'useNavigate',
  'useParams', 'useLocation', 'useQuery', 'Component', 'Page',
  'getRegisteredRoutes', 'clearRoutes', 'registerRoute', 'Store', 'useStore',
  'getStore', 'clearStores', 'isStore', 'persist', 'clearPersistedState',
  'getPersistedState', 'storageAdapters',
];

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.vitepress' || ent.name.startsWith('.')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

const fenceRe = /```(tsx|ts)[^\n]*\bsnippet\b[^\n]*\n([\s\S]*?)```/g;

function usedExports(code) {
  return EXPORTS.filter((name) => new RegExp(`(?<![\\w$.])${name}(?![\\w$])`).test(code));
}

function wrap(code, id) {
  const trimmed = code.trim();
  const hasImport = /^import\s/m.test(trimmed);
  const hasExport = /^export\s/m.test(trimmed);
  if (hasImport && hasExport) {
    return `${trimmed}\n`;
  }

  const names = usedExports(trimmed);
  const importLine = names.length
    ? `import { ${names.join(', ')} } from 'fiboui';\n`
    : `import 'fiboui/style.css';\n`;

  if (hasExport) {
    return `${hasImport ? '' : importLine}\n${trimmed}\n`;
  }

  const isExpr = /^(?:[A-Z][A-Za-z0-9]*\(|[a-z][A-Za-z0-9]*\(|createElement\()/.test(trimmed)
    && !trimmed.includes('\nexport ')
    && !/^(const|let|var|function|class|if|for|while|return)\b/.test(trimmed.split('\n')[0]);

  if (isExpr && !trimmed.includes('mount(')) {
    return `${hasImport ? '' : importLine}
export default function Example() {
  return (
${trimmed.split('\n').map((l) => '    ' + l).join('\n')}
  );
}
`;
  }

  return `${hasImport ? '' : importLine}
export default function Example() {
${trimmed.split('\n').map((l) => '  ' + l).join('\n')}
  return null;
}
`;
}

function slug(rel, index) {
  return `${rel.replace(/\\/g, '/').replace(/\.md$/, '').replace(/[^\w/]+/g, '-')}-${index}`;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const files = walk(docsDir);
const manifest = [];

for (const file of files) {
  const rel = path.relative(docsDir, file);
  const src = fs.readFileSync(file, 'utf8');
  let m;
  let i = 0;
  fenceRe.lastIndex = 0;
  const copy = src;
  while ((m = fenceRe.exec(copy))) {
    const code = m[2];
    if (/<[A-Z][A-Za-z0-9]*[\s/>]/.test(code) || /<div[\s>]/.test(code) || /<h[1-6][\s>]/.test(code)) {
      throw new Error(`JSX in snippet ${rel} #${i}: fluent-only examples required`);
    }
    const id = slug(rel, i);
    const wrapped = wrap(code, id).replace(
      /import\s+['"]fiboui\/style\.css['"]\s*;?/g,
      "import 'fibo-docs-style';"
    );
    const outFile = path.join(outDir, `${id.replace(/\//g, '__')}.tsx`);
    fs.writeFileSync(outFile, `// source: docs/${rel} snippet ${i}\n${wrapped}`);
    manifest.push({ id, file: rel, index: i, out: path.relative(root, outFile) });
    i += 1;
  }
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Extracted ${manifest.length} doc snippets → tests/.generated-snippets`);
if (manifest.length === 0) {
  console.error('No snippets found. Tag examples with ```tsx snippet');
  process.exit(1);
}
