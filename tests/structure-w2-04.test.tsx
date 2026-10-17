import { type ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Banner,
  Box,
  Button,
  Card,
  Collapse,
  ContentCard,
  ListTile,
  ProfileCard,
  Text,
} from '../src';

afterEach(cleanup);

describe('Collapse', () => {
  it('renders .children() as the panel body (docs API)', async () => {
    const user = userEvent.setup();
    render(
      Collapse()
        .title('Click to expand')
        .children('This is the collapsible content.')
        .build()
    );
    const button = screen.getByRole('button', { name: /Click to expand/ });
    await user.click(button);
    expect(screen.getByText('This is the collapsible content.')).toBeInTheDocument();
  });

  it('does not clip open content at 500px', () => {
    render(
      Collapse()
        .title('Tall')
        .defaultOpen(true)
        .content(
          Box()
            .style({ height: '800px' })
            .children('tall-body')
            .build()
        )
        .build()
    );
    const region = screen.getByRole('region');
    expect(region.style.maxHeight).not.toBe('500px');
    expect(screen.getByText('tall-body')).toBeInTheDocument();
  });

  it('hides closed panel from a11y tree and from tab order', () => {
    render(
      Collapse()
        .title('More')
        .content(Button('Inner').build())
        .build()
    );
    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Inner' })).toBeNull();
  });

  it('uses colon-free ids for header and aria-controls', () => {
    render(Collapse().title('Ids').content(Text('body')).build());
    const button = screen.getByRole('button', { name: 'Ids' });
    const headerId = button.getAttribute('id') || '';
    const controls = button.getAttribute('aria-controls') || '';
    expect(headerId).toBeTruthy();
    expect(headerId).not.toMatch(/:/);
    expect(controls).toBeTruthy();
    expect(controls).not.toMatch(/:/);
    expect(document.getElementById(controls)).toBeTruthy();
  });

  it('does not warn about missing keys in the disclosure tree', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(Collapse().title('Keyed').content(Text('panel')).build());
    const keyWarnings = spy.mock.calls
      .map((args) => args.map(String).join(' '))
      .filter((msg) => /unique key|each child/i.test(msg));
    spy.mockRestore();
    expect(keyWarnings).toEqual([]);
  });

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(
        Collapse().title('SSR').content(Text('body')).build() as ReactElement
      )
    ).not.toThrow();
  });
});

describe('ListTile a11y', () => {
  it('is keyboard-activatable when onPress is set', async () => {
    const user = userEvent.setup();
    let n = 0;
    render(
      ListTile()
        .title('Go')
        .onPress(() => {
          n += 1;
        })
        .build()
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveAttribute('tabindex', '0');
    btn.focus();
    await user.keyboard('{Enter}');
    expect(n).toBe(1);
    await user.keyboard(' ');
    expect(n).toBe(2);
  });
});

describe('Banner a11y', () => {
  it('uses alert for error/warning and status for info/success', () => {
    const { rerender } = render(Banner('Boom').status('error').build());
    expect(screen.getByRole('alert')).toHaveTextContent('Boom');

    rerender(Banner('Careful').status('warning').build());
    expect(screen.getByRole('alert')).toHaveTextContent('Careful');

    rerender(Banner('Note').status('info').build());
    expect(screen.getByRole('status')).toHaveTextContent('Note');

    rerender(Banner('Done').status('success').build());
    expect(screen.getByRole('status')).toHaveTextContent('Done');
  });
});

describe('Box / Card crashes', () => {
  it('renders with no children', () => {
    expect(() => render(Box().build())).not.toThrow();
    expect(() => render(Card().build())).not.toThrow();
  });

  it('does not throw when children is a single element via .props()', () => {
    const el = Text('solo').build();
    expect(() => render(Box().props({ children: el }).build())).not.toThrow();
    expect(() => render(Card().props({ children: el }).build())).not.toThrow();
    expect(screen.getAllByText('solo').length).toBeGreaterThan(0);
  });

  it('Box and Card renderToString without window', () => {
    expect(() => renderToString(Box().children('ssr-box').build() as ReactElement)).not.toThrow();
    expect(() => renderToString(Card().children('ssr-card').build() as ReactElement)).not.toThrow();
    expect(() =>
      renderToString(Banner('ssr-banner').status('info').build() as ReactElement)
    ).not.toThrow();
  });
});

describe('cards', () => {
  it('ContentCard image uses the title as alt', () => {
    render(ContentCard().image('/story.png').title('Story').build());
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Story');
  });

  it('ProfileCard does not crash without .stats()', () => {
    expect(() =>
      render(ProfileCard().name('Ada').handle('@ada').build())
    ).not.toThrow();
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });
});
