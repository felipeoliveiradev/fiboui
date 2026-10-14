import {
  Circle,
  Defs,
  Ellipse,
  RadialGradient,
  Svg,
  SvgFilter,
  SvgGroup,
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
          .cx('38%')
          .cy('32%')
          .r('68%')
          .stop('0%', '#3a3a3a')
          .stop('42%', '#161616')
          .stop('100%', '#050505'),
        RadialGradient('blob-spec')
          .cx('34%')
          .cy('28%')
          .r('28%')
          .stop('0%', '#ffffff', 0.22)
          .stop('100%', '#ffffff', 0),
        SvgFilter('blob-goo')
          .region('-20%', '-20%', '140%', '140%')
          .blur(16)
          .colorMatrix('1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10'),
      ]),
      SvgGroup()
        .filter('url(#blob-goo)')
        .paint('url(#blob-body)')
        .children([
          Circle().cx(168).cy(168).r(96).fill('url(#blob-body)'),
          Circle().cx(256).cy(154).r(86).fill('url(#blob-body)'),
          Circle().cx(248).cy(248).r(92).fill('url(#blob-body)'),
          Circle().cx(160).cy(246).r(80).fill('url(#blob-body)'),
          Circle().cx(210).cy(210).r(70).fill('url(#blob-body)'),
        ]),
      Ellipse().cx(176).cy(156).rx(54).ry(36).paint('url(#blob-spec)'),
    ]);
}

export function LogoMark() {
  return Box()
    .className('nav-logo')
    .props({ 'aria-hidden': true })
    .children(Box().className('nav-logo-inner'));
}
