const vscode = require('vscode');

/**
 * Subtle left-border marks on `.children([` … `])` ranges so nested
 * fluent trees read more like Flutter's indent lineage.
 */
function createLineageGuides(context) {
  const colors = [
    '#A78BFA66',
    '#F59E0B66',
    '#38BDF866',
    '#C084FC66',
    '#34D39966',
    '#FB718566',
  ];

  const types = colors.map((color) =>
    vscode.window.createTextEditorDecorationType({
      isWholeLine: false,
      borderWidth: '0 0 0 2px',
      borderStyle: 'solid',
      borderColor: color,
      overviewRulerColor: color,
      overviewRulerLane: vscode.OverviewRulerLane.Left,
    })
  );

  let timer;
  const schedule = (editor) => {
    clearTimeout(timer);
    timer = setTimeout(() => update(editor), 150);
  };

  const update = (editor) => {
    if (!editor) return;
    const cfg = vscode.workspace.getConfiguration('fiboui');
    if (cfg.get('lineageGuides') === false) {
      types.forEach((t) => editor.setDecorations(t, []));
      return;
    }
    const lang = editor.document.languageId;
    if (!/^(typescript|typescriptreact|javascript|javascriptreact)$/.test(lang)) {
      types.forEach((t) => editor.setDecorations(t, []));
      return;
    }

    const text = editor.document.getText();
    const rangesByBucket = colors.map(() => []);
    const re = /\.children\s*\(\s*\[/g;
    let m;
    while ((m = re.exec(text))) {
      const openBracket = text.indexOf('[', m.index);
      if (openBracket < 0) continue;
      const close = findMatching(text, openBracket, '[', ']');
      if (close < 0) continue;
      // only multi-line children blocks
      const inner = text.slice(openBracket, close);
      if (!inner.includes('\n')) continue;
      const start = editor.document.positionAt(openBracket);
      const end = editor.document.positionAt(close + 1);
      const depth = Math.min(
        colors.length - 1,
        Math.max(0, Math.floor(start.character / 2) % colors.length)
      );
      rangesByBucket[depth].push(new vscode.Range(start, end));
    }

    types.forEach((t, i) => editor.setDecorations(t, rangesByBucket[i]));
  };

  context.subscriptions.push(...types);
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((e) => schedule(e)),
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (vscode.window.activeTextEditor?.document === e.document) {
        schedule(vscode.window.activeTextEditor);
      }
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('fiboui')) schedule(vscode.window.activeTextEditor);
    })
  );

  schedule(vscode.window.activeTextEditor);
  return { refresh: () => schedule(vscode.window.activeTextEditor) };
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
    if (c === openCh) depth++;
    else if (c === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

module.exports = { createLineageGuides };
