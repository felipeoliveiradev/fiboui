const { maskNoise } = require('./computeLabels');

/**
 * Multi-line `.children([ … ])` / `.items([ … ])` ranges for lineage marks.
 * Strings and comments are ignored (same mask as closing labels).
 * @param {string} text
 * @returns {{ start: number, end: number }[]}
 */
function collectLineageRanges(text) {
  if (typeof text !== 'string' || !text) return [];
  const source = maskNoise(text);
  const ranges = [];
  const re = /\.(children|items)\s*\(\s*\[/g;
  let m;
  while ((m = re.exec(source))) {
    const openBracket = source.indexOf('[', m.index);
    if (openBracket < 0) continue;
    const close = findMatching(source, openBracket, '[', ']');
    if (close < 0) continue;
    const inner = source.slice(openBracket, close);
    if (!inner.includes('\n')) continue;
    ranges.push({ start: openBracket, end: close + 1 });
  }
  return ranges;
}

function findMatching(text, openIdx, openCh, closeCh) {
  let depth = 0;
  let i = openIdx;
  let inStr = null;
  while (i < text.length) {
    const c = text[i];
    if (inStr) {
      if (c === '\\') {
        i += 2;
        continue;
      }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c;
      i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      if (end < 0) return -1;
      i = end + 2;
      continue;
    }
    if (c === openCh) depth++;
    else if (c === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

module.exports = { collectLineageRanges };
