const vscode = require('vscode');
const { collectLineageRanges } = require('./lineageRanges');

/**
 * Subtle left-border marks on `.children([` / `.items([` … `])` ranges so nested
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
    for (const span of collectLineageRanges(text)) {
      const start = editor.document.positionAt(span.start);
      const end = editor.document.positionAt(span.end);
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

module.exports = { createLineageGuides };
