import { Avatar, Progress, Text } from 'fiboui/content';
import { Button } from 'fiboui/interactive';
import { Column, Row, Section } from 'fiboui/layout';
import { Box, ListTile } from 'fiboui/structure';
import { amount, bump, ring, tile, tiles, cycleTile } from '../../state';

export function Showcase() {
  return Section()
    .className('section')
    .id('components')
    .labelledBy('components-title')
    .children([
      Column()
        .crossAxisAlignment('start')
        .children([
          Text('Components').className('eyebrow'),
          Text('The 2.0 surface, live.')
            .h2()
            .className('section-title')
            .id('components-title'),
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
                  Text('Button + signal').h3(),
                  Text('Increment the same amount signal used in the hero.'),
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
                  Text('Progress ring').h3(),
                  Text("variant('ring') with segments, size, and strokeWidth."),
                  Row()
                    .mainAxisAlignment('center')
                    .children([
                      Progress()
                        .variant('ring')
                        .size(148)
                        .strokeWidth(16)
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
                  Text('ListTile').h3(),
                  Text('icon, title, subtitle, chevron, divider. Click to cycle.'),
                  ...tiles.map((item, index) =>
                    ListTile()
                      .key(item.title)
                      .icon(Avatar().size(28).initials(item.title.slice(0, 2)))
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
