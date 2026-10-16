const vscode = require('vscode');
const { FACTORIES } = require('./factories');
const METHODS = require('./methods.json');

function registerCompletions(context) {
  const provider = vscode.languages.registerCompletionItemProvider(
    [
      { language: 'typescript', scheme: 'file' },
      { language: 'typescriptreact', scheme: 'file' },
      { language: 'javascript', scheme: 'file' },
      { language: 'javascriptreact', scheme: 'file' },
    ],
    {
      provideCompletionItems(document, position) {
        const cfg = vscode.workspace.getConfiguration('fiboui');
        if (cfg.get('completions') === false) return;

        const line = document.lineAt(position).text;
        const prefix = line.slice(0, position.character);

        // Chain: something.
        if (/\.\s*$/.test(prefix) || /\.[a-zA-Z0-9_]*$/.test(prefix)) {
          if (!looksLikeBuilderContext(document, position)) return;
          return METHODS.map((name) => {
            const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Method);
            item.detail = 'fiboui chain';
            item.insertText = new vscode.SnippetString(`${name}($0)`);
            item.sortText = `0_${name}`;
            return item;
          });
        }

        // Factory at expression start / after return / after => / after [ , (
        if (/(?:^|[\s(,=:>])[A-Z][A-Za-z0-9]*$/.test(prefix) || /(?:return|=>)\s+[A-Z]?[A-Za-z0-9]*$/.test(prefix)) {
          if (!fileMentionsFiboui(document)) return;
          const partial = prefix.match(/([A-Z][A-Za-z0-9]*)$/)?.[1] ?? '';
          return FACTORIES.filter((f) => f.startsWith(partial)).map((name) => {
            const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Class);
            item.detail = 'fiboui factory';
            item.insertText = new vscode.SnippetString(`${name}($0)`);
            item.sortText = `0_${name}`;
            return item;
          });
        }

        return undefined;
      },
    },
    '.', // trigger on dot
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  );

  context.subscriptions.push(provider);
}

function fileMentionsFiboui(document) {
  const head = document.getText(new vscode.Range(0, 0, Math.min(80, document.lineCount), 0));
  return /from\s+['"]fiboui(\/[^'"]*)?['"]/.test(head) || /require\(\s*['"]fiboui/.test(head);
}

function looksLikeBuilderContext(document, position) {
  if (fileMentionsFiboui(document)) return true;
  // Look back a few lines for Factory( or .children(
  const start = Math.max(0, position.line - 12);
  const slice = document.getText(new vscode.Range(start, 0, position.line, position.character));
  return /[A-Z][A-Za-z0-9]*\s*\(/.test(slice) || /\.children\s*\(/.test(slice);
}

module.exports = { registerCompletions };
