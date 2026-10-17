import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import ora from 'ora';
import { joinBasename, loadFiboConfig, resolveGenerateDir } from '../../config.js';
import { pluginNames } from '../../names.js';
import { pluginTemplate } from '../../templates.js';

export const pluginCommand = new Command('plugin')
  .alias('p')
  .description('Generate a new FiboUI plugin')
  .argument('[name]', 'Name of the plugin')
  .action(async (name) => {
    let rawName = name;

    if (!rawName) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: 'What is the name of your Plugin?',
        validate: (value) => (value.length < 3 ? 'Plugin name must be at least 3 characters' : true),
      });
      rawName = response.value;
    }

    if (!rawName) process.exit(1);

    const { safeName } = pluginNames(rawName);
    if (!safeName) process.exit(1);
    const spinner = ora(`Scaffolding plugin ${chalk.bold(safeName)}...`).start();

    try {
      const cwd = process.cwd();
      const config = await loadFiboConfig(cwd);
      const targetDir = resolveGenerateDir('plugin', cwd, config);
      const targetFile = joinBasename(targetDir, `${safeName}.ts`);

      await fs.ensureDir(targetDir);

      if (await fs.pathExists(targetFile)) {
        spinner.fail(`Plugin ${safeName} already exists at ${targetFile}`);
        process.exitCode = 1;
        return;
      }

      await fs.writeFile(targetFile, pluginTemplate(rawName));

      spinner.succeed(`Plugin ${chalk.green(safeName)} created successfully!`);
      console.log(chalk.dim(`\nLocated at: ${targetFile}`));
      console.log(chalk.blue(`\nNext step: Register it in your main.tsx using .plugins([${safeName}])`));
    } catch (error) {
      spinner.fail('Failed to create plugin');
      console.error(error);
      process.exitCode = 1;
    }
  });
