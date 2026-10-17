import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { initConfigSource } from '../templates.js';

export const initCommand = new Command('init')
  .description('Initialize FiboUI configuration')
  .action(async () => {
    const spinner = ora('Checking project structure...').start();
    const configPath = path.resolve(process.cwd(), 'fibo.config.js');

    if (await fs.pathExists(configPath)) {
      spinner.fail('fibo.config.js already exists.');
      process.exitCode = 1;
      return;
    }

    const hasModules = await fs.pathExists(path.resolve(process.cwd(), 'src/modules'));
    const hasPlugins = await fs.pathExists(path.resolve(process.cwd(), 'src/plugins'));
    const hasComponents = await fs.pathExists(path.resolve(process.cwd(), 'src/components'));

    const isStandard = hasModules && hasPlugins && hasComponents;
    const configContent = initConfigSource(isStandard);

    if (isStandard) {
      spinner.succeed('Standard FiboUI architecture detected.');
    } else {
      spinner.warn('Standard architecture NOT detected.');
      console.log(
        chalk.yellow(
          'Creating configuration with default/empty values. Please update "fibo.config.js" with your project paths.'
        )
      );
    }

    try {
      await fs.writeFile(configPath, configContent);
      console.log(chalk.green(`\n✔ Created ${chalk.bold('fibo.config.js')}`));
      console.log(chalk.dim('You can now generate components using your custom structure.'));
    } catch (error) {
      console.error(chalk.red('Failed to write config file.'), error);
      process.exitCode = 1;
    }
  });
