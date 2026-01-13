#!/usr/bin/env node
import { Command } from 'commander';
import { generateCommand } from './commands/generate';
import { initCommand } from './commands/init';

const pkg = require('../../package.json');
const version = pkg.version;

const program = new Command();

program
  .name('fibo')
  .description('FiboUI CLI - Supercharge your development')
  .version(version);


// ... (version import)

program.addCommand(initCommand);
program.addCommand(generateCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
