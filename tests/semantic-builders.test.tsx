import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Anchor,
  Break,
  Circle,
  Code,
  Defs,
  Ellipse,
  Footer,
  Main,
  Nav,
  RadialGradient,
  Section,
  Svg,
  SvgFilter,
  SvgGroup,
  Text,
} from '../src';

describe('Text heading helpers', () => {
  it('renders h1–h3 via .h1() / .h2() / .h3()', () => {
    const { container } = render(
      Text('Title').h1().id('hero-title').preLine().build()
    );
    const h1 = container.querySelector('h1');
    expect(h1?.tagName).toBe('H1');
    expect(h1?.id).toBe('hero-title');
    expect((h1 as HTMLElement).style.whiteSpace).toBe('pre-line');
    render(Text('Sub').h2().build());
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('Sub');
    render(Text('Card').h3().build());
    expect(screen.getAllByRole('heading', { level: 3 })[0]).toHaveTextContent('Card');
  });

  it('span() renders a caption span', () => {
    const { container } = render(Text('chip').span().build());
    expect(container.querySelector('span.fibo-text-caption')?.textContent).toBe('chip');
  });
});

describe('landmarks', () => {
  it('Section / Nav / Main / Footer emit semantic tags', () => {
    const { container } = render(
      Main()
        .children([
          Nav().label('Primary').children(Text('Home')),
          Section().id('why').labelledBy('why-title').children(Text('Why').h2().id('why-title')),
          Footer().children(Text('MIT')),
        ])
        .build()
    );
    expect(container.querySelector('main.fibo-main')).toBeTruthy();
    expect(container.querySelector('nav.fibo-nav')?.getAttribute('aria-label')).toBe('Primary');
    expect(container.querySelector('section#why')?.getAttribute('aria-labelledby')).toBe(
      'why-title'
    );
    expect(container.querySelector('footer.fibo-footer')).toHaveTextContent('MIT');
  });
});

describe('Anchor', () => {
  it('renders hash and external anchors', () => {
    const { rerender } = render(Anchor('#why').text('Why').className('nav-link').build());
    const hash = screen.getByRole('link', { name: 'Why' });
    expect(hash).toHaveAttribute('href', '#why');
    expect(hash.className).toMatch(/nav-link/);

    rerender(
      Anchor('https://example.com')
        .text('Docs')
        .external()
        .build()
    );
    const ext = screen.getByRole('link', { name: 'Docs' });
    expect(ext).toHaveAttribute('target', '_blank');
    expect(ext).toHaveAttribute('rel', 'noreferrer noopener');
  });
});

describe('Code + Break', () => {
  it('renders a labeled pre/code block', () => {
    const { container } = render(
      Code('const x = 1;').label('FiboUI 2.0').language('ts').className('code').build()
    );
    const pre = container.querySelector('pre.fibo-code');
    expect(pre?.textContent).toContain('const x = 1;');
    expect(pre?.querySelector('.fibo-code-label')?.textContent).toBe('FiboUI 2.0');
    expect(pre?.querySelector('code.language-ts')).toBeTruthy();
  });

  it('inline() renders <code>', () => {
    const { container } = render(Code('npm install fiboui').inline().build());
    expect(container.querySelector('code.fibo-code-inline')?.textContent).toBe(
      'npm install fiboui'
    );
  });

  it('Break renders <br>', () => {
    const { container } = render(Break().build());
    expect(container.querySelector('br')).toBeTruthy();
  });
});

describe('Svg primitives', () => {
  it('composes Svg + Defs + filter + group + circle + ellipse', () => {
    const { container } = render(
      Svg()
        .viewBox('0 0 100 100')
        .label('Blob')
        .className('blob')
        .children([
          Defs().children([
            RadialGradient('fill')
              .cx('40%')
              .cy('30%')
              .r('70%')
              .stop('0%', '#333')
              .stop('100%', '#000'),
            SvgFilter('goo').blur(8).colorMatrix('1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8'),
          ]),
          SvgGroup()
            .filter('url(#goo)')
            .paint('url(#fill)')
            .children([Circle().cx(50).cy(50).r(20).fill('url(#fill)')]),
          Ellipse().cx(40).cy(36).rx(12).ry(8).paint('url(#fill)'),
        ])
        .build()
    );
    const svg = container.querySelector('svg.fibo-svg');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 100 100');
    expect(svg?.getAttribute('aria-label')).toBe('Blob');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(container.querySelector('radialGradient#fill')).toBeTruthy();
    expect(container.querySelector('filter#goo')).toBeTruthy();
    expect(container.querySelector('circle')).toBeTruthy();
    expect(container.querySelector('ellipse')).toBeTruthy();
  });
});
