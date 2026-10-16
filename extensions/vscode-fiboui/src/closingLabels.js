const vscode = require('vscode');
const { computeLabels } = require('./computeLabels');

function createClosingLabels(context) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    after: {
      color: '#71717A',
      fontStyle: 'italic',
      margin: '0 0 0 1.2em',
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });

  let timer;

  const schedule = (editor) => {
    clearTimeout(timer);
    timer = setTimeout(() => update(editor), 120);
  };

  const update = (editor) => {
    if (!editor) return;
    const cfg = vscode.workspace.getConfiguration('fiboui');
    if (cfg.get('closingLabels') === false) {
      editor.setDecorations(decorationType, []);
      return;
    }
    const lang = editor.document.languageId;
    if (!/^(typescript|typescriptreact|javascript|javascriptreact)$/.test(lang)) {
      editor.setDecorations(decorationType, []);
      return;
    }

    const minDepth = cfg.get('closingLabels.minDepth', 1);
    const text = editor.document.getText();
    const decorations = computeLabels(text, minDepth);
    editor.setDecorations(
      decorationType,
      decorations.map((d) => ({
        range: new vscode.Range(
          editor.document.positionAt(d.offset),
          editor.document.positionAt(d.offset)
        ),
        renderOptions: {
          after: { contentText: `// ${d.label}` },
        },
      }))
    );
  };

  context.subscriptions.push(
    decorationType,
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

  return {
    refresh: () => schedule(vscode.window.activeTextEditor),
    dispose: () => clearTimeout(timer),
  };
}

module.exports = { createClosingLabels };
