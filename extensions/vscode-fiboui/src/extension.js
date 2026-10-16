const vscode = require('vscode');
const { createClosingLabels } = require('./closingLabels');
const { createLineageGuides } = require('./lineageGuides');
const { registerCompletions } = require('./completions');
const { createAutoIndent } = require('./autoIndent');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const labels = createClosingLabels(context);
  const guides = createLineageGuides(context);
  registerCompletions(context);
  createAutoIndent(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('fiboui.toggleClosingLabels', async () => {
      const cfg = vscode.workspace.getConfiguration('fiboui');
      const next = !cfg.get('closingLabels', true);
      await cfg.update('closingLabels', next, vscode.ConfigurationTarget.Global);
      labels.refresh();
      vscode.window.showInformationMessage(
        `FiboUI closing labels ${next ? 'on' : 'off'}`
      );
    }),
    vscode.commands.registerCommand('fiboui.toggleLineageGuides', async () => {
      const cfg = vscode.workspace.getConfiguration('fiboui');
      const next = !cfg.get('lineageGuides', true);
      await cfg.update('lineageGuides', next, vscode.ConfigurationTarget.Global);
      guides.refresh();
      vscode.window.showInformationMessage(
        `FiboUI lineage guides ${next ? 'on' : 'off'}`
      );
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
