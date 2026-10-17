import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { ChildrenProps, FiboChildren } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function bindInterpTree(host: FiboBuilder, node: unknown): void {
  if (typeof node === 'function') {
    try {
      bindInterpTree(host, (node as () => unknown)());
    } catch {
      /* factory may need mount */
    }
    return;
  }
  if (typeof node === 'string') {
    bindInterp(host, node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) bindInterpTree(host, item);
  }
}

function resolveInterpChild(child: ReactNode): ReactNode {
  return typeof child === 'string' && hasInterpMarks(child)
    ? resolveInterpString(child)
    : child;
}

function firstThatFits(host: HTMLElement, probes: Array<HTMLElement | null>): number {
  const available = host.clientWidth;
  const last = Math.max(0, probes.length - 1);
  for (let i = 0; i < probes.length; i++) {
    const probe = probes[i];
    if (probe && probe.scrollWidth <= available) return i;
  }
  return last;
}

function ViewThatFitsHost({
  nodes,
  style,
  className,
  ...rest
}: {
  nodes: ReactNode[];
  style?: CSSProperties;
  className?: string;
} & Record<string, unknown>): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);
  const probeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [fit, setFit] = useState(() => Math.max(0, nodes.length - 1));

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || nodes.length === 0) return;

    const pick = () => {
      const next = firstThatFits(host, probeRefs.current);
      setFit((prev) => (prev === next ? prev : next));
    };

    pick();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(pick);
    observer.observe(host);
    return () => observer.disconnect();
  }, [nodes]);

  return React.createElement(
    'div',
    {
      ref: hostRef,
      style: { width: '100%', minWidth: 0, overflow: 'hidden', ...style },
      className,
      ...rest,
    },
    nodes.map((node, index) =>
      React.createElement(
        'div',
        {
          key: index,
          ref: (el: HTMLDivElement | null) => {
            probeRefs.current[index] = el;
          },
          'data-view-that-fits': index === fit ? 'shown' : 'probe',
          style:
            index === fit
              ? { minWidth: 0 }
              : {
                  position: 'absolute',
                  visibility: 'hidden',
                  width: 'max-content',
                  height: 0,
                  overflow: 'visible',
                  pointerEvents: 'none',
                },
        },
        node
      )
    )
  );
}

class ViewThatFitsBuilder extends FiboBuilder {
  children(children: FiboChildren): this {
    bindInterpTree(this, children);
    return super.children(children);
  }

  props(value: Record<string, any>): this {
    if (value && 'children' in value) {
      bindInterpTree(this, value.children);
    }
    return super.props(value);
  }

  build(): ReactElement {
    const style = this.getStyle();
    const { children: propsChildren, className: extraClass, ...rest } = this._props;
    const source = propsChildren !== undefined ? propsChildren : this.processChildren();
    const nodes = (source == null ? [] : Array.isArray(source) ? source : [source]).map(
      resolveInterpChild
    );
    const className = ['fibo-view-that-fits', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(ViewThatFitsHost, {
      nodes,
      style,
      className,
      ...rest,
    });
  }
}

export const ViewThatFits = createBuilder(ViewThatFitsBuilder);

export interface ViewThatFitsProps extends ChildrenProps {}
