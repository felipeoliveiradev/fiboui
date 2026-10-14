import { Avatar, Progress, Text } from 'fiboui/content';
import { Button } from 'fiboui/interactive';
import { Column, Row } from 'fiboui/layout';
import { Box, ListTile } from 'fiboui/structure';
import { amount, bump, ring, tile, tiles, cycleTile } from '../../state';

export function Showcase() {
  return Box()
    .className('section')
    .id('components')
    .children([
      Column()
        .crossAxisAlignment('start')
        .children([
          Text('Components').className('eyebrow'),
          <h2 className="section-title">The 2.0 surface, live.</h2>,
          Text(
            'ListTile, Avatar, Progress rings, and pill buttons from the published package. These cards share the same signals as the hero.'
          ).className('section-copy'),
          Box()
            .className('showcase')
            .children([
              Box()
                .className('panel')
                .bindSignal(amount)
                .children(() => [
                  <h3>Button + signal</h3>,
                  <p>Increment the same amount signal used in the hero.</p>,
                  Text(() =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(amount.value)
                  )
                    .className('big-num')
                    .id('show-amount'),
                  Row()
                    .hug()
                    .children([
                      Button('Add 25')
                        .shape('pill')
                        .variant('solid')
                        .tone('inverse')
                        .className('pill pill-solid')
                        .id('show-inc')
                        .onPress(() => bump(25)),
                      Button('Reset')
                        .shape('pill')
                        .variant('outline')
                        .className('pill pill-outline')
                        .id('show-reset')
                        .onPress(() => {
                          amount.value = 3845.75;
                          ring.value = 64;
                        }),
                    ]),
                ]),
              Box()
                .className('panel panel-ink')
                .bindSignal(ring)
                .children(() => [
                  <h3>Progress ring</h3>,
                  <p>variant('ring') with segments, size, and strokeWidth.</p>,
                  Row()
                    .mainAxisAlignment('center')
                    .children([
                      Progress()
                        .variant('ring')
                        .size(140)
                        .strokeWidth(8)
                        .trackColor('#3b3b3b')
                        .segments([
                          { value: ring.value, color: '#fff' },
                          { value: Math.max(0, 100 - ring.value), color: '#444' },
                        ])
                        .label('Showcase ring')
                        .id('show-ring')
                        .children(
                          Text(() => `${Math.round(ring.value)}%`)
                            .mono()
                            .id('show-ring-value')
                        ),
                    ]),
                ]),
              Box()
                .className('panel')
                .bindSignal(tile)
                .children(() => [
                  <h3>ListTile</h3>,
                  <p>icon, title, subtitle, chevron, divider. Click to cycle.</p>,
                  ...tiles.map((item, index) =>
                    ListTile()
                      .key(item.title)
                      .icon(
                        Avatar()
                          .size(28)
                          .initials(item.title.slice(0, 2))
                      )
                      .title(item.title)
                      .subtitle(item.subtitle)
                      .chevron(index === tile.value)
                      .divider(index < tiles.length - 1, '#eee')
                      .id(`show-tile-${index}`)
                      .onPress(cycleTile)
                  ),
                ]),
            ]),
        ]),
    ]);
}
