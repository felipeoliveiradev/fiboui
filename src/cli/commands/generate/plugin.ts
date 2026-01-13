import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';

export const pluginCommand = new Command('plugin')
  .alias('p')
  .description('Generate a new FiboUI plugin')
  .argument('[name]', 'Name of the plugin')
  .action(async (name) => {
    let pluginName = name;

    if (!pluginName) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: 'What is the name of your Plugin?',
        validate: value => value.length < 3 ? 'Plugin name must be at least 3 characters' : true
      });
      pluginName = response.value;
    }

    if (!pluginName) process.exit(1);

    const safeName = pluginName.endsWith('Plugin') ? pluginName : `${pluginName}Plugin`;
    const spinner = ora(`Scaffolding plugin ${chalk.bold(safeName)}...`).start();

    const targetDir = path.resolve(process.cwd(), 'src/plugins');
    const targetFile = path.resolve(targetDir, `${safeName}.ts`);

    try {
      await fs.ensureDir(targetDir);

      if (await fs.pathExists(targetFile)) {
        spinner.fail(`Plugin ${safeName} already exists at ${targetFile}`);
        return;
      }

      const content = `import { FiboPlugin, FiboContext, Card, Text, Icon } from 'fiboui';
import { Settings } from 'lucide-react';

export const ${safeName}: FiboPlugin = {
  name: '${safeName}',
  version: '1.0.0',
  setup: (ctx: FiboContext) => {
    console.log('Initializing ${safeName}...');

    // Example: Register Sidebar Item
    ctx.registerSidebarItem({
      label: '${pluginName.replace('Plugin', '')}',
      path: '/${pluginName.toLowerCase().replace('plugin', '')}',
      icon: Settings, // Example icon
      order: 10
    });

    // Example: Register an Overlay
    // ctx.registerOverlay(() => 
    //   Card().padding(10).children([ Text('Hello from ${safeName}').build() ]).build()
    // );
  }
};
`;

      await fs.writeFile(targetFile, content);

      spinner.succeed(`Plugin ${chalk.green(safeName)} created successfully!`);
      console.log(chalk.dim(`\nLocated at: ${targetFile}`));
      console.log(chalk.blue(`\nNext step: Register it in your main.tsx using .plugins([${safeName}])`));

    } catch (error) {
      spinner.fail('Failed to create plugin');
      console.error(error);
    }
  });
