import { Command } from 'commander';
import { moduleCommand } from './module';
import { pluginCommand } from './plugin';

import { componentCommand } from './component';

export const generateCommand = new Command('generate')
  .alias('g')
  .description('Generate new architectural components (modules, plugins, etc.)')
  .addCommand(moduleCommand)
  .addCommand(pluginCommand)
  .addCommand(componentCommand);
