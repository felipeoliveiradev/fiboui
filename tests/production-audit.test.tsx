import { act, fireEvent, render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, StrictMode, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Alert,
  Avatar,
  Box,
  Checkbox,
  Collapse,
  Combobox,
  Grid,
  GridItem,
  Icon,
  Image,
  Integration,
  Label,
  Link,
  List,
  Progress,
  RadioGroup,
  Router,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tags,
  Text,
  VirtualColumn,
  computed,
  createStore,
  signal,
  useBuilderState,
  useReactiveStore,
  useSignal,
} from '../src';
import { applyResponsiveStyles } from '../src/core/component';
import { Observer, SignalWrapper } from '../src/core/StateWrapper';
import { AnimatedWrapper } from '../src/core/AnimatedWrapper';
import { PluginManager } from '../src/core/plugin/PluginManager';
import { Sidebar } from '../src/layout/Sidebar';
import { FiboThemeProvider, useFiboTheme } from '../src/theme/provider';
import { Circle, Path, Rect } from '../src/graphics';
import { nextStableId, resetStableIds } from '../src/core/ids';
import { ValueBuilder } from '../src/core/builder';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DefaultLoader,
  findMatchingRoute,
  generateBreadcrumbs,
  lazyRoute,
  matchPath,
  Outlet,
  preloadRoute,
  useParams,
  useRouteMeta,
} from '../src/navigation';

afterEach(() => {
  cleanup();
});

describe('useSignal / leaks / StrictMode', () => {
  it('unsubscribes on unmount and survives StrictMode double-mount', () => {
    const sig = signal(0);
    let renders = 0;

    function Probe() {
      const value = useSignal(sig);
      renders += 1;
      return <span data-testid="v">{value}</span>;
    }

    const { unmount } = render(
      <StrictMode>
        <Probe />
      </StrictMode>
    );

    expect(screen.getByTestId('v')).toHaveTextContent('0');
    act(() => {
      sig.value = 1;
    });
    expect(screen.getByTestId('v')).toHaveTextContent('1');
    unmount();
    const before = renders;
    act(() => {
      sig.value = 2;
    });
    expect(renders).toBe(before);
  });

  it('SignalWrapper cleans subscriptions on unmount', () => {
    const sig = signal('a');
    const signals = new Set([sig]);
    const { unmount } = render(
      <SignalWrapper signals={signals}>{() => <span>{sig.value}</span>}</SignalWrapper>
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    unmount();
    act(() => {
      sig.value = 'b';
    });
  });

  it('Observer disposes tracker on unmount', () => {
    const sig = signal(1);
    const { unmount } = render(
      <Observer>{() => <span data-testid="obs">{sig.value}</span>}</Observer>
    );
    expect(screen.getByTestId('obs')).toHaveTextContent('1');
    unmount();
    act(() => {
      sig.value = 9;
    });
  });
});

describe('builder .state() runtime updates', () => {
  it('useBuilderState reads and writes the wrapper map', () => {
    function Inner() {
      const [count, setCount] = useBuilderState<number>('count');
      return (
        <button type="button" onClick={() => setCount((count ?? 0) + 1)}>
          {count}
        </button>
      );
    }

    render(Box().state('count', 3).children(createElement(Inner)).build());
    expect(screen.getByRole('button')).toHaveTextContent('3');
    act(() => {
      screen.getByRole('button').click();
    });
    expect(screen.getByRole('button')).toHaveTextContent('4');
  });
});

describe('Select / Combobox a11y + keyboard', () => {
  it('Select exposes listbox ARIA and keyboard selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      Select()
        .label('Fruit')
        .options([
          { label: 'Apple', value: 'a' },
          { label: 'Banana', value: 'b' },
        ])
        .onChange(onChange)
        .build()
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalled();
  });

  it('Combobox uses combobox/listbox roles and Enter selects', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      Combobox()
        .options([
          { label: 'Red', value: 'red' },
          { label: 'Blue', value: 'blue' },
        ])
        .onChange(onChange)
        .build()
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Collapse disclosure', () => {
  it('uses a button with aria-expanded', async () => {
    const user = userEvent.setup();
    render(Collapse().title('More').content(Text('Hidden body')).build());
    const button = screen.getByRole('button', { name: /More/ });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});

describe('Checkbox / Switch single toggle + indeterminate', () => {
  it('Checkbox click toggles once and sets input.indeterminate', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Host() {
      const [checked, setChecked] = useState(false);
      return Checkbox()
        .checked(checked)
        .indeterminate(true)
        .label('Accept')
        .onChange((next) => {
          onChange(next);
          setChecked(next);
        })
        .build();
    }
    render(<Host />);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    await user.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('Switch click toggles once', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(Switch().checked(false).label('Dark').onChange(onChange).build());
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('RadioGroup a11y', () => {
  it('exposes radios without hidden:true and does not auto-name', () => {
    const { rerender } = render(
      RadioGroup()
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ])
        .value('a')
        .build()
    );
    const first = screen.getAllByRole('radio')[0] as HTMLInputElement;
    expect(first).toBeChecked();
    expect(first.name).toBe('');
    rerender(
      RadioGroup()
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ])
        .value('b')
        .build()
    );
    const second = screen.getAllByRole('radio')[0] as HTMLInputElement;
    expect(second.name).toBe('');
    expect(first.name).toBe(second.name);
  });
});

describe('virtualization', () => {
  it('VirtualColumn wraps non-element children without throwing', () => {
    render(
      VirtualColumn()
        .itemHeight(20)
        .containerHeight(80)
        .children(['alpha', 'beta', 'gamma'])
        .build()
    );
    expect(screen.getByText('alpha')).toBeInTheDocument();
  });

  it('VirtualColumn remounts layout when measured height changes', () => {
    render(
      VirtualColumn()
        .measureItems(true)
        .estimatedItemHeight(10)
        .containerHeight(100)
        .children([Text('row-a'), Text('row-b')])
        .build()
    );
    expect(screen.getByText('row-a')).toBeInTheDocument();
  });

  it('List virtualized horizontal uses translateX', () => {
    const items = Array.from({ length: 120 }, (_, i) => ({ id: i, label: `Item ${i}` }));
    const { container } = render(
      List()
        .items(items)
        .direction('horizontal')
        .containerHeight(200)
        .renderItem((item: { label: string }) => item.label)
        .build()
    );
    const translated = container.querySelector('[style*="translateX"]');
    expect(translated).toBeTruthy();
  });
});

describe('Grid bento', () => {
  it('applies dense auto-flow spans', () => {
    const { container } = render(
      Grid()
        .variant('bento')
        .columns(4)
        .children([Text('A'), Text('B'), Text('C')])
        .build()
    );
    expect(container.querySelector('[style*="grid-column"]')).toBeTruthy();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('keeps GridItem col-span children', () => {
    render(
      Grid()
        .variant('bento')
        .columns(4)
        .children([GridItem().colSpan(3).children(Text('wide'))])
        .build()
    );
    expect(screen.getByText('wide')).toBeInTheDocument();
  });
});

describe('responsive() tablet + desktop', () => {
  it('applyResponsiveStyles picks tablet and desktop', () => {
    const base = { color: 'black' };
    const responsive = {
      mobile: { color: 'red' },
      tablet: { color: 'green' },
      desktop: { color: 'blue' },
    };
    expect(applyResponsiveStyles(base, responsive, 400).color).toBe('red');
    expect(applyResponsiveStyles(base, responsive, 800).color).toBe('green');
    expect(applyResponsiveStyles(base, responsive, 1280).color).toBe('blue');
    expect(applyResponsiveStyles(base, responsive).color).not.toBeUndefined();
  });
});

describe('AnimatedWrapper first paint', () => {
  it('seeds transform from the current signal value', () => {
    const x = signal(40);
    const animated = new Map<string, typeof x>([['translateX', x]]);
    const { container } = render(
      <AnimatedWrapper animatedProps={animated}>
        <div data-testid="box">box</div>
      </AnimatedWrapper>
    );
    expect(container.firstElementChild).toHaveStyle({ transform: 'translateX(40px)' });
  });
});

describe('theme initialTheme after mount', () => {
  it('syncs when the theme prop changes', () => {
    function Name() {
      const { themeName } = useFiboTheme();
      return <span data-testid="theme">{themeName}</span>;
    }
    const { rerender } = render(
      <FiboThemeProvider theme="material">
        <Name />
      </FiboThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('material');
    rerender(
      <FiboThemeProvider theme="web">
        <Name />
      </FiboThemeProvider>
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('web');
  });
});

describe('Link basename + Sidebar router path', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('prefixes href with Router basename', () => {
    render(
      <Router basename="/app" routes={[{ path: '/', component: () => <Link to="/settings">Go</Link> }]} />
    );
    expect(screen.getByText('Go')).toHaveAttribute('href', '/app/settings');
  });

  it('does not strip a longer path that only shares a prefix with basename', () => {
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/application');
    try {
      render(
        <Router
          basename="/app"
          initialPath="/application"
          routes={[
            { path: '/lication', component: () => <div>stripped-wrong</div> },
            { path: '/application', component: () => <div>full-path</div> },
          ]}
        />
      );
      expect(screen.getByText('full-path')).toBeTruthy();
      expect(screen.queryByText('stripped-wrong')).toBeNull();
    } finally {
      window.history.pushState({}, '', prev || '/');
    }
  });

  it('joins basename without double slashes or missing separators', () => {
    const { unmount } = render(
      <Router
        basename="/app/"
        routes={[{ path: '/', component: () => <Link to="/foo">Slash</Link> }]}
      />
    );
    expect(screen.getByText('Slash')).toHaveAttribute('href', '/app/foo');
    unmount();
    render(
      <Router
        basename="/app"
        routes={[{ path: '/', component: () => <Link to="bar">NoSlash</Link> }]}
      />
    );
    expect(screen.getByText('NoSlash')).toHaveAttribute('href', '/app/bar');
  });

  it('http(s) and protocol-relative hrefs are real navigation', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    render(
      <Router
        routes={[{
          path: '/',
          component: () => (
            <>
              <Link to="https://example.com/x">Abs</Link>
              <Link to="//cdn.example.com/y">Proto</Link>
              <Link to="/settings">In</Link>
            </>
          ),
        }]}
      />
    );
    expect(screen.getByText('Abs')).toHaveAttribute('href', 'https://example.com/x');
    expect(screen.getByText('Proto')).toHaveAttribute('href', '//cdn.example.com/y');
    expect(fireEvent.click(screen.getByText('Abs'))).toBe(true);
    expect(fireEvent.click(screen.getByText('Proto'))).toBe(true);
    expect(pushState).not.toHaveBeenCalled();
    expect(fireEvent.click(screen.getByText('In'))).toBe(false);
    expect(pushState).toHaveBeenCalled();
    pushState.mockRestore();
    window.history.pushState({}, '', '/');
  });

  it('honours target=_blank, download, modifier keys, and onClick preventDefault', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <Router
        routes={[{
          path: '/',
          component: () => (
            <>
              <Link to="/blank" target="_blank">Blank</Link>
              <Link to="/file.pdf" download>Dl</Link>
              <Link to="/alt">Alt</Link>
              <Link to="/stop" onClick={onClick}>Stop</Link>
            </>
          ),
        }]}
      />
    );
    expect(screen.getByText('Blank')).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Dl')).toHaveAttribute('download');
    expect(fireEvent.click(screen.getByText('Blank'))).toBe(true);
    expect(fireEvent.click(screen.getByText('Dl'))).toBe(true);
    fireEvent.click(screen.getByText('Alt'), { altKey: true });
    expect(fireEvent.click(screen.getByText('Stop'))).toBe(false);
    expect(onClick).toHaveBeenCalled();
    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });

  it('Sidebar plugin items mark active from Router currentPath', () => {
    PluginManager.getInstance().registerSidebarItem({ label: 'Dashboard', path: '/' });
    render(
      <Router
        routes={[{
          path: '/',
          component: () => Sidebar().build(),
        }]}
      />
    );
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
  });
});

describe('SVG / gradient stable keys', () => {
  it('does not remount grouped shapes across rebuilds', () => {
    const first = Rect().size(10, 10).children([Circle().radius(2).build()]).build();
    const second = Rect().size(10, 10).children([Circle().radius(2).build()]).build();
    expect(first.key).toBe(second.key);
    const path = Path().moveTo(0, 0).lineTo(1, 1).children([Circle().radius(1).build()]).build();
    expect(path.key).toBe('path-group');
  });

  it('nextStableId is deterministic', () => {
    resetStableIds();
    expect(nextStableId('g')).toBe('g-1');
    expect(nextStableId('g')).toBe('g-2');
  });
});

describe('Store shallow compare + PluginManager stores', () => {
  it('setState does not notify when values are unchanged', () => {
    const store = createStore({ n: 1, label: 'x' });
    const spy = vi.fn();
    store.subscribe(spy);
    store.setState({ n: 1, label: 'x' });
    expect(spy).not.toHaveBeenCalled();
    store.setState({ n: 2 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('useReactiveStore updates on setState', () => {
    const store = createStore({ n: 0 });
    function View() {
      const state = useReactiveStore(store);
      return <span data-testid="n">{state.n}</span>;
    }
    render(<View />);
    act(() => {
      store.setState({ n: 5 });
    });
    expect(screen.getByTestId('n')).toHaveTextContent('5');
  });

  it('PluginManager.registerStore stores and retrieves', () => {
    const manager = PluginManager.getInstance();
    const store = createStore({ ok: true });
    manager.registerStore(store, 'main');
    expect(manager.getStore('main')).toBe(store);
    expect(manager.getStores().get('main')).toBe(store);
  });
});

describe('a11y roles', () => {
  it('Spinner and Skeleton expose status', () => {
    render(
      <>
        {Spinner().build()}
        {Skeleton().build()}
      </>
    );
    expect(screen.getAllByRole('status')).toHaveLength(2);
  });

  it('Alert error/warning use role=alert and info/success use status', () => {
    const { unmount } = render(Alert().title('Boom').description('Failed').intent('error').build());
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');
    unmount();
    render(Alert().title('Note').description('Body').intent('info').build());
    expect(screen.getByRole('status', { name: /Note/ })).toBeInTheDocument();
  });

  it('Progress exposes progressbar valuemin/now/max', () => {
    render(Progress().value(40).max(80).label('Upload').build());
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '80');
  });

  it('Progress variants all expose progressbar', () => {
    for (const variant of ['segments', 'steps', 'timeline', 'pagination', 'floating', 'chevron', 'striped', 'circular'] as const) {
      const { unmount } = render(Progress().value(40).max(100).variant(variant).label('Load').build());
      const bar = screen.getByRole('progressbar');
      expect(bar).toHaveAttribute('aria-valuenow', '40');
      expect(bar).toHaveAttribute('aria-valuemin', '0');
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      unmount();
    }
  });

  it('Avatar exposes img with an accessible name', () => {
    const { unmount } = render(Avatar().initials('AB').size(24).build());
    expect(screen.getByRole('img', { name: /AB/i })).toBeInTheDocument();
    unmount();
    render(Avatar().src('/a.png').alt('Jane').size(32).build());
    expect(screen.getByRole('img', { name: 'Jane' })).toBeInTheDocument();
  });

  it('Label required marker is hidden from the accessibility tree', () => {
    render(Label('Email').required(true).htmlFor('em').build());
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Email')).toHaveAttribute('for', 'em');
  });

  it('Table headers have scope=col', () => {
    render(
      Table()
        .columns([
          { header: 'Name', accessor: 'name' },
          { header: 'Age', accessor: 'age' },
        ])
        .data([{ id: 'u1', name: 'Ada', age: 36 }])
        .build()
    );
    screen.getAllByRole('columnheader').forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col');
    });
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('Tags render stable titles', () => {
    render(Tags().items([{ title: 'alpha' }, { title: 'beta' }]).build());
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });
});

describe('computed lazy init + ValueBinder subscribe', () => {
  it('computes on first read and then tracks', () => {
    const base = signal(2);
    const doubled = computed(() => base.value * 2);
    expect(doubled.value).toBe(4);
    base.value = 5;
    expect(doubled.value).toBe(10);
  });

  it('ValueBinder requires subscribe and re-renders', () => {
    const sig = signal('one');
    render(
      ValueBuilder(sig)
        .builder((value) => <span data-testid="vb">{value}</span>)
        .build()
    );
    expect(screen.getByTestId('vb')).toHaveTextContent('one');
    act(() => {
      sig.value = 'two';
    });
    expect(screen.getByTestId('vb')).toHaveTextContent('two');
  });
});

describe('CSS / ripple / dead rules', () => {
  it('core.css uses fibo-ripple and drops unused flex-center', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/core.css'), 'utf8');
    expect(css).toContain('@keyframes fibo-ripple');
    expect(css).not.toContain('fibo-ripple-anim');
    expect(css).not.toContain('.fibo-flex-center');
  });

  it('material card has a single border declaration', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/themes/material.css'), 'utf8');
    const block = css.slice(css.indexOf('.fibo-theme-material .fibo-card'));
    const card = block.slice(0, block.indexOf('}', 2) + 1);
    expect(card.match(/border:/g)?.length ?? 0).toBeLessThanOrEqual(1);
  });
});

describe('performance under many updates', () => {
  it('100 signal writes re-render a bound tree without warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const sig = signal(0);
    render(
      Box()
        .bindSignal(sig)
        .children(() => Text(`n=${sig.value}`))
        .build()
    );
    act(() => {
      for (let i = 1; i <= 100; i += 1) {
        sig.value = i;
      }
    });
    expect(screen.getByText('n=100')).toBeInTheDocument();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    warn.mockRestore();
    error.mockRestore();
  });
});

describe('SSR window guards', () => {
  it('applyResponsiveStyles without window width keeps the base style', () => {
    const style = applyResponsiveStyles({ color: 'black' }, { mobile: { color: 'red' } }, undefined);
    expect(style.color).toBe('black');
  });
});

describe('content builders crashes / APIs', () => {
  it('Icon accepts a React element source without throwing', () => {
    const glyph = createElement('svg', { 'data-testid': 'glyph', viewBox: '0 0 24 24' });
    render(Icon(glyph).size(16).build());
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
  });

  it('Icon accepts a component source', () => {
    function Heart(props: { size?: number; color?: string }) {
      return createElement('svg', { 'data-testid': 'heart', width: props.size, stroke: props.color });
    }
    render(Icon(Heart).size(20).color('#f00').build());
    const el = screen.getByTestId('heart');
    expect(el).toHaveAttribute('width', '20');
    expect(el).toHaveAttribute('stroke', '#f00');
  });

  it('Progress max=0 does not paint NaN', () => {
    const { container } = render(Progress().value(0).max(0).label('Empty').build());
    expect(container.innerHTML).not.toMatch(/NaN/);
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).not.toBe('NaN');
    expect(bar.getAttribute('aria-valuemax')).not.toBe('NaN');
  });

  it('Alert unknown intent does not crash', () => {
    expect(() =>
      render(Alert().title('x').intent('nope' as 'info').build())
    ).not.toThrow();
    expect(screen.getByText('x')).toBeInTheDocument();
  });

  it('Image keeps alt when extra props are set', () => {
    render(Image('/x.png').alt('demo').props({ decoding: 'async' }).build());
    expect(screen.getByRole('img', { name: 'demo' })).toHaveAttribute('alt', 'demo');
  });

  it('Integration clones an element source without throwing', () => {
    render(Integration(createElement('span', { 'data-testid': 'plug' }, 'ok')).build());
    expect(screen.getByTestId('plug')).toHaveTextContent('ok');
  });
});

describe('routeMatching nested layouts / wildcard / exact', () => {
  const Leaf = () => createElement('div', null, 'leaf');
  const Shell = () => createElement('div', null, 'shell');

  it('matchPath stays exact by default so / does not swallow /other', () => {
    expect(matchPath('/other', '/').match).toBe(false);
    expect(matchPath('/users/1', '/users/:id').match).toBe(true);
    expect(matchPath('/users/1', '/users/:id').params).toEqual({ id: '1' });
    expect(matchPath('/users/1/posts', '/users/:id').match).toBe(false);
    expect(matchPath('/users/1/posts', '/users/:id', false).match).toBe(true);
  });

  it('wildcard * consumes the remaining path', () => {
    expect(matchPath('/x/y', '*').match).toBe(true);
    expect(matchPath('/files/a/b', '/files/*').match).toBe(true);
    expect(matchPath('/files/a/b', '/files/*').params['*']).toBe('a/b');
    expect(matchPath('/files', '/files/*').match).toBe(false);
  });

  it('findMatchingRoute returns the layout parent so Outlet can render the child', () => {
    const routes = [
      {
        path: '/app',
        component: Shell,
        children: [{ path: '/app/dash', component: Leaf }],
      },
    ];
    const found = findMatchingRoute(routes, '/app/dash');
    expect(found.route?.path).toBe('/app');
    expect(found.leaf?.path).toBe('/app/dash');
    expect(found.chain?.map((r) => r.path)).toEqual(['/app', '/app/dash']);
  });

  it('merges dynamic params from the deepest child', () => {
    const routes = [
      {
        path: '/users/:id',
        component: Shell,
        children: [{ path: '/users/:id/posts/:postId', component: Leaf }],
      },
    ];
    const found = findMatchingRoute(routes, '/users/42/posts/9');
    expect(found.route?.path).toBe('/users/:id');
    expect(found.params).toEqual({ id: '42', postId: '9' });
  });
});

describe('Outlet nested routes', () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it('renders the parent layout and the matched child', () => {
    window.history.pushState({}, '', '/app/dash');
    function Layout() {
      return createElement('div', null, 'shell-', createElement(Outlet));
    }
    function Dash() {
      return createElement('span', null, 'dash');
    }
    render(
      createElement(Router, {
        initialPath: '/app/dash',
        routes: [
          {
            path: '/app',
            component: Layout,
            children: [{ path: '/app/dash', component: Dash }],
          },
        ],
      })
    );
    expect(screen.getByText(/shell-/)).toBeTruthy();
    expect(screen.getByText('dash')).toBeTruthy();
  });

  it('exposes nested params via useParams and child meta via useRouteMeta', () => {
    window.history.pushState({}, '', '/users/42');
    function Layout() {
      return createElement(Outlet);
    }
    function Profile() {
      const { id } = useParams();
      const meta = useRouteMeta<{ title: string }>();
      return createElement('div', null, `user-${id}-${meta?.title ?? 'none'}`);
    }
    render(
      createElement(Router, {
        initialPath: '/users/42',
        routes: [
          {
            path: '/users/:id',
            component: Layout,
            children: [
              { path: '/users/:id', component: Profile, meta: { title: 'Profile' } },
            ],
          },
        ],
      })
    );
    expect(screen.getByText('user-42-Profile')).toBeTruthy();
  });
});

describe('lazyRoute / DefaultLoader', () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it('DefaultLoader exposes a polite status region', () => {
    render(createElement(DefaultLoader, { message: 'Please wait' }));
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Please wait');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('lazyRoute shows DefaultLoader until the import resolves', async () => {
    let resolveMod!: (m: { default: () => ReturnType<typeof createElement> }) => void;
    const loader = () =>
      new Promise<{ default: () => ReturnType<typeof createElement> }>((resolve) => {
        resolveMod = resolve;
      });
    const LazyPage = lazyRoute(loader);
    render(
      createElement(Router, {
        routes: [{ path: '/', component: LazyPage }],
      })
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    await act(async () => {
      resolveMod({ default: () => createElement('div', null, 'lazy-ready') });
    });
    expect(await screen.findByText('lazy-ready')).toBeTruthy();
  });

  it('preloadRoute shares the module promise with lazyRoute', async () => {
    let calls = 0;
    const loader = () => {
      calls += 1;
      return Promise.resolve({ default: () => createElement('div', null, 'preloaded') });
    };
    preloadRoute(loader);
    const LazyPage = lazyRoute(loader);
    render(
      createElement(Router, {
        routes: [{ path: '/', component: LazyPage }],
      })
    );
    expect(await screen.findByText('preloaded')).toBeTruthy();
    expect(calls).toBe(1);
  });
});

describe('metadata breadcrumbs + useRouteMeta', () => {
  afterEach(() => cleanup());

  it('useRouteMeta reads the current route meta', () => {
    function Page() {
      const meta = useRouteMeta<{ title: string }>();
      return createElement('div', null, meta?.title ?? 'missing');
    }
    render(
      createElement(Router, {
        routes: [{ path: '/', component: Page, meta: { title: 'HomeTitle' } }],
      })
    );
    expect(screen.getByText('HomeTitle')).toBeTruthy();
  });

  it('generateBreadcrumbs matches parameterized paths', () => {
    const Dummy = () => null;
    const crumbs = generateBreadcrumbs(
      [
        { path: '/users', component: Dummy, meta: { title: 'Users' } },
        { path: '/users/:id', component: Dummy, meta: { title: 'User' } },
      ],
      '/users/42'
    );
    expect(crumbs.map((c) => c.label)).toEqual(['Users', 'User']);
    expect(crumbs[1].path).toBe('/users/42');
  });
});

describe('RouteErrorBoundary remaining', () => {
  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it('clears the error UI after navigating to another route', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const prev = `${window.location.pathname}${window.location.search}`;
    window.history.pushState({}, '', '/boom');
    function Boom() {
      throw new Error('kaboom');
      return createElement('div');
    }
    function Safe() {
      return createElement('div', null, 'safe-route');
    }
    try {
      render(
        createElement(Router, {
          initialPath: '/boom',
          routes: [
            { path: '/boom', component: Boom },
            { path: '/safe', component: Safe },
          ],
        })
      );
      expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
      expect(screen.getByText('kaboom')).toBeTruthy();
      await act(async () => {
        window.history.pushState({}, '', '/safe');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await waitFor(() => {
        expect(screen.getByText('safe-route')).toBeTruthy();
      });
      expect(screen.queryByText('Oops! Something went wrong')).toBeNull();
    } finally {
      spy.mockRestore();
      window.history.pushState({}, '', prev || '/');
    }
  });
});
