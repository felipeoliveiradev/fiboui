import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);

const vite = await createViteServer({
  configFile: path.join(dir, 'vite.config.ts'),
  root: dir,
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
});

http
  .createServer((req, res) => {
    vite.middlewares(req, res, async () => {
      try {
        const url = req.url || '/';
        let template = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
        template = await vite.transformIndexHtml(url, template);
        const { render } = await vite.ssrLoadModule('/entry-server.tsx');
        const { html, styles } = await render();
        const out = template
          .replace('<!--app-html-->', html)
          .replace('<!--app-styles-->', styles);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(out);
      } catch (err) {
        vite.ssrFixStacktrace(err);
        res.statusCode = 500;
        res.end(String(err?.stack || err));
      }
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`fiboui vite ssr http://127.0.0.1:${port}`);
  });
