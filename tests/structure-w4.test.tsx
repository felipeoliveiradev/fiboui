import { type ReactElement } from 'react';
import { isValidElement } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Banner,
  Box,
  Grid,
  GridItem,
  Text,
} from '../src';
import { AssetCard } from '../src/structure/cards/AssetCard';
import { CollectionCard } from '../src/structure/cards/CollectionCard';
import { InputCard } from '../src/structure/cards/variants';

afterEach(cleanup);

function keyWarnings(spy: { mock: { calls: unknown[][] } }): string[] {
  return spy.mock.calls
    .map((args) => args.map(String).join(' '))
    .filter((msg) => /unique key|each child|functions cannot be passed/i.test(msg));
}

describe('Grid crash / empty', () => {
  it('renders with no children', () => {
    expect(() => render(Grid().build())).not.toThrow();
    expect(() => render(GridItem().build())).not.toThrow();
  });

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo').build();
    expect(() => render(Grid().props({ children: el }).build())).not.toThrow();
    expect(() =>
      render(Grid().variant('bento').props({ children: el }).build())
    ).not.toThrow();
    expect(screen.getAllByText('solo').length).toBeGreaterThan(0);
  });

  it('renderToString without window', () => {
    expect(() =>
      renderToString(Grid().columns(2).children([Text('a'), Text('b')]).build() as ReactElement)
    ).not.toThrow();
    expect(() =>
      renderToString(
        Grid().variant('bento').columns(4).children([Text('a'), Text('b')]).build() as ReactElement
      )
    ).not.toThrow();
    expect(() =>
      renderToString(GridItem().colSpan(2).children(Text('wide')).build() as ReactElement)
    ).not.toThrow();
  });
});

describe('Grid columns + GridItem span (not Tailwind JIT)', () => {
  it('columns(3) sets display grid and repeat(3) template', () => {
    const { container } = render(
      Grid()
        .columns(3)
        .gap('md')
        .children([Text('a'), Text('b'), Text('c')])
        .build()
    );
    const grid = container.querySelector('.fibo-grid') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.style.display).toBe('grid');
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(3/);
  });

  it('GridItem.colSpan(2) sets grid-column span (item is not missing)', () => {
    const { container } = render(
      Grid()
        .columns(4)
        .children([
          GridItem().colSpan(2).children(Text('wide')),
          Text('rest'),
        ])
        .build()
    );
    const item = container.querySelector('.fibo-grid-item') as HTMLElement;
    expect(item).toBeTruthy();
    expect(item.style.gridColumn).toMatch(/span 2/);
    expect(screen.getByText('wide')).toBeInTheDocument();
  });

  it('responsive columns register CSS media classes', () => {
    const { container } = render(
      Grid()
        .columns({ sm: 1, md: 2, lg: 3 })
        .children(Text('cell'))
        .build()
    );
    const grid = container.querySelector('.fibo-grid') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.className).toMatch(/fibo-mq-/);
  });
});

describe('Grid SSR keys', () => {
  it('unkeyed masonry children do not warn', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      Grid()
        .variant('masonry')
        .columns(2)
        .children([Text('A'), Text('B'), Text('C')])
        .build()
    );
    const warnings = keyWarnings(spy);
    spy.mockRestore();
    expect(warnings).toEqual([]);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('unkeyed GridItem children do not warn', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      Grid()
        .columns(2)
        .children([
          GridItem().children(Text('one')),
          GridItem().children(Text('two')),
        ])
        .build()
    );
    const warnings = keyWarnings(spy);
    spy.mockRestore();
    expect(warnings).toEqual([]);
  });
});

describe('InputCard .type()', () => {
  it('type(email) sets the HTML input type without .build()', () => {
    const node = InputCard().type('email').placeholder('E');
    expect(isValidElement(node)).toBe(true);
    render(node);
    expect(screen.getByPlaceholderText('E')).toHaveAttribute('type', 'email');
  });

  it('defaults to text', () => {
    render(InputCard().placeholder('Name').build());
    expect(screen.getByPlaceholderText('Name')).toHaveAttribute('type', 'text');
  });
});

describe('card image alt', () => {
  it('AssetCard image uses the title as alt', () => {
    render(AssetCard().image('/asset.png').title('Cosmic').price('1').likes('0').build());
    expect(screen.getByRole('img', { name: 'Cosmic' })).toHaveAttribute('alt', 'Cosmic');
  });

  it('CollectionCard image uses the title as alt', () => {
    render(
      CollectionCard()
        .image('/col.png')
        .title('Visions')
        .author('Ada')
        .items('12')
        .build()
    );
    expect(screen.getByRole('img', { name: 'Visions' })).toHaveAttribute('alt', 'Visions');
  });
});

describe('Banner leftover', () => {
  it('announces title and subtitle together', () => {
    render(Banner('Boom').status('error').subtitle('try again').build());
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-atomic', 'true');
    expect(alert).toHaveTextContent('Boom');
    expect(alert).toHaveTextContent('try again');
  });

  it('empty Box child in Grid does not throw', () => {
    expect(() => render(Grid().children([Box().build()]).build())).not.toThrow();
  });
});
