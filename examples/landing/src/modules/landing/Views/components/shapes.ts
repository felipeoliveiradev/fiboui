import {
  Defs,
  Ellipse,
  Path,
  RadialGradient,
  Svg,
} from 'fiboui';
import { Box } from 'fiboui/structure';

export function Blob() {
  return Svg()
    .className('blob')
    .viewBox('0 0 420 420')
    .label('Abstract three-dimensional black form')
    .children([
      Defs().children([
        RadialGradient('blob-body')
          .cx('36%')
          .cy('30%')
          .r('72%')
          .stop('0%', '#3f3f3f')
          .stop('28%', '#1a1a1a')
          .stop('68%', '#0a0a0a')
          .stop('100%', '#000000'),
        RadialGradient('blob-spec')
          .cx('34%')
          .cy('28%')
          .r('26%')
          .stop('0%', '#ffffff', 0.28)
          .stop('55%', '#ffffff', 0.06)
          .stop('100%', '#ffffff', 0),
      ]),
      Path()
        .d(
          'M214 86c34-38 96-34 126 8 18 26 16 64-6 90 36 22 40 82 4 116-30 28-82 30-116 2-22 28-70 28-98 0-32-32-28-90 6-114-20-28-18-66 2-90 28-40 88-46 82-12z'
        )
        .fill('url(#blob-body)'),
      Ellipse().cx(176).cy(150).rx(52).ry(34).paint('url(#blob-spec)'),
    ]);
}

export function LogoMark() {
  return Box()
    .className('nav-logo')
    .props({ 'aria-hidden': true })
    .children(Box().className('nav-logo-inner'));
}
