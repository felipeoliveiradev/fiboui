import { pluginNames, toPascalCase } from './names.js';

/** 2.0 playground style: builders are React nodes, 2-space indent, no `.build()`. */
export function componentTemplate(name: string): string {
  const componentName = toPascalCase(name);
  return `import { Row, Text } from 'fiboui';

export interface ${componentName}Props {
  title?: string;
}

export function ${componentName}({ title = '${componentName}' }: ${componentName}Props) {
  return Row()
    .padding(16)
    .bg('white')
    .rounded('lg')
    .shadow('sm')
    .children([
      Text(title).fontSize(18).fontWeight('bold'),
    ]);
}
`;
}

export function pluginTemplate(raw: string): string {
  const { safeName, label, path } = pluginNames(raw);
  return `import type { FiboPlugin, FiboContext } from 'fiboui';

export const ${safeName}: FiboPlugin = {
  name: '${safeName}',
  version: '1.0.0',
  setup: (ctx: FiboContext) => {
    ctx.registerSidebarItem({
      label: '${label}',
      path: '${path}',
      order: 10,
    });
  },
};
`;
}

export function modulePageTemplate(name: string): string {
  const moduleName = toPascalCase(name);
  return `import { Column, Text } from 'fiboui';

export function ${moduleName}Page() {
  return Column()
    .center()
    .gap(20)
    .children([
      Text('${moduleName} Module').variant('h2'),
    ]);
}
`;
}

export function moduleFiles(name: string): Record<string, string> {
  const moduleName = toPascalCase(name);
  return {
    [`domain/entities/${moduleName}.entity.ts`]: `export interface ${moduleName} {\n  id: string;\n}\n`,
    [`domain/repositories/${moduleName}.repository.ts`]: `import { ${moduleName} } from '../entities/${moduleName}.entity';\n\nexport interface I${moduleName}Repository {\n  getAll(): Promise<${moduleName}[]>;\n  getById(id: string): Promise<${moduleName} | null>;\n}\n`,
    [`application/usecases/Get${moduleName}.usecase.ts`]: `import { I${moduleName}Repository } from '../../domain/repositories/${moduleName}.repository';\n\nexport class Get${moduleName}UseCase {\n  constructor(private repo: I${moduleName}Repository) {}\n\n  async execute() {\n    return this.repo.getAll();\n  }\n}\n`,
    [`infrastructure/api/${moduleName}.api.ts`]: `import { I${moduleName}Repository } from '../../domain/repositories/${moduleName}.repository';\nimport { ${moduleName} } from '../../domain/entities/${moduleName}.entity';\n\nexport class ${moduleName}ApiRepository implements I${moduleName}Repository {\n  async getAll(): Promise<${moduleName}[]> {\n    return [];\n  }\n\n  async getById(id: string): Promise<${moduleName} | null> {\n    return null;\n  }\n}\n`,
    [`presentation/pages/${moduleName}Page.tsx`]: modulePageTemplate(moduleName),
  };
}

export function initConfigSource(isStandard: boolean): string {
  const note = isStandard ? '' : ' // Update this';
  return `export default {
  paths: {
    modules: 'src/modules',${note}
    plugins: 'src/plugins',${note}
    components: 'src/components',${note}
    core: 'src/core',${note}
  },
  architecture: '${isStandard ? 'clean' : 'custom'}',
};
`;
}
