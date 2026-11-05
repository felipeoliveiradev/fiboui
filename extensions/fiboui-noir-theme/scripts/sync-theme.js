#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const source = path.resolve(
  __dirname,
  '../../vscode-fiboui/themes/fiboui-noir-color-theme.json'
);
const dest = path.resolve(__dirname, '../themes/fiboui-noir-color-theme.json');

if (!fs.existsSync(source)) {
  console.error('missing canonical theme:', source);
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(source, dest);
process.stdout.write(`synced ${path.relative(process.cwd(), source)} -> ${path.relative(process.cwd(), dest)}\n`);
