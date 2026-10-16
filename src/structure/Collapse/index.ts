'use client';

import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChild } from '../../core/types';
import { buildChild } from '../../core/children';
import { Box } from '../Box';
import { Text } from '../../content/Text';

class CollapseBuilder extends FiboBuilder {
  public _title: ReactNode | string = '';
  public _content: ReactNode = null;
  public _defaultExpanded: boolean = false;
  public _expanded?: boolean;
  public _onToggle?: (isOpen: boolean) => void;

  title(value: ReactNode | string): this {
    this._title = value;
    return this;
  }

  content(value: FiboChild): this {
    this._content = buildChild(value);
    return this;
  }

  isOpen(value: boolean): this {
    this._expanded = value;
    return this;
  }

  defaultOpen(value: boolean): this {
    this._defaultExpanded = value;
    return this;
  }

  onToggle(handler: (isOpen: boolean) => void): this {
    this._onToggle = handler;
    return this;
  }

  build(): ReactElement {
    return React.createElement(CollapseBase, {
       builder: this,
       ...this._props
    });
  }
}

interface CollapseBaseProps {
  builder: CollapseBuilder;
}

const CollapseBase = React.memo(({ builder }: CollapseBaseProps) => {
    const headerId = React.useId();
    const contentId = `${headerId}-content`;

    const isControlled = builder._expanded !== undefined;
    const [internalOpen, setInternalOpen] = useState(builder._defaultExpanded);

    const isOpen = isControlled ? builder._expanded : internalOpen;

    const toggle = () => {
        if (!isControlled) {
            setInternalOpen(!isOpen);
        }
        if (builder._onToggle) {
            builder._onToggle(!isOpen);
        }
    };

    return Box()
        .classNames(['w-full', 'border', 'border-gray-200', 'rounded-xl', 'overflow-hidden', 'bg-white', 'transition-all', 'duration-300'])
        .className((builder as unknown as { getClassName(): string }).getClassName())
        .style((builder as unknown as { getStyle(): React.CSSProperties }).getStyle())
        .children([
            React.createElement('button', {
                key: 'header',
                type: 'button',
                id: headerId,
                'aria-expanded': isOpen,
                'aria-controls': contentId,
                className: 'w-full flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none text-left bg-transparent border-0',
                onClick: toggle
            }, [
                React.createElement(React.Fragment, { key: 'title' },
                    typeof builder._title === 'string'
                        ? Text(builder._title).fontWeight(600).fontSize(15).color("#1F2937").build()
                        : builder._title
                ),
                React.createElement('span', {
                    key: 'chevron',
                    className: 'transition-transform duration-300',
                    style: { transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' },
                    'aria-hidden': true
                }, React.createElement('svg', {
                    width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
                    className: "text-gray-400"
                }, React.createElement('polyline', { points: "6 9 12 15 18 9" })))
            ]),

            Box()
                .props({
                    id: contentId,
                    role: 'region',
                    'aria-labelledby': headerId,
                    hidden: !isOpen || undefined
                })
                .classNames(['transition-all', 'duration-300', 'ease-in-out', 'overflow-hidden'])
                .style({
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                })
                .children(
                    Box().classNames(['p-4', 'pt-0', 'text-gray-600', 'text-sm']).children(builder._content).build()
                ).build()
        ])
        .build();
});

export const Collapse = createBuilder(CollapseBuilder);

export interface CollapseProps extends BaseProps {
  title: ReactNode | string;
  content: ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}
