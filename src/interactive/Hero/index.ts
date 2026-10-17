import React, { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';

type StartViewTransition = (update: () => void) => unknown;

/** CSS identifier safe for `view-transition-name`. */
export function heroIdent(tag: string): string {
  const cleaned = tag
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const base = cleaned || 'hero';
  if (/^[0-9-]/.test(base)) return `h-${base.replace(/^-/, '')}`;
  return base;
}

class HeroBuilder extends FiboBuilder {
  private _tag = 'hero';
  private _onFlight?: () => void;

  tag(value: string): this {
    this._tag = value;
    return this;
  }

  child(node: ReactNode): this {
    this._children = [node];
    return this;
  }

  onFlight(handler: () => void): this {
    this._onFlight = handler;
    return this;
  }

  build(): ReactElement {
    const ident = heroIdent(this._tag);
    const { className: extraClass, style: extraStyle, onClick: priorClick, ...rest } = this._props;
    const className = ['fibo-hero', this.getClassName(), extraClass].filter(Boolean).join(' ');
    const style = {
      ...this.getStyle(),
      ...(extraStyle ?? {}),
      viewTransitionName: ident,
    } as CSSProperties;
    const flight = this._onFlight;

    return React.createElement(
      'div',
      {
        ...rest,
        className,
        style,
        'data-hero': ident,
        onClick: (event: MouseEvent<HTMLDivElement>) => {
          if (flight) {
            let ran = false;
            const run = () => {
              if (ran) return;
              ran = true;
              flight();
            };
            try {
              const start =
                typeof document !== 'undefined'
                  ? (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition
                  : undefined;
              if (typeof start === 'function') start.call(document, run);
            } catch {
              // Missing or failing startViewTransition must not throw.
            }
            if (!ran) run();
          }
          if (typeof priorClick === 'function') priorClick(event);
        },
      },
      ...this._children.map((node) => buildChild(node)),
    );
  }
}

export const Hero = createBuilder(HeroBuilder);
