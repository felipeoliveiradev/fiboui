import { Text } from 'fiboui/content';
import { Footer as SiteFooter, Row } from 'fiboui/layout';
import { Anchor } from 'fiboui/navigation';
import { Box } from 'fiboui/structure';

export function Footer() {
  return SiteFooter()
    .className('section section-ink')
    .children([
      Box()
        .className('footer')
        .children([
          Text('FiboUI 2.0.0 · MIT © 2025–2026').mono().fontSize(13),
          Row()
            .hug()
            .children([
              Anchor('https://github.com/felipeoliveiradev/fiboui')
                .text('GitHub')
                .external(),
              Anchor('https://www.npmjs.com/package/fiboui').text('npm').external(),
              Anchor(
                'https://github.com/felipeoliveiradev/fiboui/blob/main/MIGRATION.md'
              )
                .text('Migration')
                .external(),
            ]),
        ]),
    ]);
}
