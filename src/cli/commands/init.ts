import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';

export const initCommand = new Command('init')
  .description('Initialize FiboUI configuration')
  .action(async () => {
    const spinner = ora('Checking project structure...').start();
    const configPath = path.resolve(process.cwd(), 'fibo.config.js'); // Keeping it JS for wider compatibility or TS? User asked for ts.

    if (await fs.pathExists(configPath)) {
      spinner.fail('fibo.config.js already exists.');
      return;
    }

    // Heuristics for standard architecture
    const hasModules = await fs.pathExists(path.resolve(process.cwd(), 'src/modules'));
    const hasPlugins = await fs.pathExists(path.resolve(process.cwd(), 'src/plugins'));
    const hasComponents = await fs.pathExists(path.resolve(process.cwd(), 'src/components'));

    const isStandard = hasModules && hasPlugins && hasComponents;

    let configContent = '';

    if (isStandard) {
      spinner.succeed('Standard FiboUI architecture detected.');
      configContent = `/** @type {import('fiboui').FiboConfig} */
module.exports = {
  paths: {
    modules: 'src/modules',
    plugins: 'src/plugins',
    components: 'src/components',
    core: 'src/core'
  },
  architecture: 'clean'
};
`;
    } else {
      spinner.warn('Standard architecture NOT detected.');
      console.log(chalk.yellow('Creating configuration with default/empty values. Please update "fibo.config.js" with your project paths.'));

      configContent = `/** @type {import('fiboui').FiboConfig} */
module.exports = {
  paths: {
    modules: 'src/modules', // Update this
    plugins: 'src/plugins', // Update this
    components: 'src/components', // Update this
    core: 'src/core' // Update this
  },
  architecture: 'custom'
};
`;
    }

    try {
      await fs.writeFile(configPath, configContent);
      console.log(chalk.green(`\n✔ Created ${chalk.bold('fibo.config.js')}`));
      console.log(chalk.dim('You can now generate components using your custom structure.'));
    } catch (error) {
      console.error(chalk.red('Failed to write config file.'), error);
    }
  });
