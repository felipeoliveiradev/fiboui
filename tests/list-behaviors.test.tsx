import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Section } from '../src/structure/Section';
import { SwipeRow } from '../src/structure/SwipeRow';
import { RefreshIndicator } from '../src/structure/RefreshIndicator';
import { ReorderableList } from '../src/structure/ReorderableList';
import { Dismissible } from '../src/structure/Dismissible';
import { PageView } from '../src/structure/PageView';
import { OutlineGroup } from '../src/structure/OutlineGroup';

afterEach(cleanup);

describe('list behaviors', () => {
  it('Section renders a heading', () => {
    const built = {
      build: () => React.createElement('span', null, 'From builder'),
    };
    render(
      Section().header('Inbox').footer('3').children([built, 'Mail']).build() as React.ReactElement,
    );
    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('From builder')).toBeInTheDocument();
  });

  it('SwipeRow shows the child and visible actions', async () => {
    const user = userEvent.setup();
    const onPress = vi.fn();
    render(
      SwipeRow()
        .child('Message')
        .actions([{ label: 'Delete', onPress }])
        .build() as React.ReactElement,
    );
    expect(screen.getByRole('group')).toHaveTextContent('Message');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it('ReorderableList move down swaps ids in onReorder', async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(
      ReorderableList()
        .items([
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
        ])
        .onReorder(onReorder)
        .build() as React.ReactElement,
    );
    await user.click(screen.getAllByRole('button', { name: 'Move down' })[0]);
    expect(onReorder).toHaveBeenCalledWith(['b', 'a']);
  });

  it('PageView next shows the second page text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      PageView()
        .pages(['Alpha page', 'Beta page'])
        .index(0)
        .onChange(onChange)
        .build() as React.ReactElement,
    );
    expect(screen.getByText('Alpha page')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Beta page')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('RefreshIndicator button calls onRefresh', async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const { rerender } = render(
      RefreshIndicator().refreshing(false).onRefresh(onRefresh).child('Rows').build() as React.ReactElement,
    );
    expect(screen.getByText('Rows')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledOnce();

    rerender(
      RefreshIndicator().refreshing(true).onRefresh(onRefresh).child('Rows').build() as React.ReactElement,
    );
    expect(screen.getByText('Rows').closest('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('Dismissible button calls onDismiss', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(Dismissible().child('Note').onDismiss(onDismiss).build() as React.ReactElement);
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('OutlineGroup can hide the child', async () => {
    const user = userEvent.setup();
    render(
      OutlineGroup()
        .nodes([{ id: '1', label: 'Root', children: [{ id: '2', label: 'Child' }] }])
        .build() as React.ReactElement,
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Root' }));
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });
});
