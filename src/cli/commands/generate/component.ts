import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { joinBasename, loadFiboConfig, resolveGenerateDir } from '../../config.js';
import { toPascalCase } from '../../names.js';
import { componentTemplate } from '../../templates.js';

export const componentCommand = new Command('component')
  .alias('c')
  .description('Generate a new FiboUI functional component')
  .argument('[name]', 'Name of the component')
  .action(async (name) => {
    let rawName = name;

    if (!rawName) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: 'What is the name of your Component?',
        validate: (value) => (value.length < 3 ? 'Component name must be at least 3 characters' : true),
      });
      rawName = response.value;
    }

    if (!rawName) process.exit(1);

    const componentName = toPascalCase(rawName);
    if (!componentName) process.exit(1);

    const spinner = ora(`Scaffolding component ${chalk.bold(componentName)}...`).start();

    try {
      const cwd = process.cwd();
      const config = await loadFiboConfig(cwd);
      const srcComponents = path.resolve(cwd, 'src/components');
      const targetDir = resolveGenerateDir('component', cwd, config, undefined, {
        componentsDirExists: await fs.pathExists(srcComponents),
      });

      const componentDir = joinBasename(targetDir, componentName);
      const targetFile = joinBasename(componentDir, 'index.tsx');

      if (await fs.pathExists(componentDir)) {
        spinner.fail(`Component ${componentName} already exists at ${componentDir}`);
        process.exitCode = 1;
        return;
      }

      await fs.ensureDir(componentDir);
      await fs.writeFile(targetFile, componentTemplate(componentName));

      spinner.succeed(`Component ${chalk.green(componentName)} created successfully!`);
      console.log(chalk.dim(`\nLocated at: ${targetFile}`));
    } catch (error) {
      spinner.fail('Failed to create component');
      console.error(error);
      process.exitCode = 1;
    }
  });
