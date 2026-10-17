import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { Table, Tags, listSignal, signal } from '../src/index';

afterEach(cleanup);

function reactKey(node: Element): string | null {
  const fiberKey = Object.keys(node).find(
    (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  );
  if (!fiberKey) return null;
  const fiber = (node as any)[fiberKey];
  const key = fiber?.key;
  return key == null ? null : String(key);
}

describe('Table().data(listSignal)', () => {
  it('does not throw when mapping a ListSignal and renders .value', () => {
    const rows = listSignal<{ name: string }>([{ name: 'Ada' }, { name: 'Bob' }]);
    let view: ReturnType<typeof render>;
    expect(() => {
      view = render(
        Table()
          .columns([{ header: 'Name', accessor: 'name' }])
          .data(rows)
          .build()
      );
    }).not.toThrow();
    expect(view!.container).toHaveTextContent('Ada');
    expect(view!.container).toHaveTextContent('Bob');
  });

  it('reads .value (view) instead of mapping the ListSignal object', () => {
    const rows = listSignal<{ name: string }>([{ name: 'Ada' }, { name: 'Bob' }]);
    rows.view('ada', ['name']);
    const { container } = render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data(rows)
        .build()
    );
    expect(container).toHaveTextContent('Ada');
    expect(container).not.toHaveTextContent('Bob');
  });

  it('rebuilds when the collection changes', () => {
    const rows = listSignal<{ name: string }>([{ name: 'Ada' }]);
    const { container } = render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data(rows)
        .build()
    );
    expect(container).toHaveTextContent('Ada');
    act(() => {
      rows.add({ name: 'Bob' });
    });
    expect(container).toHaveTextContent('Bob');
  });

  it('binds a plain signal (subscribe + value) without throwing on .map', () => {
    const rows = signal([{ name: 'Ada' }]);
    let view: ReturnType<typeof render>;
    expect(() => {
      view = render(
        Table()
          .columns([{ header: 'Name', accessor: 'name' }])
          .data(rows)
          .build()
      );
    }).not.toThrow();
    expect(view!.container).toHaveTextContent('Ada');
    act(() => {
      rows.value = [{ name: 'Bob' }];
    });
    expect(view!.container).toHaveTextContent('Bob');
    expect(view!.container).not.toHaveTextContent('Ada');
  });

  it('still accepts a plain array', () => {
    const { container } = render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data([{ id: 'u1', name: 'Ada' }])
        .build()
    );
    expect(container).toHaveTextContent('Ada');
  });
});

describe('Table row keys', () => {
  it('prefers _id then id then key then index', () => {
    const { container } = render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data([
          { _id: 'uid-1', id: 'id-1', key: 'key-1', name: 'A' },
          { id: 'id-2', key: 'key-2', name: 'B' },
          { key: 'key-3', name: 'C' },
          { name: 'D' },
        ])
        .build()
    );
    const trs = Array.from(container.querySelectorAll('tbody tr'));
    expect(trs).toHaveLength(4);
    expect(reactKey(trs[0])).toBe('uid-1');
    expect(reactKey(trs[1])).toBe('id-2');
    expect(reactKey(trs[2])).toBe('key-3');
    expect(reactKey(trs[3])).toBe('3');
  });
});

describe('Tags().items(listSignal)', () => {
  it('does not throw when mapping a ListSignal and renders .value', () => {
    const tags = listSignal<{ title: string }>([{ title: 'alpha' }, { title: 'beta' }]);
    let view: ReturnType<typeof render>;
    expect(() => {
      view = render(Tags().items(tags).build());
    }).not.toThrow();
    expect(view!.container).toHaveTextContent('alpha');
    expect(view!.container).toHaveTextContent('beta');
  });

  it('reads .value (view) instead of mapping the ListSignal object', () => {
    const tags = listSignal<{ title: string }>([{ title: 'alpha' }, { title: 'beta' }]);
    tags.view('alp', ['title']);
    const { container } = render(Tags().items(tags).build());
    expect(container).toHaveTextContent('alpha');
    expect(container).not.toHaveTextContent('beta');
  });

  it('rebuilds when the collection changes', () => {
    const tags = listSignal<{ title: string }>([{ title: 'alpha' }]);
    const { container } = render(Tags().items(tags).build());
    expect(container).toHaveTextContent('alpha');
    act(() => {
      tags.add({ title: 'beta' });
    });
    expect(container).toHaveTextContent('beta');
  });

  it('still accepts a plain array', () => {
    const { container } = render(Tags().items([{ title: 'plain' }]).build());
    expect(container).toHaveTextContent('plain');
  });
});
