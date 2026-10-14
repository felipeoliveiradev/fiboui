import React, { ReactElement, ReactNode, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps, FiboChild } from '../../core/types';
import { buildChild } from '../../core/children';
import { Box } from '../Box';
import { Row } from '../../layout/Row';
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

const CollapseBase = React.memo(({ builder }: { builder: CollapseBuilder }) => {

    const b = builder as any;

    const isControlled = b._expanded !== undefined;
    const [internalOpen, setInternalOpen] = useState(b._defaultExpanded);

    const isOpen = isControlled ? b._expanded : internalOpen;

    const toggle = () => {
        if (!isControlled) {
            setInternalOpen(!isOpen);
        }
        if (b._onToggle) {
            b._onToggle(!isOpen);
        }
    };

    return Box()
        .classNames(['w-full', 'border', 'border-gray-200', 'rounded-xl', 'overflow-hidden', 'bg-white', 'transition-all', 'duration-300'])
        .className(b.getClassName())
        .style(b.getStyle())
        .children([

            Row()
                .justifyContent("between")
                .alignItems("center")
                .classNames(['p-4', 'cursor-pointer', 'hover:bg-gray-50', 'transition-colors', 'select-none'])
                .props({ onClick: toggle })
                .children([
                     typeof b._title === 'string'
                        ? Text(b._title).fontWeight(600).fontSize(15).color("#1F2937").build()
                        : b._title,

                     Box()
                        .classNames(['transition-transform', 'duration-300'])
                        .style({ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' })
                        .children(

                           React.createElement('svg', {
                               width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round",
                               className: "text-gray-400"
                           }, React.createElement('polyline', { points: "6 9 12 15 18 9" }))
                        ).build()
                ]).build(),

            Box()
                .classNames(['transition-all', 'duration-300', 'ease-in-out', 'overflow-hidden'])
                .style({
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                })
                .children(
                    Box().classNames(['p-4', 'pt-0', 'text-gray-600', 'text-sm']).children(b._content).build()
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
