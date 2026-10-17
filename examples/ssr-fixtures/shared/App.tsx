import {
  Box,
  Button,
  Card,
  Column,
  Grid,
  Header,
  Text,
} from 'fiboui';

/** Same tree for Vite SSR and Next App Router. First paint must match hydrate.
 *  Returns a builder (not a host-div wrapping unassembled builders) so
 *  `page(() => App())` / `createPage` can `buildChild` before Flight sees `.key`.
 */
export function App(): any {
  const cards = ['alpha', 'beta', 'gamma'].map((label) =>
    Card()
      .key(label)
      .hover((h) => h.scale(1.02))
      .children(label)
  );

  return Box()
    .id('ssr-root')
    .children(
      Column()
        .spacing(12)
        .children([
          Header().sticky().children(Text('Fibo SSR').variant('h2')),
          Text('Hydration audit').variant('h1').id('title'),
          Box()
            .id('hover-box')
            .hover((h) => h.scale(1.04))
            .press()
            .focusRing()
            .responsive({ mobile: { padding: 8 }, desktop: { padding: 24 } })
            .children('card'),
          Button('Go').id('go'),
          Column().id('list').children(cards),
          Grid()
            .variant('bento')
            .columns(4)
            .children([Text('A'), Text('B'), Text('C')]),
        ])
    );
}
