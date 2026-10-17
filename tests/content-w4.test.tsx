import { createElement, type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Badge, Skeleton, Text, interp, signal } from '../src';

afterEach(cleanup);

describe('Badge a11y', () => {
  it('error/warning intents use an assertive alert live region', () => {
    const { unmount } = render(Badge().text('Failed').intent('error').build());
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Failed');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    unmount();

    render(Badge().text('Careful').intent('warning').build());
    const warn = screen.getByRole('alert');
    expect(warn).toHaveTextContent('Careful');
    expect(warn).toHaveAttribute('aria-live', 'assertive');
  });

  it('info/success intents use a polite status live region', () => {
    const { unmount } = render(Badge().text('Live').intent('info').build());
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Live');
    expect(status).toHaveAttribute('aria-live', 'polite');
    unmount();

    render(Badge().text('Ready').intent('success').variant('solid').build());
    expect(screen.getByRole('status')).toHaveTextContent('Ready');
  });

  it('extra props do not clobber the live role', () => {
    render(
      Badge()
        .text('Hot')
        .intent('error')
        .id('badge-hot')
        .props({ role: 'presentation', 'data-testid': 'badge-hot' })
        .build()
    );
    const el = screen.getByTestId('badge-hot');
    expect(el).toHaveAttribute('id', 'badge-hot');
    expect(el).toHaveAttribute('role', 'alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('unknown intent does not crash', () => {
    expect(() =>
      render(Badge().text('Chip').intent('nope' as 'info').build())
    ).not.toThrow();
    expect(screen.getByText('Chip')).toBeInTheDocument();
  });
});

describe('Text non-string children', () => {
  it('does not crash when the factory receives a plain object', () => {
    expect(() => render(Text({ foo: 'bar' } as never).build())).not.toThrow();
  });

  it('renders children from a JSX-style props bag', () => {
    expect(() =>
      render(createElement(Text as never, { children: 'from-jsx' }))
    ).not.toThrow();
    expect(screen.getByText('from-jsx')).toBeInTheDocument();
  });

  it('renders .children() when constructor text is empty', () => {
    render(Text().children('via-children').build());
    expect(screen.getByText('via-children')).toBeInTheDocument();
  });

  it('renders element children without throwing', () => {
    render(Text().children(createElement('strong', null, 'bold-kid')).build());
    expect(screen.getByText('bold-kid').tagName).toBe('STRONG');
  });

  it('coerces numeric text', () => {
    render(Text(42 as never).build());
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('unknown variant falls back to a paragraph', () => {
    const { container } = render(Text('note').variant('nope' as 'body').build());
    expect(container.querySelector('p')?.textContent).toBe('note');
  });

  it('InterpToken without a template does not crash and stays live', () => {
    const n = signal(1);
    render(Text(interp(n) as never).build());
    expect(screen.getByText('1')).toBeInTheDocument();
    act(() => {
      n.value = 4;
    });
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renderToString does not throw for object or element children', () => {
    expect(() =>
      renderToString(Text({ children: 'ssr-text' } as never).build() as ReactElement)
    ).not.toThrow();
    expect(() =>
      renderToString(Text().children(createElement('em', null, 'ssr-em')).build() as ReactElement)
    ).not.toThrow();
  });
});

describe('Skeleton rest leftover', () => {
  it('keeps status/live when extra props try to clobber them', () => {
    render(
      Skeleton()
        .width(80)
        .height(12)
        .props({
          role: 'img',
          'aria-live': 'off',
          className: 'extra-sk',
          style: { opacity: 0.4, width: '1px' },
          'data-testid': 'sk',
        })
        .build()
    );
    const el = screen.getByTestId('sk');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('aria-label', 'Loading');
    expect(el.className).toMatch(/animate-pulse/);
    expect(el.className).toMatch(/extra-sk/);
    expect((el as HTMLElement).style.opacity).toBe('0.4');
    expect((el as HTMLElement).style.width).toBe('80px');
    expect((el as HTMLElement).style.height).toBe('12px');
  });
});
