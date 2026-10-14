import { Code, Text } from 'fiboui/content';
import { Button } from 'fiboui/interactive';
import { Column, Row, Section } from 'fiboui/layout';
import { Box } from 'fiboui/structure';

const steps = [
  {
    n: '01',
    title: 'Install the published package',
    body: 'npm install fiboui — peer range is React 18 or 19. ESM only.',
  },
  {
    n: '02',
    title: 'Import the stylesheet yourself',
    body: "import 'fiboui/style.css' from your entry or layout. The JS entry does not load CSS.",
  },
  {
    n: '03',
    title: 'Mount a builder',
    body: 'mount("#root", App) wraps a ReactivityRoot for you. Subpath imports: fiboui/core, /layout, /content, /interactive, /structure.',
  },
];

const entry = `import 'fiboui/style.css';
import { mount } from 'fiboui/core';
import { App } from './main/App';

mount('#root', App);`;

export function QuickStart() {
  return Section()
    .className('section section-paper')
    .id('start')
    .labelledBy('start-title')
    .children([
      Box()
        .className('section-grid')
        .children([
          Column()
            .crossAxisAlignment('start')
            .children([
              Text('Quick start').className('eyebrow'),
              Text('Three steps to a screen.')
                .h2()
                .className('section-title')
                .id('start-title'),
              Text(
                "This landing is a Vite consumer of the local fiboui builders — the same contract as any app. Next.js files that call builders need 'use client'."
              ).className('section-copy'),
              Button('Open the README')
                .shape('pill')
                .variant('solid')
                .tone('inverse')
                .className('pill pill-solid')
                .onPress(() => {
                  window.open(
                    'https://github.com/felipeoliveiradev/fiboui#readme',
                    '_blank',
                    'noreferrer'
                  );
                }),
            ]),
          Box()
            .className('panel')
            .children([
              Code(entry).label('entry').language('ts').className('code'),
              Box()
                .className('start-steps')
                .children(
                  steps.map((step) =>
                    Row()
                      .className('start-step')
                      .key(step.n)
                      .crossAxisAlignment('start')
                      .children([
                        Text(step.n).span().className('start-index'),
                        Column()
                          .crossAxisAlignment('start')
                          .children([
                            Text(step.title).h3(),
                            Text(step.body),
                          ]),
                      ])
                  )
                ),
            ]),
        ]),
    ]);
}
