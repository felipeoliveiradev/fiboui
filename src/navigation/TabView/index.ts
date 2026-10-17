import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

export interface TabViewTab {
  value: string;
  label: ReactNode;
  child?: ReactNode;
}

function slot(node: unknown): ReactNode {
  if (node == null || node === false) return null;
  return buildChild(node);
}

class TabViewBuilder extends FiboBuilder {
  private _tabs: TabViewTab[] = [];
  private _value?: string;
  private _onChange?: (value: string) => void;

  tabs(items: TabViewTab[]): this {
    this._tabs = items;
    return this;
  }

  value(value: string): this {
    this._value = value;
    return this;
  }

  onChange(handler: (value: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, key: _key, children: _children, ...rest } = this._props;
    const className = ['fibo-tabview', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = extraStyle ? { ...this.getStyle(), ...extraStyle } : this.getStyle();
    const selected = this._value ?? this._tabs[0]?.value;
    const current = this._tabs.find((tab) => tab.value === selected) ?? this._tabs[0];

    const tablist = React.createElement(
      'div',
      { role: 'tablist', className: 'fibo-tabview-list' },
      ...this._tabs.map((tab) =>
        React.createElement(
          'button',
          {
            key: tab.value,
            type: 'button',
            role: 'tab',
            'aria-selected': tab.value === selected ? 'true' : 'false',
            onClick: () => this._onChange?.(tab.value),
          },
          slot(tab.label)
        )
      )
    );

    const panel = React.createElement(
      'div',
      { role: 'tabpanel', className: 'fibo-tabview-panel' },
      slot(current?.child)
    );

    return React.createElement('div', { ...rest, className, style }, tablist, panel);
  }
}

export const TabView = createBuilder(TabViewBuilder);
