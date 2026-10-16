/** Line that opens a fluent children/items array. */
const CHILDREN_OPEN = /\.(children|items)\s*\(\s*\[\s*$/;

/** itemStyle / itemHover callback opener ending with `(s) =>` or `(h) =>`. */
const STYLE_CALLBACK =
  /\.(itemStyle|itemHover)\s*\(\s*\(\s*[a-zA-Z_]\w*\s*\)\s*=>\s*$/;

/** Continuation chain line: leading whitespace + `.method`. */
const CHAIN_LINE = /^\s*\.[A-Za-z_$]/;

/** Unclosed method call on a chain/factory line: `.gap(` or `Foo(`. */
const OPEN_CALL = /\.\w+\s*\(\s*$/;

/**
 * Empty-arg factory: `Column()`, `return Form()`, `const x = Box()`.
 * @param {string} trimmed
 */
function isFactoryEmptyLine(trimmed) {
  const t = trimmed.trim();
  if (/^(?:return\s+)?[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(t)) return true;
  if (/[=:,(]\s*[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*$/.test(trimmed)) return true;
  return false;
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
  const trimmed = prevLine.replace(/\s+$/, '');
  const nextTrim = (nextLine || '').replace(/^\s+/, '');
  const nextIsChainOrEmpty = !nextTrim || nextTrim.startsWith('.');

  if (CHILDREN_OPEN.test(trimmed)) {
    return baseIndent + unit;
  }

  if (STYLE_CALLBACK.test(trimmed)) {
    return baseIndent + unit;
  }

  // Broader: itemStyle((s) => {  or itemHover((h) => {
  if (/\.(itemStyle|itemHover)\b.*=>\s*\{\s*$/.test(trimmed)) {
    return baseIndent + unit;
  }

  if (OPEN_CALL.test(trimmed) && !CHILDREN_OPEN.test(trimmed)) {
    return baseIndent + unit;
  }

  if (isFactoryEmptyLine(trimmed) && nextIsChainOrEmpty) {
    return baseIndent + unit;
  }

  // `Something().` unfinished rare form — treat as chain start
  if (/[A-Z][A-Za-z0-9]*\s*\(\s*\)\s*\.\s*$/.test(trimmed)) {
    return baseIndent + unit;
  }

  if (CHAIN_LINE.test(prevLine) && nextIsChainOrEmpty) {
    // Stay on the continuation column (editor may have collapsed indent)
    return baseIndent;
  }

  // After `).` mid-chain fragment when next is `.method`
  if (/\)\s*\.\s*$/.test(trimmed) && nextIsChainOrEmpty) {
    return baseIndent + unit;
  }

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
  CHILDREN_OPEN,
  STYLE_CALLBACK,
};
