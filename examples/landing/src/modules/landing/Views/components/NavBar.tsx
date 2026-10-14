import { Row } from 'fiboui/layout';
import { Button } from 'fiboui/interactive';
import { Box } from 'fiboui/structure';
import { LogoMark } from './shapes';

const links = [
  { href: '#why', label: 'Why' },
  { href: '#compare', label: 'Compare' },
  { href: '#components', label: 'Components' },
  { href: '#start', label: 'Start' },
];

export function NavBar() {
  return Box()
    .className('nav')
    .props({ role: 'banner' })
    .children([
      Row()
        .hug()
        .className('nav-links')
        .children(
          links.map((link) => (
            <a key={link.href} className="nav-link" href={link.href}>
              {link.label}
            </a>
          ))
        ),
      <a href="#top" aria-label="FiboUI home">
        <LogoMark />
      </a>,
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
