import { createElement, isValidElement, StrictMode, type ReactElement, type ReactNode } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { Button, Column, Row, Text, Box, Form, GridItem, Outlet, Router, listSignal, mount, toElement } from '../src';

function Slot({ child }: { child: ReactNode }) {
  return <div data-testid="slot">{child}</div>;
}

describe('builders are React elements (no .build())', () => {
  it('is a valid React element and assignable as a component return', () => {
    const node = Text('hello');
    expect(isValidElement(node)).toBe(true);
    expect(node).toHaveProperty('$$typeof');
    expect(node).toHaveProperty('type');

    function App(): ReactElement {
      return Text('returned');
    }
    render(<App />);
    expect(screen.getByText('returned')).toBeInTheDocument();
  });

  it('renders as a JSX child', () => {
    render(<div data-testid="wrap">{Text('jsx-child')}</div>);
    expect(screen.getByTestId('wrap')).toHaveTextContent('jsx-child');
  });

  it('renders in arrays and conditionals', () => {
    const show = true;
    const items = ['a', 'b'].map((label, i) => Text(label).key(i).id(`item-${i}`));
    render(
      <div>
        {items}
        {show ? Text('yes') : Text('no')}
        {false && Text('hidden')}
      </div>
    );
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();
    expect(screen.queryByText('hidden')).toBeNull();
  });

  it('renders when passed as a ReactNode prop', () => {
    render(<Slot child={Button('Save').id('save-btn')} />);
    expect(screen.getByTestId('slot')).toHaveTextContent('Save');
  });

  it('works with React.createElement', () => {
    const tree = createElement('div', { 'data-testid': 'ce' }, Text('via-ce'), Button('ok').id('ce-btn'));
    render(tree);
    expect(screen.getByTestId('ce')).toHaveTextContent('via-ce');
    expect(screen.getByTestId('ce')).toHaveTextContent('ok');
  });

  it('works under StrictMode', () => {
    render(
      <StrictMode>
        {Column().id('strict-col').children([Text('strict-ok')])}
      </StrictMode>
    );
    expect(screen.getByText('strict-ok')).toBeInTheDocument();
  });

  it('SSR renderToString includes the text', () => {
    const html = renderToString(Column().children([Text('ssr-title'), Button('Go').id('ssr-btn')]) as ReactElement);
    expect(html).toContain('ssr-title');
    expect(html).toContain('Go');
  });

  it('deprecated .build() still returns a host tree', () => {
    const { container } = render(Text('legacy').build());
    expect(container).toHaveTextContent('legacy');
  });

  it('toElement and mount accept a builder factory', () => {
    const { container } = render(toElement(Row().children([Text('te')])) as ReactElement);
    expect(container).toHaveTextContent('te');

    const host = document.createElement('div');
    document.body.appendChild(host);
    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount(host, () => Box().children(Text('mounted-nb')));
    });
    expect(host).toHaveTextContent('mounted-nb');
    act(() => {
      root.unmount();
    });
    host.remove();
  });
});

describe('public factories without .build() (export surface)', () => {
  it('Form and GridItem are valid React elements', () => {
    expect(isValidElement(Form().children(Text('form-nb')))).toBe(true);
    expect(isValidElement(GridItem().children(Text('gi-nb')))).toBe(true);
  });

  it('renders Form and GridItem as JSX children without .build()', () => {
    render(
      <div>
        {Form().children(Text('form-live'))}
        {GridItem().children(Text('gi-live'))}
      </div>
    );
    expect(screen.getByText('form-live')).toBeInTheDocument();
    expect(screen.getByText('gi-live')).toBeInTheDocument();
  });

  afterEach(() => {
    cleanup();
    window.history.pushState({}, '', '/');
  });

  it('Outlet is a component (not a fluent factory) and paints nested routes', () => {
    expect(Outlet).toBeTypeOf('function');
    window.history.pushState({}, '', '/app/dash');
    function Layout() {
      return createElement('div', null, 'shell-nb-', createElement(Outlet));
    }
    function Dash() {
      return createElement('span', null, 'dash-nb');
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
    expect(screen.getByText(/shell-nb-/)).toBeInTheDocument();
    expect(screen.getByText('dash-nb')).toBeInTheDocument();
  });

  it('listSignal is a factory, not a React element', () => {
    const items = listSignal<{ title: string }>([{ title: 'a' }]);
    expect(items.length).toBe(1);
    expect(isValidElement(items as never)).toBe(false);
  });
});

