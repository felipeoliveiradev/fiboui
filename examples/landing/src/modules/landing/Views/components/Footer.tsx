import { Text } from 'fiboui/content';
import { Row } from 'fiboui/layout';
import { Box } from 'fiboui/structure';

export function Footer() {
  return Box()
    .className('section section-ink')
    .props({ role: 'contentinfo' })
    .children([
      Box()
        .className('footer')
        .children([
          Text('FiboUI 2.0.0 · MIT © 2025–2026').mono().fontSize(13),
          Row()
            .hug()
            .children([
              <a href="https://github.com/felipeoliveiradev/fiboui">GitHub</a>,
              <a href="https://www.npmjs.com/package/fiboui">npm</a>,
              <a href="https://github.com/felipeoliveiradev/fiboui/blob/main/MIGRATION.md">
                Migration
              </a>,
            ]),
        ]),
    ]);
}
