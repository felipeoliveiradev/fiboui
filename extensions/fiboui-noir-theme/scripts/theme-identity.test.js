#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const canonical = path.resolve(
  __dirname,
  '../../vscode-fiboui/themes/fiboui-noir-color-theme.json'
);
const packaged = path.resolve(__dirname, '../themes/fiboui-noir-color-theme.json');

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`${file} is not valid JSON: ${err.message}`);
  }
}

assert.ok(fs.existsSync(canonical), `canonical theme missing: ${canonical}`);
assert.ok(fs.existsSync(packaged), `packaged theme missing: ${packaged}`);

const a = readJson(canonical);
const b = readJson(packaged);
assert.deepStrictEqual(
  b,
  a,
  'extensions/fiboui-noir-theme/themes/fiboui-noir-color-theme.json must match extensions/vscode-fiboui/themes/fiboui-noir-color-theme.json. Run: node extensions/fiboui-noir-theme/scripts/sync-theme.js'
);

console.log('ok theme identity');
