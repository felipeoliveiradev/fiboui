import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Avatar,
  Button,
  Column,
  Fibo,
  ListTile,
  Progress,
  Row,
  Text,
  mount,
  toElement,
} from '../src';

describe('Button tone / shape / size / expand', () => {
  it('renders inverse solid rect xs without a raw style object', () => {
    render(
      Button('GET STARTED')
        .variant('solid')
        .tone('inverse')
        .shape('rect')
        .size('xs')
        .build()
    );
    const btn = screen.getByRole('button', { name: 'GET STARTED' });
    expect(btn.className).toMatch(/rounded-\[2px\]/);
    expect(btn.className).toMatch(/text-\[10px\]/);
    expect(btn.className).toMatch(/tracking-\[0\.12em\]/);
    expect(btn.className).toMatch(/items-center/);
    expect(btn.className).toMatch(/justify-center/);
    expect(btn.className).toMatch(/bg-\[#f2f2f2\]/);
    expect(btn.className).not.toMatch(/font-semibold/);
    expect(btn.className).not.toMatch(/active:scale/);
  });

  it('renders inverse outline + expand for paired actions', () => {
    render(
      Button('SET GOALS')
        .variant('outline')
        .tone('inverse')
        .shape('rect')
        .size('xs')
        .expand()
        .build()
    );
    const btn = screen.getByRole('button', { name: 'SET GOALS' });
    expect(btn.className).toMatch(/bg-black/);
    expect(btn.className).toMatch(/border-\[#3b3b3b\]/);
    expect(btn.className).toMatch(/flex-1/);
    expect(btn.className).toMatch(/justify-center/);
  });
});

describe('Row / Column hug()', () => {
  it('drops w-full self-stretch on a hugged Row', () => {
    const { container } = render(Row().hug().children([Text('chip')]).build());
    const row = container.querySelector('.fibo-row');
    expect(row?.className).toMatch(/w-auto/);
    expect(row?.className).toMatch(/self-auto/);
    expect(row?.className).not.toMatch(/self-stretch/);
  });

  it('drops w-full on a hugged Column', () => {
    const { container } = render(Column().hug().children([Text('n')]).build());
    const col = container.querySelector('.fibo-column');
    expect(col?.className).toMatch(/w-auto/);
    expect(col?.className).toMatch(/self-auto/);
  });
});

describe('Text nowrap / mono / muted', () => {
  it('applies helper classes and muted color', () => {
    const { container } = render(Text('MONEY TRACKER').nowrap().mono().muted().build());
    const el = container.querySelector('.fibo-text') as HTMLElement;
    expect(el.className).toMatch(/whitespace-nowrap/);
    expect(el.className).toMatch(/font-mono/);
    expect(['#9a9a9a', 'rgb(154, 154, 154)']).toContain(el.style.color);
  });

  it('defaults to zero margin so labels do not pick up UA <p> gap', () => {
    const { container } = render(Text('label').build());
    expect((container.querySelector('.fibo-text') as HTMLElement).style.margin).toBe('0px');
  });
});

describe('Avatar initials / icon', () => {
  it('renders two-letter initials without an image URL', () => {
    const { container } = render(Avatar().size(24).initials('0x').build());
    expect(container.textContent).toMatch(/0X/);
    expect(container.querySelector('.fibo-avatar')).toBeTruthy();
  });

  it('renders a built-in user glyph', () => {
    const { container } = render(Avatar().size(24).icon('user').build());
    expect(container.querySelector('svg.fibo-avatar-user')).toBeTruthy();
  });
});

describe('Progress ring + segments', () => {
  it('draws one circle per segment and centers children', () => {
    const { container } = render(
      Progress()
        .variant('ring')
        .size(190)
        .strokeWidth(2.4)
        .segments([
          { value: 50, color: '#fff' },
          { value: 25, color: '#888' },
          { value: 12, color: '#555' },
          { value: 11, color: '#2a2a2a' },
        ])
        .children([Text('TOTAL'), Text('$650.5K')])
        .build()
    );
    const ring = container.querySelector('.fibo-progress-ring');
    expect(ring).toBeTruthy();
    expect(ring).toHaveAttribute('role', 'progressbar');
    expect(container.querySelectorAll('circle').length).toBe(4);
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('$650.5K')).toBeInTheDocument();
  });
});

describe('ListTile', () => {
  it('lays out leading, title, chevron, and a divider', () => {
    const { container } = render(
      ListTile()
        .icon(Text('ico'))
        .title('ROBO-ADVISOR SERVICES')
        .chevron()
        .divider()
        .build()
    );
    expect(screen.getByText('ROBO-ADVISOR SERVICES')).toBeInTheDocument();
    expect(screen.getByText('ico')).toBeInTheDocument();
    const tile = container.querySelector('.fibo-list-tile') as HTMLElement;
    expect(tile.style.borderBottom).toMatch(/1px solid/);
    expect(container.querySelector('.fibo-list-tile-chevron svg')).toBeTruthy();
  });

  it('accepts a builder title and an onPress handler', async () => {
    let n = 0;
    render(
      ListTile()
        .title(Text('Risk'))
        .onPress(() => {
          n += 1;
        })
        .build()
    );
    screen.getByRole('button', { name: 'Risk' }).click();
    expect(n).toBe(1);
  });
});

describe('mount / Fibo / toElement', () => {
  it('toElement builds a fluent tree', () => {
    const { container } = render(toElement(Text('no-build')) as React.ReactElement);
    expect(container.textContent).toBe('no-build');
  });

  it('Fibo renders a builder child', () => {
    render(<Fibo>{Text('via-fibo')}</Fibo>);
    expect(screen.getByText('via-fibo')).toBeInTheDocument();
  });

  it('mount() renders a factory that returns a builder', () => {
    const host = document.createElement('div');
    host.id = 'fibo-mount';
    document.body.appendChild(host);
    let root: ReturnType<typeof mount>;
    act(() => {
      root = mount(host, () => Text('mounted'));
    });
    expect(host.textContent).toBe('mounted');
    act(() => {
      root.unmount();
    });
    host.remove();
  });
});
