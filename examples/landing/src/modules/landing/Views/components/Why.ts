import { Avatar, Text } from 'fiboui/content';
import { Column, Row, Section } from 'fiboui/layout';
import { Box } from 'fiboui/structure';

const reasons = [
  {
    title: 'Builders',
    body: 'Factories return builders for endless chaining. Typed methods stay assignable as children.',
  },
  {
    title: 'Signals',
    body: 'signal(), computed(), createStore(), .bindSignal(), and .observer() for fine-grained updates.',
  },
  {
    title: 'No JSX boilerplate',
    body: 'Pass builders to .children() and they finalize implicitly. Root trees use mount() or the Fibo wrapper.',
  },
  {
    title: 'SSR-aware',
    body: 'Router and location hooks guard window. Next.js App Router treats FiboUI as a client module. Signals are client-only.',
  },
];

export function Why() {
  return Section()
    .className('section')
    .id('why')
    .labelledBy('why-title')
    .children([
      Box()
        .className('section-grid')
        .children([
          Column()
            .crossAxisAlignment('start')
            .children([
              Text('Why FiboUI').className('eyebrow'),
              Text('Write the UI you mean.').h2().className('section-title').id('why-title'),
              Text(
                'FiboUI brings chainable builders to React. Compose screens with Column(), Row(), Button(), and signal() — the same assembly pattern as Flutter and SwiftUI.'
              ).className('section-copy'),
            ]),
          Box()
            .className('why-grid')
            .children([
              ...reasons.map((reason, index) =>
                Box()
                  .className('why-card')
                  .key(reason.title)
                  .children([
                    Text(`0${index + 1}`).span().className('why-index').mono(),
                    Text(reason.title).h3(),
                    Text(reason.body),
                  ])
              ),
              Box()
                .className('why-card span')
                .children([
                  Row()
                    .hug()
                    .crossAxisAlignment('center')
                    .spacing(12)
                    .children([
                      Avatar().size(36).icon('user'),
                      Column()
                        .hug()
                        .crossAxisAlignment('start')
                        .children([
                          Text('Accessibility, in the kit').weight('bold'),
                          Text(
                            'Progress exposes role="progressbar". Select and Combobox ship a WAI-ARIA listbox. Collapse uses aria-expanded. Spinner and Skeleton use role="status". Tables mark th scope="col".'
                          )
                            .className('section-copy')
                            .style({ margin: 0, color: 'rgba(255,255,255,0.62)' }),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ]);
}
