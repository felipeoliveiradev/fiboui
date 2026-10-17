const { FACTORY_SET } = require('./factories');

/**
 * Closing labels for FiboUI fluent trees.
 *
 * 1. Multi-line `.children([ … ])` / `.items([ … ])` closes → `// FactoryName`
 *    (chain root: `Column().….children([` → Column).
 * 2. Multi-line fluent CHAIN closes: Factory + `.method(…)`… where the last
 *    method’s `)` is on a different line than the Factory → `// FactoryName`.
 *    Covers `List().variant(…).itemHover(…)` with no multi-line paren on List itself.
 * 3. Multi-line chain *method* args (e.g. `.itemStyle((s) => …)`) get
 *    `// methodName` when that close is not the chain end (outer Factory wins there).
 */
function computeLabels(text, minDepth = 1) {
  const out = [];
  const source = maskNoise(text);
  const callRe = /\.(children|items)\s*\(/g;
  let m;
  while ((m = callRe.exec(source))) {
    const openParen = m.index + m[0].length - 1; // position of '('
    const closeParen = findMatchingParen(text, openParen);
    if (closeParen < 0) continue;

    const span = text.slice(openParen, closeParen);
    if (!span.includes('\n')) continue;

    const root = findChainRoot(text, m.index);
    if (!root) continue;

    // nesting: how many other multi-line children blocks enclose this open
    const nest = countEnclosingChildren(source, openParen) + 1;
    if (nest < minDepth) continue;

    out.push({ offset: closeParen + 1, label: root, depth: nest });
  }

  // Fluent chain closes + multi-line method callback labels
  const factoryRe = /\b([A-Z][A-Za-z0-9]*)\s*\(/g;
  while ((m = factoryRe.exec(source))) {
    const name = m[1];
    if (!FACTORY_SET.has(name)) continue;

    const openParen = m.index + m[0].length - 1;
    const factoryClose = findMatchingParen(text, openParen);
    if (factoryClose < 0) continue;

    const { chainEnd, methods } = walkFluentChain(text, factoryClose);
    const factoryStart = m.index;
    const chainSpan = text.slice(factoryStart, chainEnd + 1);
    const nest = countEnclosingChildren(source, openParen) + 1;

    if (chainSpan.includes('\n') && nest >= minDepth) {
      out.push({ offset: chainEnd + 1, label: name, depth: nest });
    }

    // Multi-line method bodies that are not the chain terminator
    for (const method of methods) {
      if (method.close === chainEnd) continue;
      const span = text.slice(method.open, method.close);
      if (!span.includes('\n')) continue;
      const methodNest = countEnclosingChildren(source, method.open) + 1;
      if (methodNest < minDepth) continue;
      out.push({
        offset: method.close + 1,
        label: method.name,
        depth: methodNest,
      });
    }
  }

  // Prefer deepest; at equal depth prefer PascalCase (Factory) over method names
  const byOffset = new Map();
  for (const d of out) {
    const prev = byOffset.get(d.offset);
    if (!prev) {
      byOffset.set(d.offset, d);
      continue;
    }
    if (d.depth > prev.depth) {
      byOffset.set(d.offset, d);
      continue;
    }
    if (d.depth === prev.depth && isFactoryLabel(d.label) && !isFactoryLabel(prev.label)) {
      byOffset.set(d.offset, d);
    }
  }
  return [...byOffset.values()];
}

function isFactoryLabel(label) {
  return FACTORY_SET.has(label) || /^[A-Z]/.test(label);
}

/**
 * From the `)` that closes `Factory(…)`, walk `.method(…)` links.
 * Returns the final close offset and each method’s open/close.
 */
function walkFluentChain(text, factoryClose) {
  let chainEnd = factoryClose;
  let i = factoryClose + 1;
  const methods = [];

  while (i < text.length) {
    i = skipGap(text, i);
    if (text[i] !== '.') break;

    i++; // skip '.'
    const methodStart = i;
    while (i < text.length && isIdentChar(text[i])) i++;
    if (i === methodStart) break;
    const methodName = text.slice(methodStart, i);

    i = skipGap(text, i);
    if (text[i] !== '(') break;

    const methodOpen = i;
    const methodClose = findMatchingParen(text, methodOpen);
    if (methodClose < 0) break;

    methods.push({ name: methodName, open: methodOpen, close: methodClose });
    chainEnd = methodClose;
    i = methodClose + 1;
  }

  return { chainEnd, methods };
}

function findMatchingParen(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') {
      i = skipString(text, i) - 1;
      continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i);
      if (nl < 0) return -1;
      i = nl;
      continue;
    }
    if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      if (end < 0) return -1;
      i = end + 1;
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Walk left from `.children` over `.method(...)` / newlines to find `Factory(`. */
function findChainRoot(text, dotIndex) {
  let i = dotIndex - 1;
  while (i >= 0 && /\s/.test(text[i])) i--;

  // Expect to be after a previous link: `)` of Factory() or of .method()
  while (i >= 0) {
    if (text[i] === ')') {
      const open = findOpenParenBackward(text, i);
      if (open < 0) return null;
      // name before open
      let j = open - 1;
      while (j >= 0 && /\s/.test(text[j])) j--;
      // method: .name(  or Factory(
      if (j >= 0 && isIdentChar(text[j])) {
        let start = j;
        while (start >= 0 && isIdentChar(text[start])) start--;
        const name = text.slice(start + 1, j + 1);
        // skip whitespace/dot before name
        let k = start;
        while (k >= 0 && /\s/.test(text[k])) k--;
        if (text[k] === '.') {
          // chained method — jump before the receiver of this call
          i = k - 1;
          while (i >= 0 && /\s/.test(text[i])) i--;
          continue;
        }
        if (FACTORY_SET.has(name) || /^[A-Z][A-Za-z0-9]*$/.test(name)) {
          return name;
        }
        return null;
      }
      i = open - 1;
      continue;
    }
    if (isIdentChar(text[i])) {
      let start = i;
      while (start >= 0 && isIdentChar(text[start])) start--;
      const name = text.slice(start + 1, i + 1);
      if (FACTORY_SET.has(name) || /^[A-Z][A-Za-z0-9]*$/.test(name)) return name;
      return null;
    }
    break;
  }
  return null;
}

function findOpenParenBackward(text, closeIdx) {
  let depth = 0;
  let i = closeIdx;
  let inStr = null;
  while (i >= 0) {
    const c = text[i];
    if (inStr) {
      if (c === inStr && text[i - 1] !== '\\') inStr = null;
      i--;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c;
      i--;
      continue;
    }
    if (c === ')') depth++;
    else if (c === '(') {
      depth--;
      if (depth === 0) return i;
    }
    i--;
  }
  return -1;
}

function countEnclosingChildren(text, pos) {
  let count = 0;
  const re = /\.(children|items)\s*\(/g;
  let m;
  while ((m = re.exec(text))) {
    const open = m.index + m[0].length - 1;
    if (open >= pos) break;
    const close = findMatchingParen(text, open);
    if (close > pos) count++;
  }
  return count;
}

function isIdentChar(c) {
  return /[A-Za-z0-9_$]/.test(c);
}

function skipGap(text, index) {
  let i = index;
  while (i < text.length) {
    if (/\s/.test(text[i])) {
      i++;
      continue;
    }
    if (text[i] === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i);
      i = nl < 0 ? text.length : nl + 1;
      continue;
    }
    if (text[i] === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      i = end < 0 ? text.length : end + 2;
      continue;
    }
    break;
  }
  return i;
}

function skipString(text, start) {
  const quote = text[start];
  let i = start + 1;
  while (i < text.length) {
    if (text[i] === '\\') {
      i += 2;
      continue;
    }
    if (quote === '`' && text[i] === '$' && text[i + 1] === '{') {
      const close = findMatchingBrace(text, i + 1);
      i = close < 0 ? text.length : close + 1;
      continue;
    }
    if (text[i] === quote) return i + 1;
    if (quote !== '`' && text[i] === '\n') return i;
    i++;
  }
  return text.length;
}

function findMatchingBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Strings and comments become spaces so a factory inside them is not a label. */
function maskNoise(text) {
  const chars = text.split('');
  let i = 0;
  while (i < chars.length) {
    const char = chars[i];
    if (char === '"' || char === "'" || char === '`') {
      const end = skipString(text, i);
      for (let k = i; k < end && k < chars.length; k++) {
        if (chars[k] !== '\n') chars[k] = ' ';
      }
      i = end;
      continue;
    }
    if (char === '/' && chars[i + 1] === '/') {
      while (i < chars.length && chars[i] !== '\n') {
        chars[i] = ' ';
        i++;
      }
      continue;
    }
    if (char === '/' && chars[i + 1] === '*') {
      chars[i] = ' ';
      chars[i + 1] = ' ';
      i += 2;
      while (i < chars.length && !(chars[i] === '*' && chars[i + 1] === '/')) {
        if (chars[i] !== '\n') chars[i] = ' ';
        i++;
      }
      if (chars[i] === '*') {
        chars[i] = ' ';
        chars[i + 1] = ' ';
        i += 2;
      }
      continue;
    }
    i++;
  }
  return chars.join('');
}

module.exports = { computeLabels, maskNoise };
