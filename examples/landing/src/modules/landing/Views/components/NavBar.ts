import { Button } from 'fiboui/interactive';
import { Nav, Row } from 'fiboui/layout';
import { Anchor } from 'fiboui/navigation';
import { LogoMark } from './shapes';

const links = [
  { href: '#why', label: 'Why' },
  { href: '#compare', label: 'Compare' },
  { href: '#components', label: 'Components' },
  { href: '#start', label: 'Start' },
];

export function NavBar() {
  return Nav()
    .className('nav')
    .props({ role: 'banner' })
    .children([
      Row()
        .hug()
        .className('nav-links')
        .children(
          links.map((link) =>
            Anchor(link.href).text(link.label).className('nav-link').key(link.href)
          )
        ),
      Anchor('#top').label('FiboUI home').children(LogoMark()),
      Row()
        .hug()
        .className('nav-actions')
        .children([
          Button('GitHub')
            .variant('raw')
            .className('pill pill-ghost')
            .size('xs')
            .onPress(() => {
              window.open('https://github.com/felipeoliveiradev/fiboui', '_blank', 'noreferrer');
            }),
          Button('npm')
            .variant('solid')
            .tone('inverse')
            .shape('pill')
            .className('pill pill-invert')
            .size('xs')
            .onPress(() => {
              window.open('https://www.npmjs.com/package/fiboui', '_blank', 'noreferrer');
            }),
        ]),
    ]);
}
