import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';

export const moduleCommand = new Command('module')
  .alias('m')
  .description('Generate a new clean architecture module')
  .argument('[name]', 'Name of the module')
  .action(async (name) => {
    let moduleName = name;

    if (!moduleName) {
      const response = await prompts({
        type: 'text',
        name: 'value',
        message: 'What is the name of your module?',
        validate: value => value.length < 3 ? 'Module name must be at least 3 characters' : true
      });
      moduleName = response.value;
    }

    if (!moduleName) process.exit(1);

    const spinner = ora(`Scaffolding module ${chalk.bold(moduleName)}...`).start();

    // Normalize path: assume we are in project root or src
    const targetDir = path.resolve(process.cwd(), 'src/modules', moduleName);

    try {
      if (await fs.pathExists(targetDir)) {
        spinner.fail(`Module ${moduleName} already exists at ${targetDir}`);
        return;
      }

      await fs.ensureDir(targetDir);

      // 1. Domain Layer
      await fs.ensureDir(path.join(targetDir, 'domain/entities'));
      await fs.ensureDir(path.join(targetDir, 'domain/repositories'));
      await fs.writeFile(
        path.join(targetDir, 'domain/entities', `${moduleName}.entity.ts`),
        `export interface ${capitalize(moduleName)} {\n  id: string;\n  // Add properties\n}\n`
      );
      await fs.writeFile(
        path.join(targetDir, 'domain/repositories', `${moduleName}.repository.ts`),
        `import { ${capitalize(moduleName)} } from '../entities/${moduleName}.entity';\n\nexport interface I${capitalize(moduleName)}Repository {\n  getAll(): Promise<${capitalize(moduleName)}[]>;\n  getById(id: string): Promise<${capitalize(moduleName)} | null>;\n}\n`
      );

      // 2. Application Layer (Use Cases)
      await fs.ensureDir(path.join(targetDir, 'application/usecases'));
      await fs.writeFile(
        path.join(targetDir, 'application/usecases', `Get${capitalize(moduleName)}.usecase.ts`),
        `import { I${capitalize(moduleName)}Repository } from '../../domain/repositories/${moduleName}.repository';\n\nexport class Get${capitalize(moduleName)}UseCase {\n  constructor(private repo: I${capitalize(moduleName)}Repository) {}\n\n  async execute() {\n    return this.repo.getAll();\n  }\n}\n`
      );

      // 3. Infrastructure Layer
      await fs.ensureDir(path.join(targetDir, 'infrastructure/api'));
      await fs.writeFile(
        path.join(targetDir, 'infrastructure/api', `${moduleName}.api.ts`),
        `import { I${capitalize(moduleName)}Repository } from '../../domain/repositories/${moduleName}.repository';\nimport { ${capitalize(moduleName)} } from '../../domain/entities/${moduleName}.entity';\n\nexport class ${capitalize(moduleName)}ApiRepository implements I${capitalize(moduleName)}Repository {\n  async getAll(): Promise<${capitalize(moduleName)}[]> {\n    // Implement API call\n    return [];\n  }\n\n  async getById(id: string): Promise<${capitalize(moduleName)} | null> {\n    return null;\n  }\n}\n`
      );

      // 4. Presentation Layer (UI)
      await fs.ensureDir(path.join(targetDir, 'presentation/components'));
      await fs.ensureDir(path.join(targetDir, 'presentation/pages'));
      await fs.writeFile(
        path.join(targetDir, 'presentation/pages', `${capitalize(moduleName)}Page.tsx`),
        `import React from 'react';\nimport { Column, Text, FiboBuilder } from 'fiboui';\n\nexport const ${capitalize(moduleName)}Page = () => \n  Column()\n    .center()\n    .gap(20)\n    .children([\n      Text('${capitalize(moduleName)} Module').size(24).weight('bold').build()\n    ])\n    .build();\n`
      );

      spinner.succeed(`Module ${chalk.green(moduleName)} created successfully!`);
      console.log(chalk.dim(`\nLocated at: ${targetDir}`));

    } catch (error) {
      spinner.fail('Failed to create module');
      console.error(error);
    }
  });

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
