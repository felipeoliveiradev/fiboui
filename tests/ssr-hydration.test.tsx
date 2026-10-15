import { createElement, isValidElement, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Column,
  FiboStyles,
  FiboThemeProvider,
  Grid,
  Header,
  Presence,
  Progress,
  Row,
  Router,
  Switch,
  Text,
  TextField,
  getStyleTag,
  signal,
} from '../src';
import { nextStableId, resetStableIds } from '../src/core/ids';
import { StyleManager } from '../src/core/styleManager';

function hydrationWarnings(spy: ReturnType<typeof vi.spyOn>): string[] {
  return spy.mock.calls
    .map((args) => args.map(String).join(' '))
    .filter((msg) =>
      /hydrat|did not match|Minified React error #418|#419|#423|unique key|each child/i.test(msg)
    );
}

async function hydrateAndCollect(html: string, tree: ReactElement): Promise<string[]> {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  let root: Root | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree);
  });
  const warnings = hydrationWarnings(spy);
  await act(async () => {
    root?.unmount();
  });
  container.remove();
  spy.mockRestore();
  return warnings;
}

describe('pseudo-state class names are content-hashed', () => {
  it('same hover rules get the same class after extra nextStableId calls', () => {
    resetStableIds();
    const { container: a } = render(
      Box()
        .id('a')
        .hover((h) => h.scale(1.05).translateY(-4))
        .children('a')
    );
    const classA = (a.querySelector('#a') as HTMLElement).className;
    const hashed = classA.split(/\s+/).filter((c) => c.startsWith('fibo-ps-'));
    expect(hashed.length).toBeGreaterThan(0);
    expect(classA).not.toMatch(/fibo-pseudo-\d+/);

    resetStableIds();
    nextStableId('noise');
    nextStableId('noise');
    const { container: b } = render(
      Box()
        .id('b')
        .hover((h) => h.scale(1.05).translateY(-4))
        .children('b')
    );
    const classB = (b.querySelector('#b') as HTMLElement).className;
    const hashedB = classB.split(/\s+/).filter((c) => c.startsWith('fibo-ps-'));
    expect(hashedB).toEqual(hashed);
  });

  it('getStyleTag after renderToString includes hover CSS', () => {
    const html = renderToString(
      Box()
        .hover((h) => h.scale(1.08))
        .id('ssr-hover')
        .children('x') as ReactElement
    );
    const tag = getStyleTag();
    expect(tag).toContain('id="fibo-dynamic-styles"');
    expect(tag).toMatch(/scale\(1\.08\)/);
    expect(html).toContain('ssr-hover');
  });
});

describe('list keys propagate to the FiboElement wrapper', () => {
  it('keyed builders expose a string key on the element and props', () => {
    const node = Box().key('item-7').id('k').children('k');
    expect(isValidElement(node)).toBe(true);
    expect(String((node as ReactElement).key)).toBe('item-7');
    expect(String((node as ReactElement).props.key)).toBe('item-7');
  });

  it('unkeyed Grid bento children do not share a fluent-function key', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      Grid()
        .variant('bento')
        .columns(4)
        .children([Text('A'), Text('B'), Text('C')])
    );
    const warnings = hydrationWarnings(spy);
    spy.mockRestore();
    expect(warnings).toEqual([]);
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('a mapped list with .key() does not warn', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const items = ['alpha', 'beta', 'gamma'].map((label) =>
      Card()
        .key(label)
        .hover((h) => h.scale(1.02))
        .children(label)
    );
    render(Column().id('list').children(items));
    const warnings = hydrationWarnings(spy);
    spy.mockRestore();
    expect(warnings).toEqual([]);
    expect(screen.getByText('alpha')).toBeTruthy();
  });
});

describe('SSR html hydrates without warnings', () => {
  afterEach(() => {
    StyleManager.resetForTests();
  });

  it('Box / Text / Button / Column / Header / Card / hover / responsive / Presence', async () => {
    const open = signal(true);
    const view = () =>
      createElement(
        'div',
        { id: 'ssr-root' },
        Column().children([
          Header().sticky().children(Text('Nav').variant('h2')),
          Text('Title').variant('h1').id('title'),
          Box()
            .id('hover-box')
            .hover((h) => h.scale(1.04))
            .press()
            .focusRing()
            .responsive({ mobile: { padding: 8 }, desktop: { padding: 24 } })
            .children('card'),
          Button('Go').id('go'),
          Card().key('c1').children('one'),
          Presence(open).enter('fadeIn').children(Box().id('panel').children('panel')),
        ]),
        createElement(FiboStyles)
      );

    const html = renderToString(view() as ReactElement);
    expect(html).toContain('Title');
    expect(html).toContain('fibo-ps-');
    expect(html).toMatch(/max-width:\s*767px|fibo-mq-/);

    const warnings = await hydrateAndCollect(html, view() as ReactElement);
    expect(warnings).toEqual([]);
  });

  it('hover class names match after a cold StyleManager (server vs client)', () => {
    const server = renderToString(
      Box()
        .id('srv')
        .hover((h) => h.scale(1.05).translateY(-2))
        .children('x') as ReactElement
    );
    const serverClass = /class="([^"]*srv[^"]*)"/.exec(server)?.[1] ?? server;
    const serverPs = (serverClass.match(/fibo-ps-[a-z0-9]+/g) ?? []).sort();

    StyleManager.resetForTests();
    resetStableIds();
    nextStableId('client-only');

    const client = renderToString(
      Box()
        .id('srv')
        .hover((h) => h.scale(1.05).translateY(-2))
        .children('x') as ReactElement
    );
    const clientClass = /class="([^"]*srv[^"]*)"/.exec(client)?.[1] ?? client;
    const clientPs = (clientClass.match(/fibo-ps-[a-z0-9]+/g) ?? []).sort();
    expect(clientPs).toEqual(serverPs);
    expect(serverPs.length).toBeGreaterThan(0);
  });

  it('.responsive() does not read window.innerWidth during render', () => {
    const spy = vi.spyOn(window, 'innerWidth', 'get');
    renderToString(
      Box()
        .responsive({ mobile: { padding: 8 }, desktop: { padding: 24 } })
        .children('x') as ReactElement
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('builder categories hydrate', () => {
  afterEach(() => {
    StyleManager.resetForTests();
  });

  const categories: Record<string, () => ReactElement> = {
    layout: () =>
      Column().children([
        Row().children([Text('row')]),
        Header().children(Text('head')),
      ]) as ReactElement,
    structure: () =>
      Grid()
        .columns(2)
        .children([
          Card().key('c').children('card'),
          Box().key('b').children('box'),
        ]) as ReactElement,
    content: () =>
      Column().children([
        Badge().text('New'),
        Alert().title('Note').description('Body'),
        Avatar().initials('AB').size(24),
        Progress().value(40).max(100),
      ]) as ReactElement,
    interactive: () =>
      Column().children([
        Button('Go'),
        TextField('typed').label('Name'),
        Checkbox().label('Ok').checked(false),
        Switch().label('On').checked(true),
      ]) as ReactElement,
    motion: () =>
      Box()
        .hover((h) => h.scale(1.03))
        .active((a) => a.opacity(0.8))
        .press()
        .focusRing()
        .animate('fadeIn')
        .children('motion') as ReactElement,
    theme: () =>
      createElement(FiboThemeProvider, {
        theme: 'material',
        children: Text('themed'),
      }),
  };

  for (const [name, view] of Object.entries(categories)) {
    it(`${name} renderToString hydrates without warnings`, async () => {
      const tree = () =>
        createElement('div', { id: `cat-${name}` }, view(), createElement(FiboStyles));
      const html = renderToString(tree());
      const warnings = await hydrateAndCollect(html, tree());
      expect(warnings).toEqual([]);
    });
  }
});

describe('Router first render is hydrate-safe', () => {
  it('does not read window.location during renderToString', () => {
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/other');
    const Home = () => createElement('div', null, 'home-route');
    const Other = () => createElement('div', null, 'other-route');
    const html = renderToString(
      createElement(Router, {
        initialPath: '/',
        routes: [
          { path: '/', component: Home },
          { path: '/other', component: Other },
        ],
      })
    );
    window.history.pushState({}, '', prev || '/');
    expect(html).toContain('home-route');
    expect(html).not.toContain('other-route');
  });
});

