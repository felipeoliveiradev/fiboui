import { Text, Avatar } from 'fiboui/content';
import { Column, Row } from 'fiboui/layout';
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
    body: 'Pass builders to .children() and they finalize implicitly. Root trees use mount() or <Fibo>.',
  },
  {
    title: 'SSR-aware',
    body: 'Router and location hooks guard window. Next.js App Router treats FiboUI as a client module. Signals are client-only.',
  },
];

export function Why() {
  return Box()
    .className('section')
    .id('why')
    .children([
      Box()
        .className('section-grid')
        .children([
          Column()
            .crossAxisAlignment('start')
            .children([
              Text('Why FiboUI').className('eyebrow'),
              <h2 className="section-title">Write the UI you mean.</h2>,
              Text(
                'FiboUI brings chainable builders to React. Compose screens with Column(), Row(), Button(), and signal() — the same assembly pattern as Flutter and SwiftUI.'
              ).className('section-copy'),
            ]),
          Box()
            .className('why-grid')
            .children([
              ...reasons.map((reason) =>
                Box()
                  .className('why-card')
                  .key(reason.title)
                  .children([
                    <h3>{reason.title}</h3>,
                    <p>{reason.body}</p>,
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
                          ).className('section-copy')
                            .style({ margin: 0, color: 'rgba(255,255,255,0.62)' }),
                        ]),
                    ]),
                ]),
            ]),
        ]),
    ]);
}
