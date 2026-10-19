/**
 * Turns `width(pontos.value + 1)` inside `page(fn)` into a replay on that node.
 * The formula is read from `fn.toString()` once. The user does not wrap it.
 * A local that is not a signal stays on the page function.
 */

type Read = { peek?: () => unknown; value?: unknown };

type Node =
  | { t: 'slot' }
  | { t: 'lit'; v: number | string }
  | { t: 'neg'; x: Node }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '%'; l: Node; r: Node };

export type CompiledFormula = {
  method: string;
  slots: number;
  eval: (reads: Read[]) => unknown;
};

function peek(read: Read | undefined): unknown {
  if (!read) return undefined;
  if (typeof read.peek === 'function') return read.peek();
  return read.value;
}

function countSlots(node: Node): number {
  if (node.t === 'slot') return 1;
  if (node.t === 'lit') return 0;
  if (node.t === 'neg') return countSlots(node.x);
  return countSlots(node.l) + countSlots(node.r);
}

function evaluate(node: Node, reads: Read[], cursor: { i: number }): unknown {
  if (node.t === 'slot') return peek(reads[cursor.i++]);
  if (node.t === 'lit') return node.v;
  if (node.t === 'neg') return -Number(evaluate(node.x, reads, cursor));
  const left = evaluate(node.l, reads, cursor) as number | string;
  const right = evaluate(node.r, reads, cursor) as number | string;
  switch (node.op) {
    case '+':
      return (left as number) + (right as number);
    case '-':
      return (left as number) - (right as number);
    case '*':
      return (left as number) * (right as number);
    case '/':
      return (left as number) / (right as number);
    case '%':
      return (left as number) % (right as number);
  }
}

function compileNode(source: string): Node | null {
  let i = 0;

  function skip() {
    while (i < source.length && /\s/.test(source[i])) i += 1;
  }

  function parseAdd(): Node | null {
    let left = parseMul();
    if (!left) return null;
    for (;;) {
      skip();
      const op = source[i];
      if (op !== '+' && op !== '-') break;
      i += 1;
      const right = parseMul();
      if (!right) return null;
      left = { t: 'bin', op, l: left, r: right };
    }
    return left;
  }

  function parseMul(): Node | null {
    let left = parseUnary();
    if (!left) return null;
    for (;;) {
      skip();
      const op = source[i];
      if (op !== '*' && op !== '/' && op !== '%') break;
      i += 1;
      const right = parseUnary();
      if (!right) return null;
      left = { t: 'bin', op, l: left, r: right };
    }
    return left;
  }

  function parseUnary(): Node | null {
    skip();
    if (source[i] === '-' && source[i + 1] !== '-' && !/\d/.test(source[i + 1] ?? '')) {
      i += 1;
      const inner = parseUnary();
      return inner ? { t: 'neg', x: inner } : null;
    }
    return parsePrimary();
  }

  function parsePrimary(): Node | null {
    skip();
    const ch = source[i];
    if (ch === '(') {
      i += 1;
      const inner = parseAdd();
      skip();
      if (source[i] !== ')') return null;
      i += 1;
      return inner;
    }
    if (ch === '"' || ch === "'") return parseString(ch);
    if (ch === '.' || (ch >= '0' && ch <= '9')) return parseNumber();
    if (ch && /[A-Za-z_$]/.test(ch)) return parseSlot();
    return null;
  }

  function parseString(quote: string): Node | null {
    i += 1;
    let out = '';
    while (i < source.length && source[i] !== quote) {
      if (source[i] === '\\') {
        out += source[i + 1] ?? '';
        i += 2;
        continue;
      }
      out += source[i];
      i += 1;
    }
    if (source[i] !== quote) return null;
    i += 1;
    return { t: 'lit', v: out };
  }

  function parseNumber(): Node | null {
    const start = i;
    if (source[i] === '.') i += 1;
    while (i < source.length && /[0-9]/.test(source[i])) i += 1;
    if (source[i] === '.' && start !== i) {
      i += 1;
      while (i < source.length && /[0-9]/.test(source[i])) i += 1;
    }
    if (i === start) return null;
    const v = Number(source.slice(start, i));
    return Number.isFinite(v) ? { t: 'lit', v } : null;
  }

  function parseSlot(): Node | null {
    while (i < source.length && /[\w$]/.test(source[i])) i += 1;
    skip();
    if (source[i] !== '.') return null;
    i += 1;
    skip();
    if (source.slice(i, i + 5) !== 'value') return null;
    const after = source[i + 5];
    if (after && /[\w$]/.test(after)) return null;
    i += 5;
    return { t: 'slot' };
  }

  const node = parseAdd();
  skip();
  if (!node || i !== source.length) return null;
  return node;
}

function isPureSlot(node: Node): boolean {
  return node.t === 'slot';
}

/** Balanced argument list. Strings and nested parens stay inside. */
function readArgs(source: string, openParen: number): { args: string; next: number } | null {
  let i = openParen + 1;
  let depth = 1;
  let quote: string | null = null;
  const start = i;
  while (i < source.length) {
    const ch = source[i];
    if (quote) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      i += 1;
      continue;
    }
    if (ch === '(') depth += 1;
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) return { args: source.slice(start, i), next: i + 1 };
    }
    i += 1;
  }
  return null;
}

function skipNoise(source: string, i: number): number {
  for (;;) {
    if (source[i] === '/' && source[i + 1] === '/') {
      i += 2;
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (source[i] === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    break;
  }
  return i;
}

export function compileFormulas(source: string): CompiledFormula[] {
  const formulas: CompiledFormula[] = [];
  let i = 0;
  let quote: string | null = null;
  try {
    while (i < source.length) {
      i = skipNoise(source, i);
      const ch = source[i];
      if (quote) {
        if (ch === '\\') {
          i += 2;
          continue;
        }
        if (ch === quote) quote = null;
        i += 1;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        quote = ch;
        i += 1;
        continue;
      }
      if (ch !== '.') {
        i += 1;
        continue;
      }
      const nameStart = i + 1;
      let j = nameStart;
      while (j < source.length && /[\w$]/.test(source[j])) j += 1;
      if (j === nameStart) {
        i += 1;
        continue;
      }
      let k = j;
      while (k < source.length && /\s/.test(source[k])) k += 1;
      if (source[k] !== '(') {
        i += 1;
        continue;
      }
      const method = source.slice(nameStart, j);
      const args = readArgs(source, k);
      if (!args) {
        i += 1;
        continue;
      }
      i = args.next;
      if (args.args.includes(',')) continue;
      const node = compileNode(args.args);
      if (!node || isPureSlot(node) || countSlots(node) === 0) continue;
      const slots = countSlots(node);
      const tree = node;
      formulas.push({
        method,
        slots,
        eval: (reads) => evaluate(tree, reads, { i: 0 }),
      });
    }
  } catch {
    return formulas;
  }
  return formulas;
}

export function takeFormula(
  formulas: CompiledFormula[],
  cursor: number,
  method: string,
  reads: Read[],
  sample: unknown,
): { next: number; eval: CompiledFormula['eval'] } | null {
  for (let index = cursor; index < formulas.length; index += 1) {
    const formula = formulas[index];
    if (formula.method !== method || formula.slots !== reads.length) continue;
    let value: unknown;
    try {
      value = formula.eval(reads);
    } catch {
      continue;
    }
    if (!Object.is(value, sample)) continue;
    return { next: index + 1, eval: formula.eval };
  }
  return null;
}
