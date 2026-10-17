const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const snippets = JSON.parse(
  readFileSync(join(__dirname, '../snippets/fiboui.json'), 'utf8')
);

let failed = 0;
function assert(name, cond, detail) {
  if (!cond) {
    console.error(`FAIL ${name}${detail ? `: ${detail}` : ''}`);
    failed++;
  } else {
    console.log(`ok ${name}`);
  }
}

const bodies = Object.entries(snippets).map(([name, snip]) => ({
  name,
  body: snip.body,
  text: Array.isArray(snip.body) ? snip.body.join('\n') : String(snip.body),
}));

for (const { name, text } of bodies) {
  assert(`${name} no tabs`, !text.includes('\t'), JSON.stringify(text));
  assert(`${name} no .build()`, !/\.build\s*\(/.test(text));
}

assert(
  'Column uses 2-space chain indent',
  snippets['FiboUI Column'].body[1].startsWith('  .'),
  snippets['FiboUI Column'].body[1]
);

assert(
  'children nested 4 spaces',
  snippets['FiboUI Column'].body[4] === '    $0',
  snippets['FiboUI Column'].body[4]
);

assert(
  'Scaffold headerBar is a Header(), not null',
  /headerBar\(/.test(snippets['FiboUI Scaffold'].body.join('\n')) &&
    !/\.headerBar\(\s*null\s*\)/.test(snippets['FiboUI Scaffold'].body.join('\n'))
);

assert(
  'Text uses fontSize (CSS) not Flutter size/weight helpers',
  snippets['FiboUI Text'].body[0].includes('.fontSize(') &&
    !snippets['FiboUI Text'].body[0].includes('.size(')
);

const completionsSrc = readFileSync(join(__dirname, 'completions.js'), 'utf8');
assert(
  'completions cover untitled buffers',
  /scheme:\s*['"]untitled['"]/.test(completionsSrc)
);

const { FACTORIES } = require('./factories');
const methods = JSON.parse(readFileSync(join(__dirname, 'methods.json'), 'utf8'));
const indexSrc = readFileSync(join(__dirname, '../../../src/index.ts'), 'utf8');
const publicNames = new Set();
for (const block of indexSrc.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}/g)) {
  for (const part of block[1].split(',')) {
    const name = part.trim().split(/\s+as\s+/)[0].trim();
    if (/^[A-Z][A-Za-z0-9]*$/.test(name)) publicNames.add(name);
  }
}

const REMOVED_FACTORIES = ['Chip', 'IconButton', 'StakentButton', 'CardSvg', 'ActionCard', 'InfoCard', 'InputCard', 'MetricCard'];
for (const name of REMOVED_FACTORIES) {
  assert(`no ${name} factory`, !FACTORIES.includes(name));
}

assert('methods.json has no build', !methods.includes('build'));

for (const name of FACTORIES) {
  assert(`${name} is a public fiboui export`, publicNames.has(name), name);
}

for (const name of ['Circle', 'Rect', 'Path', 'Header', 'Button', 'Column', 'Badge']) {
  assert(`factories include ${name}`, FACTORIES.includes(name));
}

const snippetBlob = bodies.map((b) => b.text).join('\n');
assert('snippets have no Chip()', !/\bChip\s*\(/.test(snippetBlob));
assert('snippets have no IconButton()', !/\bIconButton\s*\(/.test(snippetBlob));

if (failed) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('all ok');
