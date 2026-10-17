import { createElement, isValidElement, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  endSsrRequest,
  getCss,
  getStyleTag,
  signal,
} from '../src';
import { confirmLeave, DefaultErrorPage, DefaultLoader, requireAuth, requireRole, RouteErrorBoundary, RouterContext, setDocumentTitle } from '../src/navigation';
import { nextStableId, resetStableIds } from '../src/core/ids';
import { StyleManager } from '../src/core/styleManager';
import { App as SsrFixtureApp } from '../examples/ssr-fixtures/shared/App';
import {
  AnimatedWrapper,
  Presence as PresenceShim,
  Reveal,
  ScrollProgress,
  ValueBinder,
  bindScrollProgress,
} from '../src/server-shims/passthrough';
import { FineGrainText, bindText } from '../src/server-shims/FineGrain';
import { Observer, SignalWrapper, StateWrapper, useBuilderState } from '../src/server-shims/StateWrapper';
import { createPage, page as rscPage } from '../src/server-entry';
import { isBuildable } from '../src/core/children';

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

  it('runs beforeEnter on the initial client match', async () => {
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/secret');
    const Secret = () => createElement('div', null, 'secret-ok');
    const Login = () => createElement('div', null, 'login-gate');
    try {
      render(
        createElement(Router, {
          initialPath: '/secret',
          routes: [
            { path: '/login', component: Login },
            { path: '/secret', component: Secret, beforeEnter: () => '/login' },
          ],
        })
      );
      await waitFor(() => {
        expect(screen.getByText('login-gate')).toBeTruthy();
      });
    } finally {
      cleanup();
      window.history.pushState({}, '', prev || '/');
    }
  });

  it('runs beforeEnter on the nested leaf, not only the layout parent', async () => {
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/app/secret');
    const Login = () => createElement('div', null, 'login-nested');
    const Shell = () => createElement('div', null, 'shell-ok');
    const Secret = () => createElement('div', null, 'secret-nested');
    try {
      render(
        createElement(Router, {
          initialPath: '/app/secret',
          routes: [
            { path: '/login', component: Login },
            {
              path: '/app',
              component: Shell,
              children: [
                { path: '/app/secret', component: Secret, beforeEnter: () => '/login' },
              ],
            },
          ],
        })
      );
      await waitFor(() => {
        expect(screen.getByText('login-nested')).toBeTruthy();
      });
      expect(screen.queryByText('secret-nested')).toBeNull();
    } finally {
      cleanup();
      window.history.pushState({}, '', prev || '/');
    }
  });

  it('runs beforeEnter on popstate', async () => {
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/login');
    const Secret = () => createElement('div', null, 'secret-pop');
    const Login = () => createElement('div', null, 'login-pop');
    try {
      render(
        createElement(Router, {
          initialPath: '/login',
          routes: [
            { path: '/login', component: Login },
            { path: '/secret', component: Secret, beforeEnter: () => '/login' },
          ],
        })
      );
      expect(screen.getByText('login-pop')).toBeTruthy();
      await act(async () => {
        window.history.pushState({}, '', '/secret');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await waitFor(() => {
        expect(screen.queryByText('secret-pop')).toBeNull();
        expect(screen.getByText('login-pop')).toBeTruthy();
      });
    } finally {
      cleanup();
      window.history.pushState({}, '', prev || '/');
    }
  });

  it('hides the route when initial beforeEnter returns false', async () => {
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/secret');
    const Secret = () => createElement('div', null, 'secret-blocked');
    try {
      render(
        createElement(Router, {
          initialPath: '/secret',
          fallback: () => createElement('div', null, 'blocked-fallback'),
          routes: [
            { path: '/secret', component: Secret, beforeEnter: () => false },
          ],
        })
      );
      await waitFor(() => {
        expect(screen.queryByText('secret-blocked')).toBeNull();
        expect(screen.getByText('blocked-fallback')).toBeTruthy();
      });
    } finally {
      cleanup();
      window.history.pushState({}, '', prev || '/');
    }
  });
});

describe('DefaultLoader SSR', () => {
  it('renderToString does not throw and emits the message', () => {
    const html = renderToString(createElement(DefaultLoader, { message: 'Hydrate load' }));
    expect(html).toContain('Hydrate load');
    expect(html).toContain('role="status"');
  });
});

describe('DefaultErrorPage SSR', () => {
  it('emits alert role, error message, and Try Again', () => {
    const html = renderToString(createElement(DefaultErrorPage, { error: new Error('ssr-boom') }));
    expect(html).toContain('ssr-boom');
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="assertive"');
    expect(html).toContain('Try Again');
    expect(html).toContain('href="/"');
  });

  it('Go Home href includes Router basename', () => {
    const html = renderToString(
      createElement(
        RouterContext.Provider,
        {
          value: {
            currentPath: '/crash',
            basename: '/app',
            navigate: () => undefined,
            goBack: () => undefined,
            replace: () => undefined,
            params: {},
            query: new URLSearchParams(),
            hash: '',
          },
        },
        createElement(DefaultErrorPage, { error: new Error('ssr-boom') })
      )
    );
    expect(html).toContain('href="/app"');
    expect(html).not.toContain('href="/"');
  });
});

function withUndefinedDocument<T>(fn: () => T): T {
  const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: undefined });
  try {
    return fn();
  } finally {
    if (desc) Object.defineProperty(globalThis, 'document', desc);
  }
}

describe('FiboStyles SSR request isolation', () => {
  afterEach(() => {
    StyleManager.resetForTests();
  });

  it('resets StyleManager after emit so request B does not inherit request A classes', () => {
    renderToString(
      Box()
        .id('req-a')
        .hover((h) => h.scale(1.17))
        .children('a') as ReactElement
    );
    expect(getCss()).toMatch(/scale\(1\.17\)/);

    const tagA = withUndefinedDocument(() => FiboStyles());
    const cssA = (tagA.props as { dangerouslySetInnerHTML: { __html: string } })
      .dangerouslySetInnerHTML.__html;
    expect(cssA).toMatch(/scale\(1\.17\)/);
    expect(getCss()).not.toMatch(/scale\(1\.17\)/);

    renderToString(
      Box()
        .id('req-b')
        .hover((h) => h.opacity(0.42))
        .children('b') as ReactElement
    );
    const tagB = withUndefinedDocument(() => FiboStyles());
    const cssB = (tagB.props as { dangerouslySetInnerHTML: { __html: string } })
      .dangerouslySetInnerHTML.__html;
    expect(cssB).toMatch(/opacity:\s*0\.42|opacity:0\.42/);
    expect(cssB).not.toMatch(/scale\(1\.17\)/);
  });

  it('endSsrRequest clears collected rules', () => {
    renderToString(
      Box()
        .hover((h) => h.scale(1.19))
        .children('x') as ReactElement
    );
    expect(getCss()).toMatch(/scale\(1\.19\)/);
    endSsrRequest();
    expect(getCss()).not.toMatch(/scale\(1\.19\)/);
  });
});

describe('RouteErrorBoundary default fallback', () => {
  afterEach(() => cleanup());

  it('DefaultErrorPage receives the error and Try again resets', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let explode = true;
    function Flaky() {
      if (explode) throw new Error('once-only');
      return createElement('div', null, 'recovered');
    }
    render(
      createElement(RouteErrorBoundary, {
        fallback: createElement(DefaultErrorPage),
        children: createElement(Flaky),
      })
    );
    expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
    expect(screen.getByText('once-only')).toBeTruthy();
    explode = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByText('recovered')).toBeTruthy();
    spy.mockRestore();
  });
});

describe('SSR window / document / localStorage guards', () => {
  it('requireAuth / requireRole do not throw without localStorage', () => {
    const ls = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: undefined });
    try {
      expect(requireAuth('/login')({ path: '/x', component: () => null }, null)).toBe('/login');
      expect(requireRole('admin')({ path: '/x', component: () => null }, null)).toBe('/unauthorized');
    } finally {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: ls });
    }
  });

  it('confirmLeave does not throw without window.confirm', () => {
    const desc = Object.getOwnPropertyDescriptor(window, 'confirm');
    Object.defineProperty(window, 'confirm', { configurable: true, value: undefined });
    try {
      expect(confirmLeave('leave?')({ path: '/x', component: () => null }, null)).toBe(true);
    } finally {
      if (desc) Object.defineProperty(window, 'confirm', desc);
    }
  });

  it('setDocumentTitle is a no-op without document', () => {
    expect(() =>
      withUndefinedDocument(() =>
        setDocumentTitle({ path: '/', component: () => null, meta: { title: 'Hi' } })
      )
    ).not.toThrow();
  });
});

describe('SSR fixture App hydrates', () => {
  afterEach(() => {
    StyleManager.resetForTests();
  });

  it('shared Vite/Next tree hydrates without warnings', async () => {
    const tree = () =>
      createElement('div', { id: 'fixture-wrap' }, createElement(SsrFixtureApp), createElement(FiboStyles));
    const html = renderToString(tree());
    expect(html).toContain('Hydration audit');
    expect(html).toContain('fibo-ps-');
    const warnings = await hydrateAndCollect(html, tree());
    expect(warnings).toEqual([]);
  });
});

describe('RSC shims match first paint', () => {
  it('ValueBinder renders builder(signal.value) instead of null', () => {
    const html = renderToString(
      createElement(ValueBinder, {
        signal: { value: 'bound-hi' },
        builder: (v: unknown) => createElement('span', { id: 'bound' }, String(v)),
      })
    );
    expect(html).toContain('bound-hi');
  });

  it('Reveal emits the same wrapper the client first-paints', () => {
    const html = renderToString(
      createElement(Reveal, { preset: 'fadeIn', children: 'revealed' })
    );
    expect(html).toContain('data-fibo-reveal');
    expect(html).toContain('fibo-reveal-fadeIn');
    expect(html).toContain('revealed');
  });

  it('ScrollProgress wraps with display:contents host', () => {
    const html = renderToString(
      createElement(ScrollProgress, {
        children: createElement('div', { id: 'bar' }, 'p'),
      })
    );
    expect(html).toContain('data-fibo-scroll-progress');
    expect(html).toContain('bar');
  });

  it('AnimatedWrapper applies current signal values', () => {
    const animatedProps = new Map<string, { value: unknown }>([['scale', { value: 1.2 }]]);
    const html = renderToString(
      createElement(AnimatedWrapper, {
        animatedProps,
        children: createElement('div', { id: 'anim' }, 'x') as any,
      })
    );
    expect(html).toMatch(/scale\(1\.2\)/);
  });

  it('StateWrapper passthrough does not throw useBuilderState', () => {
    function Child() {
      const [v] = useBuilderState<string>('k');
      return createElement('span', { id: 'st' }, v ?? 'none');
    }
    const html = renderToString(
      createElement(StateWrapper, { children: createElement(Child) })
    );
    expect(html).toContain('none');
  });
});

describe('createPage / RSC server-entry', () => {
  afterEach(() => {
    StyleManager.resetForTests();
  });

  it('createPage is an alias of page and emits tree + FiboStyles', () => {
    expect(createPage).toBe(rscPage);
    const Page = createPage(() => Column().children([Text('Hello RSC')]));
    const html = renderToString(createElement(Page));
    expect(html).toContain('Hello RSC');
    expect(html).toContain('fibo-dynamic-styles');
  });

  it('createPage assembles a builder returned by the fixture App (Flight-safe keys)', () => {
    const tree = SsrFixtureApp();
    expect(isBuildable(tree)).toBe(true);
    const Page = createPage(() => tree);
    const html = renderToString(createElement(Page));
    expect(html).toContain('Hydration audit');
    expect(html).toContain('ssr-root');
    expect(html).toContain('fibo-dynamic-styles');
    const assembled = tree.build();
    expect(isValidElement(assembled)).toBe(true);
    expect(typeof (assembled as ReactElement).key === 'function').toBe(false);
  });
});

describe('RSC shims leftover islands', () => {
  it('FineGrainText renders compute() into the host tag (not an empty fragment)', () => {
    const html = renderToString(
      createElement(FineGrainText, { compute: () => 'grain-hi', as: 'strong' })
    );
    expect(html).toContain('grain-hi');
    expect(html).toContain('<strong');
    expect(html).not.toEqual('<!-- -->');
  });

  it('bindText reads signal.value on the server', () => {
    const html = renderToString(bindText({ value: 'bound-text' }, 'em') as ReactElement);
    expect(html).toContain('bound-text');
    expect(html).toContain('<em');
  });

  it('Presence fluent factory hides when show is false and paints children when true', () => {
    const shown = PresenceShim({ value: true } as { value: unknown })
      .enter('fadeIn')
      .children(createElement('span', { id: 'shown' }, 'panel-on'));
    const hidden = PresenceShim(false).enter('fadeIn').children(createElement('span', { id: 'hid' }, 'panel-off'));
    expect(renderToString(shown as ReactElement)).toContain('panel-on');
    expect(renderToString(hidden as ReactElement)).not.toContain('panel-off');
  });

  it('Presence component props still work (createElement)', () => {
    const html = renderToString(
      createElement(PresenceShim as any, {
        show: { value: true },
        children: createElement('span', { id: 'p' }, 'via-props'),
      })
    );
    expect(html).toContain('via-props');
  });

  it('bindScrollProgress is a document-free no-op', () => {
    expect(typeof bindScrollProgress).toBe('function');
    const stop = withUndefinedDocument(() => bindScrollProgress(null));
    expect(typeof stop).toBe('function');
    expect(() => stop()).not.toThrow();
  });

  it('FineGrainText / Presence shims do not read document', () => {
    const html = withUndefinedDocument(() =>
      renderToString(createElement(FineGrainText, { compute: () => 'no-doc', as: 'p' }))
    );
    expect(html).toContain('no-doc');
  });

  it('Observer / SignalWrapper accept element children without throwing', () => {
    const obs = renderToString(
      createElement(Observer, { children: createElement('span', null, 'obs-el') as any })
    );
    expect(obs).toContain('obs-el');
    const sig = renderToString(
      createElement(SignalWrapper, { children: createElement('span', null, 'sig-el') as any })
    );
    expect(sig).toContain('sig-el');
  });
});
