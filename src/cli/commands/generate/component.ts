import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';

export const componentCommand = new Command('component')
  .alias('c')
  .description('Generate a new FiboUI functional component')
  .argument('[name]', 'Name of the component')
  .action(async (name) => {
    let componentName = name;

    if (!componentName) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: 'What is the name of your Component?',
        validate: value => value.length < 3 ? 'Component name must be at least 3 characters' : true
      });
      componentName = response.value;
    }

    if (!componentName) process.exit(1);

    const spinner = ora(`Scaffolding component ${chalk.bold(componentName)}...`).start();

    // Try to guess location: src/components or current dir
    const srcComponents = path.resolve(process.cwd(), 'src/components');
    const targetDir = (await fs.pathExists(srcComponents)) ? srcComponents : process.cwd();

    // Create folder for component? Or just file? Let's do file for simplicity or folder if preferred.
    // Standard: src/components/MyComponent/index.tsx
    const componentDir = path.join(targetDir, componentName);
    const targetFile = path.join(componentDir, 'index.tsx');

    try {
      if (await fs.pathExists(componentDir)) {
        spinner.fail(`Component ${componentName} already exists at ${componentDir}`);
        return;
      }

      await fs.ensureDir(componentDir);

      const content = `import React from 'react';
import { Component, Text, Row, FiboBuilder } from 'fiboui';

export interface ${componentName}Props {
  title?: string;
}

export const ${componentName} = Component<${componentName}Props>()(
  ({ title = '${componentName}' }) => {
    return Row()
      .padding(16)
      .bg('white')
      .rounded('lg')
      .shadow('sm')
      .children([
        Text(title).size(18).weight('bold').build()
      ])
      .build();
  }
);
`;

      await fs.writeFile(targetFile, content);

      spinner.succeed(`Component ${chalk.green(componentName)} created successfully!`);
      console.log(chalk.dim(`\nLocated at: ${targetFile}`));

    } catch (error) {
      spinner.fail('Failed to create component');
      console.error(error);
    }
  });
