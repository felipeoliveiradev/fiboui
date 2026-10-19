const vscode = require('vscode');
const { FACTORIES, sliceLooksLikeBuilder } = require('./factories');
const METHODS = require('./methods.json');
const { tokens: TOKEN_SETS, methods: TOKEN_METHODS } = require('./tokens.json');

const TOKEN_NAMES = Object.keys(TOKEN_SETS);

const LANGUAGES = ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'];
const DOCUMENT_SELECTORS = LANGUAGES.flatMap((language) => [
  { language, scheme: 'file' },
  { language, scheme: 'untitled' },
]);

function registerCompletions(context) {
  const provider = vscode.languages.registerCompletionItemProvider(
    DOCUMENT_SELECTORS,
    {
      provideCompletionItems(document, position) {
        const cfg = vscode.workspace.getConfiguration('fiboui');
        if (cfg.get('completions') === false) return;

        const line = document.lineAt(position).text;
        const prefix = line.slice(0, position.character);

        const args = argumentCompletions(prefix);
        if (args) {
          if (!looksLikeBuilderContext(document, position)) return;
          return args;
        }

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
          const names = [...FACTORIES, ...TOKEN_NAMES];
          return names.filter((f) => f.startsWith(partial)).map((name) => {
            const isToken = TOKEN_SETS[name] != null;
            const item = new vscode.CompletionItem(
              name,
              isToken ? vscode.CompletionItemKind.Enum : vscode.CompletionItemKind.Class,
            );
            item.detail = isToken ? 'fiboui token' : 'fiboui factory';
            item.insertText = new vscode.SnippetString(isToken ? `${name}.$0` : `${name}($0)`);
            item.sortText = `0_${name}`;
            return item;
          });
        }

        return undefined;
      },
    },
    '.',
    '(',
    "'",
    '"',
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  );

  context.subscriptions.push(provider);
}

function argumentCompletions(prefix) {
  const match = prefix.match(/\.([A-Za-z0-9_]+)\(\s*(?:([A-Z][A-Za-z0-9]*)\.)?['"]?([A-Za-z0-9_]*)$/);
  if (!match) return;
  const groups = TOKEN_METHODS[match[1]];
  if (!groups) return;
  const named = match[2];
  const partial = match[3] ?? '';
  const wanted = named ? groups.filter((group) => group === named) : groups;
  const items = [];
  for (const group of wanted) {
    const body = TOKEN_SETS[group];
    if (!body) continue;
    for (const key of Object.keys(body)) {
      if (named) {
        if (partial && !key.startsWith(partial)) continue;
        items.push(tokenItem(key, group, key));
      } else if (!partial || key.startsWith(partial)) {
        items.push(tokenItem(`${group}.${key}`, group, `${group}.${key}`));
      }
    }
  }
  return items;
}

function tokenItem(label, group, insert) {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.EnumMember);
  item.detail = `fiboui ${group}`;
  item.insertText = insert;
  item.sortText = `0_${label}`;
  return item;
}

function fileMentionsFiboui(document) {
  const head = document.getText(new vscode.Range(0, 0, Math.min(80, document.lineCount), 0));
  return /from\s+['"]fiboui(\/[^'"]*)?['"]/.test(head) || /require\(\s*['"]fiboui/.test(head);
}

function looksLikeBuilderContext(document, position) {
  if (fileMentionsFiboui(document)) return true;
  // Look back a few lines for a real FiboUI factory or .children( / .items(
  const start = Math.max(0, position.line - 12);
  const slice = document.getText(new vscode.Range(start, 0, position.line, position.character));
  return sliceLooksLikeBuilder(slice);
}

module.exports = { registerCompletions, DOCUMENT_SELECTORS, argumentCompletions };
