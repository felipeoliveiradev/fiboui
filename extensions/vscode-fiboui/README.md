# FiboUI for Cursor / VS Code

Makes fluent FiboUI trees easier to navigate — the same job Flutter’s Dart theme does with nesting guides and closing labels.

## Features

| Feature | What you get |
|---------|----------------|
| **Closing labels** | Grey `// Column` / `// List` / `// Form` after multi-line fluent closes (Dart-style) — `.children` / `.items` blocks **and** chain ends like `List().…itemHover(…)` |
| **Auto-indent** | Enter in fluent chains keeps continuation indent and nests inside `.children` / callbacks |
| **Lineage guides** | Coloured left border on multi-line `.children([…])` blocks |
| **Autocomplete** | Factories (`Column`, `Row`, …) + chain methods (`.children`, `.padding`, …) |
| **Snippets** | `fcol`, `frow`, `fscaffold`, `fbox`, `fcard`, `fbtn`, `ftxt`, `fch`, … |
| **Theme** | **FiboUI Noir** — dark canvas with strong multi-colour indent + bracket guides |

## Install (Cursor)

From the fiboui repo:

```bash
# symlink into Cursor extensions (dev)
ln -sfn "$(pwd)/extensions/vscode-fiboui" \
  "$HOME/.cursor/extensions/felipeoliveiradev.fiboui-0.1.0"
```

Then **Developer: Reload Window**.

Or open the folder and press F5 (“Run Extension”) for an Extension Development Host.

### Theme

Command Palette → **Preferences: Color Theme** → **FiboUI Noir**.

Recommended with the theme (already hinted via defaults for TS/TSX):

- Sticky Scroll on
- Indentation guides on
- Bracket pair colorization + guides on

## Settings

| Setting | Default | |
|---------|---------|---|
| `fiboui.closingLabels` | `true` | Closing `// Name` labels |
| `fiboui.closingLabels.minDepth` | `1` | Min nesting before labels show |
| `fiboui.autoIndent` | `true` | Enter adjusts indent in fluent chains |
| `fiboui.lineageGuides` | `true` | `.children` block borders |
| `fiboui.completions` | `true` | Factory / chain completions |

Commands: **FiboUI: Toggle Closing Labels**, **FiboUI: Toggle Lineage Guides**.

### Auto-indent

When `fiboui.autoIndent` is on, pressing **Enter** in TS/TSX/JS/JSX adjusts the new line for fluent builders:

| Previous line ends with… | New line indent |
|--------------------------|-----------------|
| `.children([` / `.items([` | +1 level (inside the array) |
| `Factory()` (e.g. `Column()`) | +1 level (continuation for `.method`) |
| `  .gap(12)` (chain line) | same level (next `.method`) |
| `.itemStyle((s) =>` / `.itemHover((h) =>` | +1 level (callback body) |
| `.method(` (unclosed) | +1 level (inside args) |

Example after a few Enters:

```ts
Column()
  .gap(12)
  .children([
    Form()
      .gap(12)
      .children([
```

Language defaults also set `editor.autoIndent: "full"` for TS/TSX/JS/JSX so bracket indent for `()` / `[]` stays on.

## Snippets

Type in a `.tsx` / `.ts` file:

- `fcol` → `Column().children([…])`
- `frow` → `Row().children([…])`
- `fscaffold` → `Scaffold()…`
- `fch` → `.children([…])`

## Notes

- Closing labels only appear on **multi-line** fluent closes (avoids noise on `Box().height(8)`). That includes multi-line `.children([…])` / `.items([…])`, whole Factory chains that span lines (`List().variant(…).itemHover(…)`), and multi-line chain method callbacks (e.g. `// itemStyle`).
- Completions activate when the file imports `fiboui` or the caret is inside a builder-looking chain.
- True L-shaped Flutter “tree guides” are painted by the Dart analyzer; this extension approximates that with indent guides + lineage borders + labels. Good enough for fluent TS without a custom language server.

## Develop

Pure JS — no build step. Edit `src/`, reload the window.

```bash
node src/closingLabels.test.js
node src/autoIndent.test.js
```
