#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const themePath = path.resolve(__dirname, '../themes/fiboui-noir-color-theme.json');
const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));

assert.strictEqual(theme.name, 'FiboUI Noir');
assert.strictEqual(theme.type, 'dark');
assert.strictEqual(theme.semanticHighlighting, true);
assert.equal(typeof theme.colors, 'object');
assert.ok(Array.isArray(theme.tokenColors));
assert.ok(theme.tokenColors.length > 0);
assert.equal(typeof theme.semanticTokenColors, 'object');

const requiredColors = [
  'editor.background',
  'editor.foreground',
  'activityBar.background',
  'sideBar.background',
  'statusBar.background',
  'focusBorder',
  'editorIndentGuide.background',
  'editorIndentGuide.activeBackground',
];

for (const key of requiredColors) {
  const value = theme.colors[key];
  assert.equal(typeof value, 'string', `colors.${key} must be a hex string`);
  assert.match(value, /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, `colors.${key}=${value}`);
}

for (const token of theme.tokenColors) {
  assert.ok(token.settings, 'tokenColors entry needs settings');
  if (token.settings.foreground) {
    assert.match(
      token.settings.foreground,
      /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
      `token foreground ${token.settings.foreground}`
    );
  }
}

console.log('ok theme json', path.relative(process.cwd(), themePath));
