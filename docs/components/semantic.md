# Semantic builders

Fluent landmarks, headings, anchors, code, and SVG — so a page can be built without JSX.

## Headings

```ts
Text('Build UIs like you think.').h1().preLine()
Text('Why FiboUI').h2()
Text('Builders').h3()
Text('chip').span()
```

`.h1()`–`.h6()` set the Text variant. `.preLine()` keeps `\\n` as line breaks. `Break()` emits `<br>` when you need an explicit break.

## Landmarks

```ts
import { Footer, Main, Nav, Section } from 'fiboui/layout';

Main().children([
  Nav().label('Primary').children(Anchor('#why').text('Why')),
  Section().id('why').labelledBy('why-title').children(
    Text('Why').h2().id('why-title')
  ),
  Footer().children(Text('MIT')),
])
```

`Header` remains the app chrome bar (`height`, `sticky`). Use `Nav` for a document `<nav>`.

## Anchors

```ts
import { Anchor } from 'fiboui/navigation';

Anchor('#start').text('Start')
Anchor('https://www.npmjs.com/package/fiboui').text('npm').external()
```

`Link` / `NavLink` still do in-app routing. `Anchor` is a plain `<a>` for hash and external URLs.

## Code

```ts
import { Code } from 'fiboui/content';

Code('npm install fiboui').inline()
Code(source).label('FiboUI 2.0').language('ts')
```

## SVG

```ts
import { Circle, Defs, Ellipse, RadialGradient, Svg, SvgFilter, SvgGroup } from 'fiboui';

Svg()
  .viewBox('0 0 420 420')
  .label('Abstract form')
  .children([
    Defs().children([
      RadialGradient('body').cx('38%').cy('32%').r('68%')
        .stop('0%', '#3a3a3a')
        .stop('100%', '#050505'),
      SvgFilter('goo').blur(16).colorMatrix('1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10'),
    ]),
    SvgGroup().filter('url(#goo)').paint('url(#body)').children([
      Circle().cx(168).cy(168).r(96).fill('url(#body)'),
    ]),
    Ellipse().cx(176).cy(156).rx(54).ry(36).paint('url(#body)'),
  ])
```
