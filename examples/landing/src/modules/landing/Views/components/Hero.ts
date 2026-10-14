import { Avatar, Code, Progress, Text } from 'fiboui/content';
import { Button } from 'fiboui/interactive';
import { Nav, Row } from 'fiboui/layout';
import { Anchor } from 'fiboui/navigation';
import { Box, ListTile } from 'fiboui/structure';
import {
  amount,
  amountLabel,
  bump,
  copied,
  copyInstall,
  cycleTile,
  deltaLabel,
  ring,
  tile,
  tiles,
} from '../../state';
import { NavBar } from './NavBar';
import { Blob } from './shapes';

const steps = [
  { id: 'hero', label: 'Hero', active: true },
  { id: 'why', label: 'Why' },
  { id: 'compare', label: 'Compare' },
  { id: 'start', label: 'Start' },
];

function StepRail() {
  return Nav()
    .className('steps')
    .label('Page sections')
    .children(
      steps.map((step) =>
        Anchor(`#${step.id}`)
          .key(step.id)
          .label(step.label)
          .className(step.active ? 'step is-active' : 'step')
          .children(Box().className('step-dot'))
      )
    );
}

function CounterCard() {
  return Box()
    .className('float card-counter')
    .bindSignal(amount)
    .children(() => [
      Text('Live signal').className('card-label'),
      Text(() => amountLabel.value)
        .className('big-num')
        .id('hero-amount')
        .bindSignal(amountLabel),
      Row()
        .className('card-foot')
        .mainAxisAlignment('spaceBetween')
        .crossAxisAlignment('center')
        .children([
          Text('signal + computed').span().className('card-label'),
          Row()
            .hug()
            .children([
              Button('−')
                .variant('raw')
                .className('icon-btn')
                .id('amount-dec')
                .props({ 'aria-label': 'Decrease amount' })
                .onPress(() => bump(-25)),
              Button('+')
                .variant('raw')
                .className('icon-btn')
                .id('amount-inc')
                .props({ 'aria-label': 'Increase amount' })
                .onPress(() => bump(25)),
            ]),
        ]),
    ]);
}

function DeltaCard() {
  return Box()
    .className('float card-delta')
    .bindSignal(deltaLabel)
    .children(() => [
      Text('Delta').className('card-label'),
      Text(() => deltaLabel.value).mono().fontSize(14).id('hero-delta'),
    ]);
}

function RingCard() {
  return Box()
    .className('float card-ring')
    .bindSignal(ring)
    .children(() =>
      Progress()
        .variant('ring')
        .size(96)
        .strokeWidth(16)
        .trackColor('#e4e4e0')
        .segments([
          { value: ring.value, color: '#111' },
          { value: Math.max(0, 100 - ring.value), color: '#e4e4e0' },
        ])
        .value(ring.value)
        .max(100)
        .label('Signal progress')
        .id('hero-ring')
        .children(
          Text(() => `${Math.round(ring.value)}`)
            .mono()
            .fontSize(16)
            .id('hero-ring-value')
        )
    );
}

function TileCard() {
  return Box()
    .className('float card-tile')
    .bindSignal(tile)
    .children(() => {
      const item = tiles[tile.value];
      return ListTile()
        .id('hero-tile')
        .icon(Avatar().size(32).initials('FI'))
        .title(item.title)
        .subtitle(item.subtitle)
        .chevron()
        .onPress(cycleTile);
    });
}

function Dots() {
  return Box()
    .className('float card-dots')
    .bindSignal(tile)
    .props({ 'aria-hidden': true })
    .children(() =>
      tiles.map((_, index) =>
        Box()
          .key(String(index))
          .className(index === tile.value ? 'dot is-on' : 'dot')
      )
    );
}

export function Hero() {
  return Box()
    .className('hero')
    .id('hero')
    .children([
      NavBar(),
      Box()
        .className('hero-dark')
        .children([
          StepRail(),
          Text('FiboUI 2.0').className('hero-kicker').mono(),
          Text('Build UIs\nlike you think.')
            .h1()
            .preLine()
            .className('hero-title')
            .id('hero-title'),
          Text(
            'Fluent builders, fine-grained signals, and children that finalize themselves — the Flutter / SwiftUI assembly pattern for React.'
          ).className('hero-copy'),
          Box()
            .className('install')
            .bindSignal(copied)
            .children(() => [
              Code('npm install fiboui').inline(),
              Button(() => (copied.value ? 'Copied' : 'Copy'))
                .variant('raw')
                .className('pill pill-invert')
                .size('xs')
                .id('copy-install')
                .onPress(copyInstall),
            ]),
        ]),
      Box()
        .className('hero-light')
        .children([
          Box().className('blob-wrap').children(Blob()),
          CounterCard(),
          DeltaCard(),
          RingCard(),
          TileCard(),
          Dots(),
        ]),
    ]);
}
