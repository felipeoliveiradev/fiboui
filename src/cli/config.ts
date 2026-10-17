import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import fs from 'fs-extra';
import path from 'path';

const execFileAsync = promisify(execFile);
const CONFIG_EXPORT_MARK = '__FIBO_CLI_CONFIG__';

export type FiboCliConfig = {
  paths: {
    modules?: string;
    plugins?: string;
    components?: string;
    core?: string;
  };
  architecture?: string;
};

const CONFIG_FILES = ['fibo.config.js', 'fibo.config.mjs', 'fibo.config.cjs'];

/** Parse `export default { … }` or `module.exports = { … }` data configs. */
export function parseFiboConfigSource(source: string): FiboCliConfig | null {
  const trimmed = source.trim();
  const body =
    trimmed.match(/export\s+default\s+(\{[\s\S]*\})\s*;?\s*$/)?.[1] ??
    trimmed.match(/module\.exports\s*=\s*(\{[\s\S]*\})\s*;?\s*$/)?.[1];
  if (!body) return null;
  const jsonish = body
    .replace(/\/\/[^\n]*/g, '')
    .replace(/'([^'\\]*)'/g, '"$1"')
    .replace(/([,{]\s*)([A-Za-z_][\w]*)\s*:/g, '$1"$2":')
    .replace(/,(\s*[}\]])/g, '$1');
  try {
    const cfg = JSON.parse(jsonish) as FiboCliConfig;
    if (!cfg || typeof cfg !== 'object') return null;
    return { paths: cfg.paths ?? {}, architecture: cfg.architecture };
  } catch {
    return null;
  }
}

function normalizeFiboConfig(raw: unknown): FiboCliConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const cfg = raw as FiboCliConfig;
  if (cfg.paths != null && (typeof cfg.paths !== 'object' || Array.isArray(cfg.paths))) return null;
  return { paths: cfg.paths ?? {}, architecture: cfg.architecture };
}

/** Load `fibo.config.*` as a real Node module (computed ESM/CJS), not a JSON-ish regex. */
async function importConfigModule(full: string): Promise<unknown> {
  const href = pathToFileURL(full).href;
  const script = `import(${JSON.stringify(href)}).then((m)=>{process.stdout.write(${JSON.stringify(CONFIG_EXPORT_MARK)}+JSON.stringify(m.default??null))})`;
  const { stdout } = await execFileAsync(process.execPath, ['--input-type=module', '-e', script], {
    timeout: 8000,
    maxBuffer: 256 * 1024,
    windowsHide: true,
    encoding: 'utf8',
  });
  const idx = stdout.lastIndexOf(CONFIG_EXPORT_MARK);
  if (idx === -1) return undefined;
  return JSON.parse(stdout.slice(idx + CONFIG_EXPORT_MARK.length));
}

export async function loadFiboConfig(cwd: string): Promise<FiboCliConfig | null> {
  for (const name of CONFIG_FILES) {
    const full = path.resolve(cwd, name);
    if (!(await fs.pathExists(full))) continue;

    let loaded: FiboCliConfig | null = null;
    try {
      loaded = normalizeFiboConfig(await importConfigModule(full));
    } catch {
      loaded = null;
    }
    if (!loaded) {
      const source = await fs.readFile(full, 'utf8');
      loaded = parseFiboConfigSource(source);
    }
    if (!loaded) {
      throw new Error(`Invalid ${name}: could not load FiboUI config`);
    }
    return loaded;
  }
  return null;
}

export function isInsideRoot(root: string, target: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const rel = path.relative(resolvedRoot, resolvedTarget);
  return rel === '' || (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel));
}

/** Join `dir` with a single path segment. Rejects `..`, separators, and empty names. */
export function joinBasename(dir: string, name: string): string {
  if (typeof name !== 'string' || name.length === 0 || name === '.' || name === '..' || name.includes('\0')) {
    throw new Error(`Invalid path segment: ${name}`);
  }
  if (/[/\\]/.test(name) || path.basename(name) !== name) {
    throw new Error(`Invalid path segment: ${name}`);
  }
  const resolved = path.resolve(dir, name);
  if (!isInsideRoot(dir, resolved)) {
    throw new Error(`Invalid path segment: ${name}`);
  }
  return resolved;
}

export function resolveUnderRoot(root: string, rel: string): string {
  if (typeof rel !== 'string' || rel.trim() === '') {
    throw new Error(`Path escapes project: ${rel}`);
  }
  const resolved = path.resolve(root, rel);
  if (!isInsideRoot(root, resolved)) {
    throw new Error(`Path escapes project: ${rel}`);
  }
  return resolved;
}

export function resolveGenerateDir(
  kind: 'component' | 'plugin' | 'module',
  cwd: string,
  config: FiboCliConfig | null,
  extra?: string,
  opts?: { componentsDirExists?: boolean }
): string {
  const paths = config?.paths ?? {};
  if (kind === 'component') {
    const rel = paths.components ?? (opts?.componentsDirExists ? 'src/components' : null);
    return rel ? resolveUnderRoot(cwd, rel) : path.resolve(cwd);
  }
  if (kind === 'plugin') {
    return resolveUnderRoot(cwd, paths.plugins ?? 'src/plugins');
  }
  const modulesRoot = resolveUnderRoot(cwd, paths.modules ?? 'src/modules');
  return extra ? joinBasename(modulesRoot, extra) : modulesRoot;
}
