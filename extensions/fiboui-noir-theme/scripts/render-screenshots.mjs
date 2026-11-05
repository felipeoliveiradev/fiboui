#!/usr/bin/env node
/**
 * Render README hero PNGs from the real FiboUI Noir theme JSON via Shiki + Chrome.
 * Install deps once (not part of the extension): shiki, puppeteer-core
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHighlighter } from 'shiki';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const themePath = path.join(root, 'themes/fiboui-noir-color-theme.json');
const outDir = path.join(root, 'images');
const theme = JSON.parse(fs.readFileSync(themePath, 'utf8'));

const shots = [
  {
    file: 'screenshot-tsx.png',
    lang: 'tsx',
    tab: 'CheckoutHero.tsx',
    languageId: 'TypeScript React',
    code: fs.readFileSync(path.join(here, 'samples/CheckoutHero.tsx'), 'utf8').trimEnd(),
  },
  {
    file: 'screenshot-go.png',
    lang: 'go',
    tab: 'palette.go',
    languageId: 'Go',
    code: fs.readFileSync(path.join(here, 'samples/palette.go'), 'utf8').trimEnd(),
  },
];

const chrome =
  process.env.CHROME_PATH ||
  ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/local/bin/google-chrome'].find((p) =>
    fs.existsSync(p)
  );

if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH.');
  process.exit(1);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function editorHtml({ tab, languageId, lines }) {
  const c = theme.colors;
  const lineNoW = String(lines.length).length;
  const body = lines
    .map((html, i) => {
      const n = String(i + 1).padStart(lineNoW, ' ');
      return `<div class="line"><span class="gutter">${n}</span><span class="code">${html}</span></div>`;
    })
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @font-face {
      font-family: 'JetBrains Mono';
      src: local('JetBrains Mono'), local('JetBrainsMono-Regular');
      font-weight: 400;
    }
    @font-face {
      font-family: 'JetBrains Mono';
      src: local('JetBrains Mono Medium'), local('JetBrainsMono-Medium');
      font-weight: 500;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      background: ${c['activityBar.background']};
      color: ${c['editor.foreground']};
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }
    .window {
      width: 1100px;
      background: ${c['editor.background']};
      border: 1px solid ${c['titleBar.border']};
    }
    .titlebar {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 40px;
      padding: 0 14px;
      background: ${c['titleBar.activeBackground']};
      color: ${c['titleBar.activeForeground']};
      border-bottom: 1px solid ${c['titleBar.border']};
      font-size: 12px;
    }
    .dots { display: flex; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot.r { background: #F87171; }
    .dot.y { background: #FBBF24; }
    .dot.g { background: ${c['focusBorder']}; }
    .title { color: ${c['descriptionForeground']}; letter-spacing: 0.02em; }
    .tabs {
      display: flex;
      height: 36px;
      background: ${c['editorGroupHeader.tabsBackground']};
      border-bottom: 1px solid ${c['tab.border']};
    }
    .tab {
      display: flex;
      align-items: center;
      padding: 0 16px;
      background: ${c['tab.activeBackground']};
      color: ${c['tab.activeForeground']};
      border-top: 2px solid ${c['tab.activeBorderTop']};
      font-size: 12.5px;
    }
    .editor {
      padding: 18px 0 22px;
      background: ${c['editor.background']};
    }
    .line {
      display: flex;
      min-height: 22px;
      line-height: 22px;
      font-size: 13.5px;
      white-space: pre;
    }
    .gutter {
      width: 56px;
      flex: none;
      text-align: right;
      padding-right: 16px;
      color: ${c['editorLineNumber.foreground']};
      user-select: none;
    }
    .line:first-child .gutter { color: ${c['editorLineNumber.activeForeground']}; }
    .code { padding-right: 28px; }
    .code span { font-family: inherit; }
    .statusbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 26px;
      padding: 0 12px;
      background: ${c['statusBar.background']};
      color: ${c['statusBar.foreground']};
      border-top: 1px solid ${c['statusBar.border']};
      font-size: 11px;
    }
    .accent { color: ${c['focusBorder']}; }
  </style>
</head>
<body>
  <div class="window" id="shot">
    <div class="titlebar">
      <div class="dots"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
      <div class="title">${escapeHtml(tab)}  ·  FiboUI Noir</div>
    </div>
    <div class="tabs"><div class="tab">${escapeHtml(tab)}</div></div>
    <div class="editor">${body}</div>
    <div class="statusbar">
      <span class="accent">FiboUI Noir</span>
      <span>${escapeHtml(languageId)}  ·  UTF-8  ·  LF  ·  JetBrains Mono</span>
    </div>
  </div>
</body>
</html>`;
}

const highlighter = await createHighlighter({
  langs: ['tsx', 'go'],
  themes: [theme],
});

fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none', '--disable-lcd-text'],
});

try {
  for (const shot of shots) {
    const tokens = highlighter.codeToTokens(shot.code, {
      lang: shot.lang,
      theme: theme.name,
    });
    const lines = tokens.tokens.map((line) =>
      line
        .map((tok) => {
          const color = tok.color || theme.colors['editor.foreground'];
          const style = tok.fontStyle & 1 ? 'italic' : tok.fontStyle & 2 ? 'bold' : 'normal';
          return `<span style="color:${color};font-style:${style === 'italic' ? 'italic' : 'normal'};font-weight:${style === 'bold' ? 500 : 400}">${escapeHtml(tok.content)}</span>`;
        })
        .join('')
    );
    const html = editorHtml({ tab: shot.tab, languageId: shot.languageId, lines });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'load' });
    const el = await page.$('#shot');
    const dest = path.join(outDir, shot.file);
    await el.screenshot({ path: dest, type: 'png' });
    await page.close();
    const stat = fs.statSync(dest);
    console.log('wrote', path.relative(root, dest), `${stat.size} bytes`);
  }
} finally {
  await browser.close();
}
