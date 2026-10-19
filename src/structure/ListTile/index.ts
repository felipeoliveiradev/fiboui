import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { buildChild } from '../../core/children';
import { BaseProps, FiboChild } from '../../core/types';
import {
  collectInterpSignals,
  hasInterpMarks,
  resolveInterpString,
} from '../../core/interpolate';
import { isDangerousUrl, mergeRel } from '../../core/safeUrl';
import { fiboCn as twMerge } from '../../core/cn';

function bindInterp(host: FiboBuilder, text: string | undefined): void {
  if (typeof text !== 'string' || !hasInterpMarks(text)) return;
  for (const sig of collectInterpSignals(text)) {
    host.bindSignal(sig);
  }
}

function resolveInterp(text: string | undefined): string | undefined {
  if (typeof text !== 'string') return text;
  return hasInterpMarks(text) ? resolveInterpString(text) : text;
}

function resolveSlot(node: ReactNode): ReactNode {
  return typeof node === 'string' && hasInterpMarks(node) ? resolveInterpString(node) : node;
}

function bindSlot(host: FiboBuilder, node: FiboChild): ReactNode {
  if (typeof node === 'string') {
    bindInterp(host, node);
    return node;
  }
  return buildChild(node);
}

const ACCESSORY_INTERACTIVE =
  'a, button, input, textarea, select, [role="button"], [role="switch"], [role="checkbox"], [role="menuitem"]';

function stopAccessoryInteractive(e: React.MouseEvent): void {
  const t = e.target as HTMLElement | null;
  if (t?.closest(ACCESSORY_INTERACTIVE)) e.stopPropagation();
}

const Chevron = () =>
  React.createElement(
    'svg',
    {
      width: 12,
      height: 12,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      'aria-hidden': true,
    },
    React.createElement('path', { d: 'M9 5l7 7-7 7' })
  );

const ListTileInner = React.memo((props: any) => {
  const {
    leading,
    title,
    subtitle,
    trailing,
    chevron,
    divider,
    dividerColor,
    onPress,
    href,
    disabled,
    dense,
    onTap,
    className,
    style,
    ...rest
  } = props;

  const userStyle: React.CSSProperties = style || {};
  const padding = userStyle.padding ?? (dense ? '8px 0' : '14px 0');
  const restOnClick = rest.onClick as
    | ((e: React.MouseEvent<HTMLElement>) => void)
    | undefined;
  const restOnKeyDown = rest.onKeyDown as
    | ((e: React.KeyboardEvent<HTMLElement>) => void)
    | undefined;
  const press = typeof onPress === 'function' ? onPress : typeof onTap === 'function' ? onTap : undefined;
  const isDisabled = Boolean(disabled);
  const rawHref = typeof href === 'string' ? href.trim() : '';
  const safeHref = rawHref && !isDangerousUrl(rawHref) ? rawHref : undefined;
  const isLink = Boolean(safeHref) && !isDisabled;
  const hasAction =
    typeof press === 'function' || typeof restOnClick === 'function' || isLink;
  const isPressable = hasAction && !isDisabled;

  const titleNode =
    typeof title === 'string'
      ? React.createElement(
          'span',
          {
            className: 'fibo-list-tile-title',
            style: { fontSize: 11, letterSpacing: '0.06em', lineHeight: 1.3, margin: 0 },
          },
          resolveSlot(title)
        )
      : title;

  const subtitleNode =
    typeof subtitle === 'string'
      ? React.createElement(
          'span',
          {
            className: 'fibo-list-tile-subtitle',
            style: {
              fontSize: 8,
              letterSpacing: '0.06em',
              lineHeight: 1.3,
              margin: 0,
              color: '#9a9a9a',
            },
          },
          resolveSlot(subtitle)
        )
      : subtitle;

  const leadingNode = resolveSlot(leading);
  const trailingNode = resolveSlot(trailing);

  const target = rest.target;
  const rel =
    isLink && target && String(target).toLowerCase() === '_blank'
      ? mergeRel(rest.rel, 'noopener noreferrer')
      : rest.rel;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    press?.();
    restOnClick?.(e);
  };

  const hostProps: Record<string, unknown> = {
    className: twMerge('fibo-list-tile flex flex-row items-center w-full', className),
    style: {
      padding,
      borderBottom: divider ? `1px solid ${dividerColor || '#3b3b3b'}` : 'none',
      cursor: isDisabled ? 'not-allowed' : isPressable ? 'pointer' : undefined,
      opacity: isDisabled ? 0.6 : undefined,
      pointerEvents: isDisabled ? 'none' : undefined,
      ...userStyle,
    },
    ...rest,
    rel,
    onClick: hasAction || isDisabled ? handleClick : restOnClick,
  };

  if (isLink) {
    hostProps.href = safeHref;
  }

  if (isDisabled) {
    hostProps['aria-disabled'] = true;
    hostProps.tabIndex = rest.tabIndex ?? -1;
  }

  if (!isLink && hasAction) {
    hostProps.role = 'button';
    if (!isDisabled) {
      hostProps.tabIndex = rest.tabIndex ?? 0;
      hostProps.onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
        restOnKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.currentTarget.click();
        }
      };
    }
  }

  return React.createElement(
    isLink ? 'a' : 'div',
    hostProps,
    leadingNode != null && leadingNode !== false
      ? React.createElement(
          'div',
          {
            key: 'leading',
            className: 'fibo-list-tile-leading shrink-0 flex items-center',
            style: { color: '#9a9a9a', marginRight: 12 },
            onClick: stopAccessoryInteractive,
          },
          leadingNode
        )
      : null,
    React.createElement(
      'div',
      {
        key: 'body',
        className: 'fibo-list-tile-body flex-1 min-w-0 flex flex-col justify-center',
      },
      titleNode,
      subtitleNode
    ),
    trailingNode != null && trailingNode !== false
      ? React.createElement(
          'div',
          {
            key: 'trailing',
            className: 'fibo-list-tile-trailing shrink-0 flex items-center',
            style: { color: '#9a9a9a', marginLeft: 12 },
            onClick: stopAccessoryInteractive,
          },
          trailingNode
        )
      : null,
    chevron
      ? React.createElement(
          'div',
          {
            key: 'chevron',
            className: 'fibo-list-tile-chevron shrink-0 flex items-center',
            style: { color: '#9a9a9a', marginLeft: trailingNode ? 8 : 0 },
          },
          React.createElement(Chevron)
        )
      : null
  );
});

class ListTileBuilder extends FiboBuilder {
  private _leading?: ReactNode;
  private _title?: ReactNode;
  private _subtitle?: ReactNode;
  private _trailing?: ReactNode;
  private _chevron = false;
  private _divider = false;
  private _dividerColor?: string;
  private _onPress?: () => void;
  private _href?: string;
  private _disabled = false;
  private _dense = false;

  leading(node: FiboChild): this {
    this._leading = bindSlot(this, node);
    return this;
  }

  icon(node: FiboChild): this {
    return this.leading(node);
  }

  title(value: string | FiboChild): this {
    this._title = bindSlot(this, value);
    return this;
  }

  subtitle(value: string | FiboChild): this {
    this._subtitle = bindSlot(this, value);
    return this;
  }

  trailing(node: FiboChild): this {
    this._trailing = bindSlot(this, node);
    return this;
  }

  chevron(show: boolean = true): this {
    this._chevron = show;
    return this;
  }

  divider(show: boolean = true, color?: string): this {
    this._divider = show;
    if (color) this._dividerColor = color;
    return this;
  }

  onPress(handler: () => void): this {
    this._onPress = handler;
    return this;
  }

  /** Flutter-style alias of `.onPress()`. */
  onTap(handler: () => void): this {
    return this.onPress(handler);
  }

  href(url: string): this {
    this._href = url;
    return this;
  }

  disabled(value: boolean = true): this {
    this._disabled = value;
    return this;
  }

  dense(value: boolean = true): this {
    this._dense = value;
    return this;
  }

  build(): ReactElement {
    const {
      leading: leadingProp,
      trailing: trailingProp,
      title: titleProp,
      subtitle: subtitleProp,
      onPress: onPressProp,
      onTap: onTapProp,
      href: hrefProp,
      disabled: disabledProp,
      dense: denseProp,
      ...restProps
    } = this._props;

    const title = this._title !== undefined ? this._title : titleProp;
    const subtitle = this._subtitle !== undefined ? this._subtitle : subtitleProp;
    const leading = this._leading !== undefined ? this._leading : leadingProp;
    const trailing = this._trailing !== undefined ? this._trailing : trailingProp;
    if (typeof title === 'string') bindInterp(this, title);
    if (typeof subtitle === 'string') bindInterp(this, subtitle);
    if (typeof leading === 'string') bindInterp(this, leading);
    if (typeof trailing === 'string') bindInterp(this, trailing);

    return React.createElement(ListTileInner, {
      ...restProps,
      leading: typeof leading === 'string' ? resolveInterp(leading) : leading,
      title: typeof title === 'string' ? resolveInterp(title) : title,
      subtitle: typeof subtitle === 'string' ? resolveInterp(subtitle) : subtitle,
      trailing: typeof trailing === 'string' ? resolveInterp(trailing) : trailing,
      chevron: this._chevron,
      divider: this._divider,
      dividerColor: this._dividerColor,
      onPress: this._onPress ?? onPressProp ?? onTapProp,
      href: this._href ?? hrefProp,
      disabled: this._disabled || Boolean(disabledProp),
      dense: this._dense || Boolean(denseProp),
      className: this.getClassName(),
      style: this.getStyle(),
    });
  }
}

export const ListTile = createBuilder(ListTileBuilder);

export interface ListTileProps extends BaseProps {
  leading?: ReactNode;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  divider?: boolean;
  onPress?: () => void;
  onTap?: () => void;
  href?: string;
  disabled?: boolean;
  dense?: boolean;
}
