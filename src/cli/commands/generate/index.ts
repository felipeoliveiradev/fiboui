import { Command } from 'commander';
import { moduleCommand } from './module.js';
import { pluginCommand } from './plugin.js';
import { componentCommand } from './component.js';

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate new architectural components (modules, plugins, etc.)')
  .addCommand(moduleCommand)
  .addCommand(pluginCommand)
  .addCommand(componentCommand);
