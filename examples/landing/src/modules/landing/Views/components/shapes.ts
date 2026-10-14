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
          'M214 74c62-8 128 28 148 88 18 54-2 118-52 154-46 34-108 42-160 18-54-24-86-86-78-142 8-58 66-110 142-118z'
        )
        .fill('url(#blob-body)'),
      Ellipse().cx(178).cy(154).rx(58).ry(38).paint('url(#blob-spec)'),
    ]);
}

export function LogoMark() {
  return Box()
    .className('nav-logo')
    .props({ 'aria-hidden': true })
    .children(Box().className('nav-logo-inner'));
}
