/** Same Enter rules as the FiboUI playground indent helper. */

/** Line that opens a fluent children/items array. */
const CHILDREN_OPEN = /\.(children|items)\s*\(\s*\[\s*$/;

/** `.children` / `.children()` / `.children([])` with no body yet. */
const CHILDREN_EMPTY = /\.(children|items)(?:\s*\(\s*(?:\[\s*\])?\s*\))?\s*$/;

/** itemStyle / itemHover callback opener, including typed params. */
const STYLE_CALLBACK =
  /\.(itemStyle|itemHover)\s*\(\s*\([^)]*\)\s*=>\s*(\{\s*)?$/;

/** Continuation chain line: leading whitespace + `.method`. */
const CHAIN_LINE = /^\s*\.[A-Za-z_$]/;

/** Unclosed method or factory call: `.gap(` or `Foo(`. */
const OPEN_CALL = /(?:\.\w+|[A-Z][A-Za-z0-9]*)\s*\(\s*$/;

/**
 * Empty-arg factory: `Column()`, `return Form()`, `const x = Box()`.
 * @param {string} trimmed
 */
function isFactoryEmptyLine(trimmed) {
  const text = trimmed.trim().replace(/,+\s*$/, '');
  if (/^(?:export\s+default\s+|return\s+)?[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(text)) {
    return true;
  }
  if (/[=:,(]\s*[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(text)) return true;
  return false;
}

/** `Column().gap(12)` — the factory already continued on this line. */
function isFactoryChainLine(trimmed) {
  return /^(?:export\s+default\s+|return\s+)?[A-Z][A-Za-z0-9]*\s*\([^)]*\)(?:\s*\.[A-Za-z_$][\w$]*\s*\([^)]*\))*\s*$/.test(
    trimmed.trim().replace(/,+\s*$/, '')
  );
}

/** Last `ident(...)` at the end of `text`, with nested parens (`Row(Box())`). */
function lastCompleteCall(text) {
  let i = text.length - 1;
  while (i >= 0 && /\s/.test(text[i])) i -= 1;
  if (i < 0 || text[i] !== ')') return null;
  let depth = 0;
  let quote = '';
  for (; i >= 0; i -= 1) {
    const char = text[i];
    if (quote) {
      if (char === quote && text[i - 1] !== '\\') quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === ')') depth += 1;
    else if (char === '(') {
      depth -= 1;
      if (depth !== 0) continue;
      let j = i - 1;
      while (j >= 0 && /\s/.test(text[j])) j -= 1;
      const nameEnd = j + 1;
      while (j >= 0 && /[A-Za-z0-9_$]/.test(text[j])) j -= 1;
      const name = text.slice(j + 1, nameEnd);
      if (!name) return null;
      const dotted = text[j] === '.';
      return { name, dotted, start: dotted ? j : j + 1 };
    }
  }
  return null;
}

/** `.renderItem((item) => Row()` — the next `.children` belongs to Row, not to List. */
function endsWithFactory(trimmed) {
  let text = trimmed.trim().replace(/,+\s*$/, '');
  while (text) {
    const call = lastCompleteCall(text);
    if (!call) return false;
    if (!call.dotted) return /^[A-Z]/.test(call.name);
    text = text.slice(0, call.start).trimEnd();
  }
  return false;
}

function stripLineComment(line) {
  let out = '';
  let quote = '';
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quote) {
      out += char;
      if (char === '\\') {
        out += line[i + 1] ?? '';
        i += 1;
        continue;
      }
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      out += char;
      continue;
    }
    if (char === '/' && line[i + 1] === '/') break;
    out += char;
  }
  return out;
}

/**
 * Suggest indent for the line after Enter in a FiboUI fluent chain.
 *
 * @param {string} prevLine text of the line before the newline
 * @param {string} nextLine text of the new line (may already have editor indent)
 * @param {string} baseIndent leading whitespace of prevLine
 * @param {number} tabSize editor tab size (used when indentUnit not passed)
 * @param {string} [indentUnit] one indent level (`'  '` or `'\t'`)
 * @returns {string|null} suggested leading whitespace, or null to leave alone
 */
function suggestIndent(prevLine, nextLine, baseIndent, tabSize, indentUnit) {
  const unit =
    indentUnit != null
      ? indentUnit
      : ' '.repeat(Math.max(1, Number(tabSize) || 2));
  const trimmed = stripLineComment(prevLine).replace(/\s+$/, '');
  const nextTrim = (nextLine || '').replace(/^\s+/, '');
  const nextIsChainOrEmpty = !nextTrim || nextTrim.startsWith('.');

  if (CHILDREN_OPEN.test(trimmed)) return baseIndent + unit;
  if (CHILDREN_EMPTY.test(trimmed) && !nextTrim) return baseIndent + unit;
  if (STYLE_CALLBACK.test(trimmed)) return baseIndent + unit;
  if (/\.(itemStyle|itemHover)\b.*=>\s*\{\s*$/.test(trimmed)) return baseIndent + unit;
  if (/=>\s*(\{\s*)?$/.test(trimmed) || /\{\s*$/.test(trimmed)) return baseIndent + unit;
  if (OPEN_CALL.test(trimmed)) return baseIndent + unit;
  if (isFactoryEmptyLine(trimmed) && nextIsChainOrEmpty) return baseIndent + unit;
  if (isFactoryChainLine(trimmed) && nextIsChainOrEmpty) return baseIndent + unit;
  if (endsWithFactory(trimmed) && nextIsChainOrEmpty) return baseIndent + unit;
  if (CHAIN_LINE.test(stripLineComment(prevLine)) && nextIsChainOrEmpty) return baseIndent;
  if (/\)\s*\.\s*$/.test(trimmed) && nextIsChainOrEmpty) return baseIndent + unit;

  return null;
}

/**
 * True for Enter (possibly with the editor's provisional indent).
 * @param {string} text
 */
function isEnterInsertion(text) {
  if (!text || text.indexOf('\n') < 0) return false;
  const parts = text.split(/\r?\n/);
  if (parts.length !== 2) return false;
  return parts[0] === '' && /^[\t ]*$/.test(parts[1]);
}

module.exports = {
  suggestIndent,
  isEnterInsertion,
  isFactoryEmptyLine,
  isFactoryChainLine,
  endsWithFactory,
  stripLineComment,
  CHILDREN_OPEN,
  STYLE_CALLBACK,
};
