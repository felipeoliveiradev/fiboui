import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { loadFiboConfig, resolveGenerateDir, resolveUnderRoot } from '../../config.js';
import { toPascalCase } from '../../names.js';
import { moduleFiles } from '../../templates.js';

export const moduleCommand = new Command('module')
  .alias('m')
  .description('Generate a new clean architecture module')
  .argument('[name]', 'Name of the module')
  .action(async (name) => {
    let rawName = name;

    if (!rawName) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: 'What is the name of your module?',
        validate: (value) => (value.length < 3 ? 'Module name must be at least 3 characters' : true),
      });
      rawName = response.value;
    }

    if (!rawName) process.exit(1);

    const moduleName = toPascalCase(rawName);
    if (!moduleName) process.exit(1);

    const spinner = ora(`Scaffolding module ${chalk.bold(moduleName)}...`).start();

    try {
      const cwd = process.cwd();
      const config = await loadFiboConfig(cwd);
      const targetDir = resolveGenerateDir('module', cwd, config, moduleName);

      if (await fs.pathExists(targetDir)) {
        spinner.fail(`Module ${moduleName} already exists at ${targetDir}`);
        process.exitCode = 1;
        return;
      }

      await fs.ensureDir(targetDir);

      const files = moduleFiles(moduleName);
      for (const [rel, content] of Object.entries(files)) {
        const full = resolveUnderRoot(targetDir, rel);
        await fs.ensureDir(path.dirname(full));
        await fs.writeFile(full, content);
      }

      spinner.succeed(`Module ${chalk.green(moduleName)} created successfully!`);
      console.log(chalk.dim(`\nLocated at: ${targetDir}`));
    } catch (error) {
      spinner.fail('Failed to create module');
      console.error(error);
      process.exitCode = 1;
    }
  });
