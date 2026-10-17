# FiboUI

Editor support for [FiboUI](https://fiboui.vercel.app) fluent builders in VS Code and Cursor. It adds closing labels, Enter indent for chains, lineage marks on `.children` blocks, factory and chain-method completions, snippets, and the **FiboUI Noir** dark theme.

Works in TypeScript, TSX, JavaScript, and JSX.

## Features

**Closing labels.** After the last `)` of a multi-line fluent chain, a grey italic decoration reads `// Column` (or the factory / method name). The label sits at the end of the chain, not beside the opening call. Color is `#71717A`, italic. Single-line chains such as `Box().height(8)` stay unlabeled.

Labels cover:

- Multi-line `.children([ … ])` and `.items([ … ])` closes, named after the chain root (`Column`, `List`, `Form`, …).
- A factory plus `.method(…)` links when the last `)` is on a different line from the factory (`// List` at the end of `List().variant(…).itemHover(…)`).
- A multi-line method argument that is not the chain end (for example `// itemStyle`).

**Auto-indent.** With `fiboui.autoIndent` on, Enter inside a fluent chain adjusts the next line (continuation dots, children/items arrays, and `itemStyle` / `itemHover` callbacks).

**Lineage guides.** A left-edge mark on each multi-line `.children([ … ])` or `.items([ … ])` block. Toggle with **FiboUI: Toggle Lineage Guides**.

**Autocomplete.** Two completion kinds:

- PascalCase **factories** (`Column`, `Row`, `Button`, …) as class items, when the file imports `fiboui`.
- **Chain methods** after `.` (`.children`, `.padding`, …) as method items, when the file imports `fiboui` or the caret is already in a builder chain.

There is no separate function completion kind.

**Snippets.** Prefixes in `snippets/fiboui.json` for the same four languages. Bodies use 2-space indent (same as the playground), not tabs.

**Theme.** **FiboUI Noir** (`vs-dark`). Indent guides and bracket-pair guides are one gray (`#3F3F46`). The active guide is teal (`#4EC9B0`).

## Install from the Marketplace

After the extension is published:

```text
ext install felipeoliveiradev.fiboui
```

Or open Extensions and search for **FiboUI**.

A gallery screenshot of the editor is not included in this package. After **Developer: Reload Window**, capture one from a fluent `.tsx` file if you want it on the Marketplace page.

## Theme

1. Command Palette → **Preferences: Color Theme** → **FiboUI Noir**.
2. Command Palette → **Developer: Reload Window**.

Language defaults for TS, TSX, JS, and JSX turn on full auto-indent, indentation guides, and bracket-pair guides. TypeScript and TSX also turn on sticky scroll.

## Settings

| Setting | Default | What it does |
|---------|---------|----------------|
| `fiboui.closingLabels` | `true` | Grey italic `// Name` after multi-line fluent closes |
| `fiboui.closingLabels.minDepth` | `1` | Minimum nesting depth before a label is shown |
| `fiboui.autoIndent` | `true` | Enter adjusts indent in fluent chains |
| `fiboui.lineageGuides` | `true` | Left-edge marks on multi-line `.children([ … ])` / `.items([ … ])` blocks |
| `fiboui.completions` | `true` | Factory and chain-method suggestions |

Commands: **FiboUI: Toggle Closing Labels**, **FiboUI: Toggle Lineage Guides**.

## Snippets

| Prefix | Inserts |
|--------|---------|
| `fcol` | `Column()` with alignment, spacing, and `.children([ … ])` |
| `frow` | `Row()` with alignment and `.children([ … ])` |
| `fscaffold` | `Scaffold()` with `headerBar` and `.children([ … ])` |
| `fbox` | `Box().padding(…).children([ … ])` |
| `fcard` | `Card()` with padding, a `Text`, and `.children` |
| `fcenter` | `Center().children([ … ])` |
| `fbtn` | `Button()` with `variant` and `onPress` |
| `ftxt` | `Text(…).fontSize(…)` |
| `ffield` | `TextField()` with `placeholder` and `onChange` |
| `ftile` | `ListTile()` with title, subtitle, chevron, and `onPress` |
| `fscroll` | `ScrollView().children([ … ])` |
| `fch` | `.children([ … ])` |

Each prefix also accepts a longer alias where one exists (`fibocolumn`, `fiborow`, `fiboscaffold`, `fibobox`, `fibocard`, `fibobutton`, `fibotext`, `fibotextfield`, `fibolisttile`, `fibochildren`).

## Auto-indent

When `fiboui.autoIndent` is on, Enter in TS, TSX, JS, or JSX adjusts the new line:

| Previous line ends with | New line indent |
|-------------------------|-----------------|
| `.children([` or `.items([` | +1 level (inside the array) |
| `Factory()` (for example `Column()`), and the next line is empty or starts with `.` | +1 level (continuation for `.method`) |
| A chain line such as `.gap(12)`, and the next line is empty or starts with `.` | Same level (next `.method`) |
| `.itemStyle((s) =>` or `.itemHover((h) =>` | +1 level (callback body) |
| An unclosed `.method(` | +1 level (inside the arguments) |

```ts
Column()
  .gap(12)
  .children([
    Form()
      .gap(12)
      .children([
```

Language defaults also set `editor.autoIndent` to `full` so bracket indent for `()` and `[]` stays on.

## Local development install

From the fiboui repo, symlink this folder into Cursor (or VS Code) extensions:

```bash
ln -sfn "$(pwd)/extensions/vscode-fiboui" \
  "$HOME/.cursor/extensions/felipeoliveiradev.fiboui-0.1.0"
```

Then **Developer: Reload Window**.

Or open `extensions/vscode-fiboui` and press F5 (**Run Extension**) to launch an Extension Development Host.

The extension is plain JavaScript. There is no build step. Edit `src/` and reload the window.

```bash
node src/closingLabels.test.js
node src/autoIndent.test.js
node src/snippets.test.js
```
