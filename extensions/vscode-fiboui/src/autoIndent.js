const vscode = require('vscode');
const { suggestIndent, isEnterInsertion } = require('./suggestIndent');

const LANGS = /^(typescript|typescriptreact|javascript|javascriptreact)$/;

/**
 * @param {vscode.ExtensionContext} context
 */
function createAutoIndent(context) {
  let applying = false;

  const onChange = (/** @type {vscode.TextDocumentChangeEvent} */ e) => {
    if (applying) return;
    if (e.document.uri.scheme !== 'file' && e.document.uri.scheme !== 'untitled') {
      return;
    }

    const cfg = vscode.workspace.getConfiguration('fiboui');
    if (cfg.get('autoIndent') === false) return;

    if (!LANGS.test(e.document.languageId)) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document !== e.document) return;

    for (const change of e.contentChanges) {
      if (!isEnterInsertion(change.text)) continue;

      const prevLineNum = change.range.start.line;
      const newLineNum = prevLineNum + 1;
      if (newLineNum >= e.document.lineCount) continue;

      const prevLine = e.document.lineAt(prevLineNum).text;
      const newLine = e.document.lineAt(newLineNum).text;
      const baseIndent = (prevLine.match(/^[\t ]*/) || [''])[0];

      const insertSpaces = editor.options.insertSpaces !== false;
      const tabSize = Number(editor.options.tabSize) || 2;
      const indentUnit = insertSpaces ? ' '.repeat(tabSize) : '\t';

      const suggested = suggestIndent(
        prevLine,
        newLine,
        baseIndent,
        tabSize,
        indentUnit
      );
      if (suggested == null) continue;

      const currentIndent = (newLine.match(/^[\t ]*/) || [''])[0];
      if (currentIndent === suggested) continue;

      applying = true;
      const range = new vscode.Range(
        new vscode.Position(newLineNum, 0),
        new vscode.Position(newLineNum, currentIndent.length)
      );
      editor
        .edit((edit) => edit.replace(range, suggested), {
          undoStopBefore: false,
          undoStopAfter: false,
        })
        .then(
          () => {
            applying = false;
          },
          () => {
            applying = false;
          }
        );
      break;
    }
  };

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onChange));
}

module.exports = {
  createAutoIndent,
  suggestIndent,
  isEnterInsertion,
};
