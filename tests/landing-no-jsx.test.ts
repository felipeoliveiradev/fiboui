import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const LANDING_SRC = join(__dirname, '../examples/landing/src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function hasJsx(fileName: string, source: string): string[] {
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind);
  const hits: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      hits.push(`${relative(LANDING_SRC, fileName)}:${line + 1}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return hits;
}

describe('examples/landing is builders-only', () => {
  const files = walk(LANDING_SRC);

  it('contains no .tsx files', () => {
    const tsx = files.filter((f) => f.endsWith('.tsx'));
    expect(tsx, tsx.join('\n')).toEqual([]);
  });

  it('contains no JSX elements in .ts sources', () => {
    const hits = files.flatMap((file) => {
      if (!file.endsWith('.ts')) return [];
      return hasJsx(file, readFileSync(file, 'utf8'));
    });
    expect(hits, hits.join('\n')).toEqual([]);
  });
});
