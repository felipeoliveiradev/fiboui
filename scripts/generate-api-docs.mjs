#!/usr/bin/env node
/**
 * Generate VitePress API pages from src/index.ts and builder classes.
 * Run: node scripts/generate-api-docs.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcIndex = path.join(root, 'src/index.ts');
const outDir = path.join(root, 'docs/api');
const buildersDir = path.join(outDir, 'builders');

const program = ts.createProgram([srcIndex], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  jsx: ts.JsxEmit.ReactJSX,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  experimentalDecorators: true,
});
const checker = program.getTypeChecker();

function textOf(node) {
  return node.getText();
}

function jsDocOf(node) {
  const docs = ts.getJSDocCommentsAndTags(node);
  const texts = [];
  for (const d of docs) {
    if (ts.isJSDoc(d) && d.comment) {
      texts.push(typeof d.comment === 'string' ? d.comment : d.comment.map((c) => c.text).join(''));
    }
  }
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

function paramSig(param) {
  const name = param.name.getText();
  const optional = param.questionToken || param.initializer ? '?' : '';
  const type = param.type ? param.type.getText() : 'any';
  const def = param.initializer ? param.initializer.getText() : '';
  return { name, optional: Boolean(optional), type, def, raw: param.getText() };
}

function methodInfo(member) {
  if (!ts.isMethodDeclaration(member) && !ts.isConstructorDeclaration(member)) return null;
  const mods = member.modifiers ?? [];
  if (mods.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword || m.kind === ts.SyntaxKind.ProtectedKeyword)) {
    return null;
  }
  const name = ts.isConstructorDeclaration(member) ? 'constructor' : member.name.getText();
  const params = (member.parameters ?? []).map(paramSig);
  const ret = member.type ? member.type.getText() : 'this';
  return {
    name,
    signature: `${name}(${params.map((p) => p.raw).join(', ')}): ${ret}`,
    params,
    defaults: params.filter((p) => p.def).map((p) => `${p.name} = ${p.def}`).join(', '),
    doc: jsDocOf(member),
  };
}

function classMethods(cls) {
  const seen = new Map();
  for (const member of cls.members) {
    const info = methodInfo(member);
    if (!info || info.name === 'constructor') continue;
    if (!seen.has(info.name)) seen.set(info.name, info);
    else {
      const prev = seen.get(info.name);
      prev.signature += ` \\| ${info.signature}`;
      if (info.doc && !prev.doc) prev.doc = info.doc;
    }
  }
  return [...seen.values()];
}

function findClass(sf, name) {
  let found = null;
  function visit(node) {
    if (ts.isClassDeclaration(node) && node.name && node.name.text === name) {
      found = node;
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return found;
}

function findHeritageName(cls) {
  const h = cls.heritageClauses?.find((c) => c.token === ts.SyntaxKind.ExtendsKeyword);
  const expr = h?.types[0]?.expression;
  return expr ? expr.getText() : null;
}

const fileCache = new Map();
function sourceFile(fileName) {
  if (fileCache.has(fileName)) return fileCache.get(fileName);
  const sf = program.getSourceFile(fileName);
  fileCache.set(fileName, sf);
  return sf;
}

function resolveBuilderClass(factoryFile, factoryName) {
  const sf = sourceFile(factoryFile);
  if (!sf) return null;
  let className = null;
  function visit(node) {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === factoryName && decl.initializer) {
          const init = decl.initializer;
          if (ts.isCallExpression(init) && ts.isIdentifier(init.expression)) {
            const callee = init.expression.text;
            if ((callee === 'createBuilder' || callee === 'createShapeBuilder') && init.arguments[0]) {
              className = init.arguments[0].getText();
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  if (!className) return null;
  const cls = findClass(sf, className);
  return cls ? { className, classNode: cls, file: factoryFile, heritage: findHeritageName(cls) } : null;
}

function constructorParams(cls) {
  const ctor = cls.members.find(ts.isConstructorDeclaration);
  if (!ctor) return [];
  return ctor.parameters.map(paramSig);
}

const indexSf = sourceFile(srcIndex);
const indexSymbol = checker.getSymbolAtLocation(indexSf);
const moduleExports = checker.getExportsOfModule(indexSymbol);

const BUILDER_HINTS = new Set([
  'Center', 'Column', 'Container', 'Row', 'Spacer', 'Scaffold', 'Header', 'Sidebar',
  'DashboardLayout', 'ZStack', 'Line', 'ScrollView', 'VirtualColumn',
  'Avatar', 'Badge', 'Text', 'Label', 'Image', 'Spinner', 'Skeleton', 'Alert',
  'Progress', 'Icon', 'Integration',
  'Button', 'TextField', 'Switch', 'Checkbox', 'RadioGroup', 'Textarea', 'Select', 'Combobox',
  'Box', 'Card', 'List', 'ListTile', 'Table', 'Tags', 'Banner', 'Collapse', 'Grid', 'GridItem',
  'AssetCard', 'ProfileCard', 'CollectionCard', 'ContentCard',
  'Canvas', 'Circle', 'Rect', 'Path', 'LinearGradient', 'BurgerIcon',
  'Presence', 'ValueBuilder', 'FiboApp',
]);

const HOOKS = new Set();
const TYPES = [];
const VALUES = [];

for (const sym of moduleExports) {
  const name = sym.getName();
  const flags = sym.getFlags();
  if (flags & ts.SymbolFlags.TypeAlias || flags & ts.SymbolFlags.Interface) {
    TYPES.push(sym);
  } else if (name.startsWith('use')) {
    HOOKS.add(name);
    VALUES.push(sym);
  } else {
    VALUES.push(sym);
  }
}

function aliased(sym) {
  try {
    return checker.getAliasedSymbol(sym);
  } catch {
    return sym;
  }
}

function exportMeta(sym) {
  const resolved = aliased(sym);
  const decls = (resolved.getDeclarations()?.length ? resolved.getDeclarations() : sym.getDeclarations()) ?? [];
  const decl = decls[0];
  const file = decl ? path.relative(root, decl.getSourceFile().fileName) : '';
  const type = checker.getTypeOfSymbolAtLocation(resolved, decl ?? indexSf);
  const typeStr = checker.typeToString(type, undefined, ts.TypeFormatFlags.NoTruncation);
  return {
    name: sym.getName(),
    file,
    typeStr,
    decl,
    resolved,
    doc: ts.displayPartsToString(resolved.getDocumentationComment(checker) || sym.getDocumentationComment(checker)),
  };
}

const builderPages = [];
const functionEntries = [];
const hookEntries = [];
const typeEntries = [];
const constEntries = [];

const EXAMPLE = {
  Button: `Button('Save').onPress(() => undefined)`,
  Text: `Text('Hello').variant('h1')`,
  Box: `Box().padding(16).children('Content')`,
  Column: `Column().gap(8).crossAxisAlignment('start').children([Text('A'), Text('B')])`,
  Row: `Row().gap(8).children([Text('Left'), Text('Right')])`,
  Center: `Center().children(Text('Centered'))`,
  Container: `Container().padding(24).children(Text('Page'))`,
  Spacer: `Spacer().height(16)`,
  Card: `Card().padding(16).children(Text('Card body'))`,
  Grid: `Grid().columns(2).gap('md').children([Box().children('1'), Box().children('2')])`,
  GridItem: `GridItem().colSpan(2).children(Text('Wide'))`,
  Header: `Header().height(64).children(Text('App'))`,
  Sidebar: `Sidebar().width(240).children(Text('Nav'))`,
  Scaffold: `Scaffold().children(Text('Main'))`,
  DashboardLayout: `DashboardLayout().children(Text('Dash'))`,
  ZStack: `ZStack().children([Box().children('Back'), Text('Front')])`,
  Line: `Line().sizeHeight('1px')`,
  ScrollView: `ScrollView().vertical().children(Text('Scroll'))`,
  VirtualColumn: `VirtualColumn().itemHeight(48).containerHeight(240).children([])`,
  Avatar: `Avatar().size(32).initials('FO')`,
  Badge: `Badge().text('New')`,
  Label: `Label('Email').htmlFor('email')`,
  Image: `Image('https://example.com/a.png').alt('Example')`,
  Spinner: `Spinner().size(24)`,
  Skeleton: `Skeleton().width(120).height(16)`,
  Alert: `Alert().title('Saved').intent('success')`,
  Progress: `Progress().value(40).max(100)`,
  Icon: `Icon('user').size(20)`,
  Integration: `Integration()`,
  TextField: `TextField('').placeholder('Name').onChange(() => undefined)`,
  Textarea: `Textarea().placeholder('Notes').onChange(() => undefined)`,
  Switch: `Switch().checked(false).onChange(() => undefined)`,
  Checkbox: `Checkbox().label('Accept').onChange(() => undefined)`,
  RadioGroup: `RadioGroup().options([{ label: 'A', value: 'a' }]).onChange(() => undefined)`,
  Select: `Select().options([{ label: 'A', value: 'a' }]).onChange(() => undefined)`,
  Combobox: `Combobox().options([{ label: 'A', value: 'a' }]).onChange(() => undefined)`,
  List: `List().items(['One', 'Two']).renderItem((item) => Text(String(item)))`,
  ListTile: `ListTile().title('Row').subtitle('Detail').chevron()`,
  Table: `Table().columns([{ header: 'Name', accessor: 'name' }]).data([{ name: 'Ada' }])`,
  Tags: `Tags().items([{ title: 'Alpha' }])`,
  Banner: `Banner().title('Notice').status('info')`,
  Collapse: `Collapse().title('More').content(Text('Hidden'))`,
  AssetCard: `AssetCard().title('Asset').price('$12')`,
  ProfileCard: `ProfileCard().name('Ada').handle('@ada')`,
  CollectionCard: `CollectionCard().title('Set')`,
  ContentCard: `ContentCard().title('Post').description('Body')`,
  Canvas: `Canvas().width(120).height(80)`,
  Circle: `Circle().radius(20)`,
  Rect: `Rect()`,
  Path: `Path()`,
  LinearGradient: `Canvas().width(120).height(80).children('defs helper')`,
  BurgerIcon: `BurgerIcon().size(24)`,
  Presence: `Presence(true).enter('fadeIn').exit('fadeOut').duration(200).children(Text('Panel'))`,
  ValueBuilder: `Box().children(ValueBuilder(signal(0)).children((n: number) => Text(String(n))))`,
  FiboApp: `Column().children([Text('Root')])`,
  FiboAppBuilder: `Column().children([Text('Root')])`,
};

const SHARED_IMPORTS = {
  Column: ['Column', 'Text'],
  Row: ['Row', 'Text'],
  Center: ['Center', 'Text'],
  Container: ['Container', 'Text'],
  Card: ['Card', 'Text'],
  Grid: ['Grid', 'Box'],
  GridItem: ['GridItem', 'Text'],
  Header: ['Header', 'Text'],
  Sidebar: ['Sidebar', 'Text'],
  Scaffold: ['Scaffold', 'Text'],
  DashboardLayout: ['DashboardLayout', 'Text'],
  ZStack: ['ZStack', 'Box', 'Text'],
  ScrollView: ['ScrollView', 'Text'],
  VirtualColumn: ['VirtualColumn'],
  Alert: ['Alert'],
  Label: ['Label'],
  Image: ['Image'],
  List: ['List', 'Text'],
  Collapse: ['Collapse', 'Text'],
  Presence: ['Presence', 'Text'],
  ValueBuilder: ['Box', 'ValueBuilder', 'Text', 'signal'],
  LinearGradient: ['Canvas', 'LinearGradient'],
  FiboApp: ['Column', 'Text'],
  FiboAppBuilder: ['Column', 'Text'],
};

function exampleBlock(name) {
  const imports = SHARED_IMPORTS[name] ?? [name];
  if (name === 'LinearGradient') {
    return [
      '```tsx snippet',
      `import { Canvas, LinearGradient } from 'fiboui';`,
      '',
      'export default function Example() {',
      `  LinearGradient().id('g').colors(['#6750A4', '#fff']);`,
      `  return Canvas().width(120).height(80).children('svg host');`,
      '}',
      '```',
    ].join('\n');
  }
  if (name === 'ValueBuilder') {
    return [
      '```tsx snippet',
      `import { Text, ValueBuilder, signal } from 'fiboui';`,
      '',
      'export default function Example() {',
      '  const n = signal(0);',
      '  ValueBuilder(n).children((value: number) => Text(String(value)));',
      '  return Text(() => String(n.value));',
      '}',
      '```',
    ].join('\n');
  }
  const expr = EXAMPLE[name] ?? `${name}()`;
  return [
    '```tsx snippet',
    `import { ${imports.join(', ')} } from 'fiboui';`,
    '',
    'export default function Example() {',
    `  return ${expr};`,
    '}',
    '```',
  ].join('\n');
}

function methodsTable(methods) {
  if (!methods.length) return '_No component-specific methods._';
  const rows = methods.map((m) => {
    const def = m.defaults || '—';
    const doc = (m.doc || '').replace(/\|/g, '\\|') || '—';
    return `| \`${m.name}\` | \`${m.signature.replace(/\|/g, '\\|').replace(/\n/g, ' ')}\` | ${def.replace(/\|/g, '\\|')} | ${doc} |`;
  });
  return [
    '| Method | Signature | Defaults | Description |',
    '| --- | --- | --- | --- |',
    ...rows,
  ].join('\n');
}

const builderSf = sourceFile(path.join(root, 'src/core/builder.ts'));
const fiboBuilder = findClass(builderSf, 'FiboBuilder');
const fiboMethods = classMethods(fiboBuilder);
const valueBuilder = findClass(builderSf, 'FluentValueBuilder');
const valueMethods = classMethods(valueBuilder);

const shapeSf = sourceFile(path.join(root, 'src/graphics/ShapeBuilder.ts'));
const shapeBuilder = findClass(shapeSf, 'ShapeBuilder');
const shapeMethods = classMethods(shapeBuilder);

const documented = new Set();

function factorySignature(name, cls) {
  const params = constructorParams(cls);
  if (!params.length) return `${name}()`;
  return `${name}(${params.map((p) => p.raw).join(', ')})`;
}

for (const sym of VALUES) {
  const meta = exportMeta(sym);
  const name = meta.name;
  if (HOOKS.has(name)) {
    hookEntries.push(meta);
    documented.add(name);
    continue;
  }

  const declFile = meta.decl ? meta.decl.getSourceFile().fileName : '';
  const resolved = declFile ? resolveBuilderClass(declFile, name) : null;

  if (name === 'Presence') {
    builderPages.push({
      name,
      kind: 'builder',
      factory: 'Presence(show?: boolean | BindableSignal<boolean>) | Presence(props: PresenceProps)',
      file: 'src/core/Presence.tsx',
      specific: [
        { name: 'show', signature: 'show(value: boolean | BindableSignal<boolean>): this', defaults: '', doc: 'Visibility. Signals subscribe automatically.' },
        { name: 'enter', signature: 'enter(preset: MotionPreset | string): this', defaults: "fadeIn", doc: 'Enter keyframe preset.' },
        { name: 'exit', signature: 'exit(preset: MotionPreset | string): this', defaults: "fadeOut", doc: 'Exit keyframe preset.' },
        { name: 'duration', signature: 'duration(ms: number): this', defaults: '200', doc: 'Enter/exit duration in milliseconds.' },
      ],
      inherited: fiboMethods,
      description: 'Keep children mounted through enter/exit CSS keyframes (`animationend`). Fluent builder or component `{ show, children }`.',
    });
    documented.add(name);
    continue;
  }

  if (name === 'ValueBuilder') {
    builderPages.push({
      name,
      kind: 'builder',
      factory: 'ValueBuilder<T>(signal: { value: T; subscribe(listener: (val: T) => void): () => void })',
      file: 'src/core/builder.ts',
      specific: valueMethods,
      inherited: [],
      description: 'Render a signal-driven tree with optional loading and error slots.',
    });
    documented.add(name);
    continue;
  }

  if (name === 'FiboApp' || name === 'FiboAppBuilder') {
    const appSf = sourceFile(path.join(root, 'src/core/FiboApp.ts'));
    const appCls = findClass(appSf, 'FiboAppBuilder');
    builderPages.push({
      name,
      kind: 'builder',
      factory: name === 'FiboApp' ? 'FiboApp()' : 'new FiboAppBuilder()',
      file: 'src/core/FiboApp.ts',
      specific: classMethods(appCls),
      inherited: [],
      description: name === 'FiboApp'
        ? 'Factory that returns `FiboAppBuilder` for plugin registration and `#id` mounting.'
        : 'Fluent app bootstrapper. `mount(elementId)` wraps the root in `ReactivityRoot`.',
    });
    documented.add(name);
    continue;
  }

  if (resolved) {
    builderPages.push({
      name,
      kind: 'builder',
      factory: factorySignature(name, resolved.classNode),
      file: path.relative(root, resolved.file),
      specific: classMethods(resolved.classNode),
      inherited: resolved.heritage === 'ShapeBuilder' ? shapeMethods : fiboMethods,
      heritage: resolved.heritage,
      description:
        name === 'LinearGradient'
          ? 'SVG `<linearGradient>` helper. Assembling returns `{ element, id }` for use in a Canvas/SVG `defs` — it is not a host HTML node.'
          : meta.doc || `${name} fluent builder. Returns a React element — do not call \`.build()\`.`,
    });
    documented.add(name);
    continue;
  }

  const isClass = meta.decl && (ts.isClassDeclaration(meta.decl) || (meta.decl.parent && ts.isClassDeclaration(meta.decl.parent)));
  if (name[0] === name[0].toUpperCase() && !name.endsWith('Props') && (
    ['Signal', 'ComputedSignal', 'Observable', 'PluginManager', 'Router', 'Link', 'NavLink', 'ReactivityRoot', 'Observer', 'ProviderWrapper', 'FineGrainText', 'Reveal', 'ScrollProgress', 'MotionStyles', 'FiboThemeProvider'].includes(name)
  )) {
    functionEntries.push({ ...meta, kind: isClass ? 'class' : 'value' });
    documented.add(name);
    continue;
  }

  if (/^[A-Z_]+$/.test(name) || name.endsWith('Theme') || name === 'Easing' || name === 'MOTION_PRESETS' || name === 'FIBO_MOTION_CSS' || name === 'FIBO_BREAKPOINTS' || name === 'storageAdapters') {
    constEntries.push(meta);
    documented.add(name);
    continue;
  }

  functionEntries.push({ ...meta, kind: 'function' });
  documented.add(name);
}

for (const sym of TYPES) {
  const meta = exportMeta(sym);
  typeEntries.push(meta);
  documented.add(meta.name);
}

const allExportNames = moduleExports.map((s) => s.getName()).sort();
const missing = allExportNames.filter((n) => !documented.has(n));

fs.rmSync(buildersDir, { recursive: true, force: true });
fs.mkdirSync(buildersDir, { recursive: true });

function write(file, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
}

write(path.join(outDir, 'shared-methods.md'), `# Shared builder methods

Every \`createBuilder\` factory (Button, Column, Box, …) inherits these methods from the internal \`FiboBuilder\` class. \`FiboBuilder\` and \`createBuilder\` are **not** public exports — this page documents the methods you call on every builder.

CSS property names are also callable: \`.backgroundColor('#fff')\`, \`.maxWidth(960)\`, \`.flexWrap('wrap')\`. They compile through StyleManager.

.builders are React elements. \`.build()\` still assembles the host tree but is **deprecated**.

## Methods

${methodsTable(fiboMethods)}

## Shape builders

\`Circle\`, \`Rect\`, and \`Path\` inherit SVG helpers from an internal \`ShapeBuilder\` instead of (or in addition to) layout helpers.

${methodsTable(shapeMethods)}
`);

const groups = {
  Layout: ['Center', 'Column', 'Container', 'Row', 'Spacer', 'Scaffold', 'Header', 'Sidebar', 'DashboardLayout', 'ZStack', 'Line', 'ScrollView', 'VirtualColumn'],
  Content: ['Avatar', 'Badge', 'Text', 'Label', 'Image', 'Spinner', 'Skeleton', 'Alert', 'Progress', 'Icon', 'Integration'],
  Interactive: ['Button', 'TextField', 'Switch', 'Checkbox', 'RadioGroup', 'Textarea', 'Select', 'Combobox'],
  Structure: ['Box', 'Card', 'List', 'ListTile', 'Table', 'Tags', 'Banner', 'Collapse', 'Grid', 'GridItem', 'AssetCard', 'ProfileCard', 'CollectionCard', 'ContentCard'],
  Graphics: ['Canvas', 'Circle', 'Rect', 'Path', 'LinearGradient', 'BurgerIcon'],
  Core: ['Presence', 'ValueBuilder', 'FiboApp', 'FiboAppBuilder'],
};

for (const page of builderPages) {
  const slug = page.name;
  const body = `# ${page.name}

${page.description}

- **Factory:** \`${page.factory}\`
- **Source:** \`${page.file}\`
- **Renders as:** React element (no \`.build()\`)

## Example

${exampleBlock(page.name)}

## Component methods

${methodsTable(page.specific)}

${page.inherited?.length ? `## Inherited methods

These come from ${page.heritage === 'ShapeBuilder' ? 'ShapeBuilder' : 'FiboBuilder'}. Full table: [Shared builder methods](/api/shared-methods).

::: details ${page.inherited.length} inherited methods
${methodsTable(page.inherited)}
:::
` : ''}
`;
  write(path.join(buildersDir, `${slug}.md`), body);
}

function valueTable(entries) {
  return [
    '| Name | Kind | Source | Type |',
    '| --- | --- | --- | --- |',
    ...entries.map((e) => `| [\`${e.name}\`](#${e.name.toLowerCase()}) | ${e.kind ?? 'value'} | \`${e.file}\` | \`${e.typeStr.replace(/\|/g, '\\|').slice(0, 180)}\` |`),
  ].join('\n');
}

function functionSections(entries, extraExamples) {
  return entries.map((e) => {
    const ex = extraExamples[e.name];
    return `### ${e.name}

${e.doc || `Public export \`${e.name}\`.`}

- **Source:** \`${e.file}\`
- **Type:** \`${e.typeStr.replace(/\n/g, ' ').slice(0, 400)}\`

${ex ? `${ex}\n` : ''}`;
  }).join('\n');
}

const FN_EX = {
  mount: `\`\`\`ts snippet
import { Column, Text, mount } from 'fiboui';

export default function Example() {
  return Column().children([Text('Mounted')]);
}

export function runMount(el: HTMLElement) {
  mount(el, Example, { strict: false });
}
\`\`\``,
  toElement: `\`\`\`ts snippet
import { Text, toElement } from 'fiboui';

export default function Example() {
  return toElement(Text('Hi'));
}
\`\`\``,
  Fibo: `\`\`\`tsx snippet
import { createElement } from 'react';
import { Fibo, Text } from 'fiboui';

export default function Example() {
  return createElement(Fibo, { children: Text('Hi') });
}
\`\`\``,
  signal: `\`\`\`ts snippet
import { Box, Button, Text, signal } from 'fiboui';

export default function Example() {
  const count = signal(0);
  return Box()
    .bindSignal(count)
    .children(() => [
      Text(() => String(count.value)),
      Button('+').onPress(() => {
        count.value += 1;
      }),
    ]);
}
\`\`\``,
  computed: `\`\`\`ts snippet
import { Text, computed, signal } from 'fiboui';

export default function Example() {
  const n = signal(2);
  const doubled = computed(() => n.value * 2);
  return Text(() => String(doubled.value));
}
\`\`\``,
  createStore: `\`\`\`ts snippet
import { Button, Text, createStore } from 'fiboui';
import { Column } from 'fiboui';

export default function Example() {
  const store = createStore({ n: 0 });
  return Column()
    .observer()
    .children(() => [
      Text(String(store.getState().n)),
      Button('Inc').onPress(() => store.setState((s) => ({ n: s.n + 1 }))),
    ]);
}
\`\`\``,
  scrollTo: `\`\`\`ts snippet
import { Box, Button, scrollTo } from 'fiboui';

export default function Example() {
  return Box().children([
    Box().anchor('here').children('Target'),
    Button('Go').onPress(() => scrollTo('#here')),
  ]);
}
\`\`\``,
  bindText: `\`\`\`ts snippet
import { Column, bindText, signal } from 'fiboui';

export default function Example() {
  const label = signal('Ada');
  return Column().children([bindText(label)]);
}
\`\`\``,
};

write(path.join(outDir, 'functions.md'), `# Functions & runtime

Generated from \`src/index.ts\`. Builders live under [API builders](/api/). Hooks: [Hooks](/api/hooks).

${valueTable(functionEntries)}

${functionSections(functionEntries, FN_EX)}
`);

const HOOK_EX = {
  useSignal: `\`\`\`tsx snippet
import { useSignal, signal, Text } from 'fiboui';

const count = signal(0);

export default function Example() {
  const value = useSignal(count);
  return Text(String(value));
}
\`\`\``,
  useReactiveStore: `\`\`\`tsx snippet
import { createStore, useReactiveStore, Text } from 'fiboui';

const store = createStore({ ready: true });

export default function Example() {
  const state = useReactiveStore(store);
  return Text(state.ready ? 'ready' : 'no');
}
\`\`\``,
  usePrefersReducedMotion: `\`\`\`tsx snippet
import { usePrefersReducedMotion, Text } from 'fiboui';

export default function Example() {
  const reduce = usePrefersReducedMotion();
  return Text(reduce ? 'reduce' : 'motion');
}
\`\`\``,
  useStagger: `\`\`\`tsx snippet
import { useStagger, Text } from 'fiboui';

export default function Example() {
  const delays = useStagger(3, 50);
  return Text(delays.join(','));
}
\`\`\``,
  useScrollProgress: `\`\`\`tsx snippet
import { useScrollProgress, Text } from 'fiboui';

export default function Example() {
  const p = useScrollProgress();
  return Text(String(p >= 0));
}
\`\`\``,
  useViewportWidth: `\`\`\`tsx snippet
import { useViewportWidth, Text } from 'fiboui';

export default function Example() {
  const w = useViewportWidth();
  return Text(String(w >= 0));
}
\`\`\``,
};

write(path.join(outDir, 'hooks.md'), `# Hooks

React hooks exported from \`fiboui\`. \`useSignal\` / \`useReactiveStore\` / \`useObservable\` use \`useSyncExternalStore\`.

Motion hooks (\`useSpring\`, \`useTransition\`, \`useMountTransition\`) interpolate **numbers** with \`requestAnimationFrame\`. Prefer CSS \`.animate()\` / \`.hover()\` for UI motion.

${valueTable(hookEntries)}

${functionSections(hookEntries, HOOK_EX)}
`);

write(path.join(outDir, 'types.md'), `# Types

Type-only exports from \`src/index.ts\`.

${[
  '| Name | Source |',
  '| --- | --- |',
  ...typeEntries.map((e) => `| \`${e.name}\` | \`${e.file}\` |`),
].join('\n')}

${typeEntries.map((e) => `### ${e.name}

${e.doc || `Type export \`${e.name}\`.`}

- **Source:** \`${e.file}\`
- **Type:** \`${e.typeStr.replace(/\n/g, ' ').slice(0, 500)}\`
`).join('\n')}
`);

write(path.join(outDir, 'constants.md'), `# Constants

${[
  '| Name | Source | Type |',
  '| --- | --- | --- |',
  ...constEntries.map((e) => `| \`${e.name}\` | \`${e.file}\` | \`${e.typeStr.replace(/\|/g, '\\|').slice(0, 160)}\` |`),
].join('\n')}

### MOTION_PRESETS

\`fadeIn\`, \`fadeOut\`, \`fade\`, \`slideUp\`, \`slideDown\`, \`slideLeft\`, \`slideRight\`, \`scaleIn\`, \`scaleOut\`, \`scale\`, \`blurIn\`, \`blurOut\`, \`blur\`, \`pop\`, \`bounce\`.

\`\`\`ts snippet
import { MOTION_PRESETS, Box } from 'fiboui';

export default function Example() {
  return Box().animate(MOTION_PRESETS[0]).children(MOTION_PRESETS[0]);
}
\`\`\`

### FIBO_BREAKPOINTS

\`sm\` 640, \`md\` 768, \`lg\` 1024, \`xl\` 1280.

\`\`\`ts snippet
import { FIBO_BREAKPOINTS, Box } from 'fiboui';

export default function Example() {
  return Box().md({ width: FIBO_BREAKPOINTS.md });
}
\`\`\`
`);

const coverage = {
  version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
  generatedAt: new Date().toISOString(),
  totalExports: allExportNames.length,
  documented: documented.size,
  builders: builderPages.length,
  functions: functionEntries.length,
  hooks: hookEntries.length,
  types: typeEntries.length,
  constants: constEntries.length,
  missing,
  exports: allExportNames,
};

write(path.join(outDir, 'coverage.json'), JSON.stringify(coverage, null, 2) + '\n');

const indexLines = [
  '# API reference',
  '',
  `Generated from \`src/index.ts\` for **fiboui ${coverage.version}**.`,
  '',
  `**Coverage:** ${coverage.documented} / ${coverage.totalExports} public exports documented.`,
  '',
  coverage.missing.length
    ? `Unlisted: ${coverage.missing.map((n) => `\`${n}\``).join(', ')}`
    : 'Every named export from the package root has a page or section.',
  '',
  '## Builders',
  '',
];

for (const [group, names] of Object.entries(groups)) {
  indexLines.push(`### ${group}`, '');
  for (const n of names) {
    if (builderPages.some((p) => p.name === n)) {
      indexLines.push(`- [${n}](/api/builders/${n})`);
    }
  }
  indexLines.push('');
}

indexLines.push(
  '## Other exports',
  '',
  '- [Shared builder methods](/api/shared-methods)',
  '- [Functions & runtime](/api/functions)',
  '- [Hooks](/api/hooks)',
  '- [Types](/api/types)',
  '- [Constants](/api/constants)',
  '',
);

write(path.join(outDir, 'index.md'), indexLines.join('\n'));

const sidebar = [];
for (const [group, names] of Object.entries(groups)) {
  sidebar.push({
    text: group,
    collapsed: true,
    items: names
      .filter((n) => builderPages.some((p) => p.name === n))
      .map((n) => ({ text: n, link: `/api/builders/${n}` })),
  });
}

write(
  path.join(root, 'docs/.vitepress/api-sidebar.generated.json'),
  JSON.stringify(sidebar, null, 2) + '\n'
);

console.log(
  `API docs: ${coverage.documented}/${coverage.totalExports} exports, ${builderPages.length} builders, missing=${missing.length}`
);
if (missing.length) {
  console.log('Missing:', missing.join(', '));
  process.exitCode = 1;
}
