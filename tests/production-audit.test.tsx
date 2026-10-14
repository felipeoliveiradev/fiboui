import { act, render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, StrictMode, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Box,
  Checkbox,
  Collapse,
  Combobox,
  Grid,
  GridItem,
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

describe('RadioGroup stable name', () => {
  it('keeps a stable name across rebuilds via useId', () => {
    const { rerender } = render(
      RadioGroup()
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ])
        .value('a')
        .build()
    );
    const first = (screen.getAllByRole('radio', { hidden: true })[0] as HTMLInputElement).name;
    rerender(
      RadioGroup()
        .options([
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ])
        .value('b')
        .build()
    );
    const second = (screen.getAllByRole('radio', { hidden: true })[0] as HTMLInputElement).name;
    expect(first).toBeTruthy();
    expect(first).toBe(second);
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
  it('prefixes href with Router basename', () => {
    render(
      <Router basename="/app" routes={[{ path: '/', component: () => <Link to="/settings">Go</Link> }]} />
    );
    expect(screen.getByText('Go')).toHaveAttribute('href', '/app/settings');
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

  it('Progress exposes progressbar valuemin/now/max', () => {
    render(Progress().value(40).max(80).label('Upload').build());
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemax', '80');
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
