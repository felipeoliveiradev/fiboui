#!/usr/bin/env node
import { createRequire } from 'node:module';
import { Command } from 'commander';
import { generateCommand } from './commands/generate/index.js';
import { initCommand } from './commands/init.js';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');
const version = pkg.version;

const program = new Command();

program
  .name('fibo')
  .description('FiboUI CLI - Supercharge your development')
  .version(version);

program.addCommand(initCommand);
program.addCommand(generateCommand);

await program.parseAsync(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
