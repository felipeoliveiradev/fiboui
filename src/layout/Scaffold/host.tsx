import React, { ReactElement, type Ref } from 'react';
import { ProviderWrapper } from '../../core/StateWrapper';

export type FabAt =
  | 'start'
  | 'center'
  | 'end'
  | 'startTop'
  | 'centerTop'
  | 'endTop'
  | 'startDock'
  | 'centerDock'
  | 'endDock';

export interface ScaffoldConfig {
  theme?: any;
  locale?: string;
  providers?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  overlays?: React.ReactNode[];
  rootRef?: Ref<HTMLDivElement>;
  extendBody?: boolean;
  extendBehindHeader?: boolean;
  avoidKeyboard?: boolean;
  onDrawerChanged?: (side: 'start' | 'end', open: boolean) => void;
  [key: string]: any;
}

/** Hook-free host. Client and RSC islands pass parent providers in. */
export function renderScaffoldHost(
  props: ScaffoldConfig,
  parentProviders: Map<string, any> | null | undefined,
): ReactElement {
  const {
    theme,
    locale,
    providers = {},
    className,
    style,
    children,
    overlays = [],
    rootRef,
    extendBody,
    extendBehindHeader,
    avoidKeyboard,
    onDrawerChanged: _onDrawerChanged,
    ...rest
  } = props;

  const allProviders = new Map<string, any>(parentProviders ?? []);

  if (theme) {
    allProviders.set('theme', theme);
  }

  if (locale) {
    allProviders.set('locale', locale);
  }

  Object.entries(providers).forEach(([key, value]) => {
    allProviders.set(key, value);
  });

  const overlayLayer =
    overlays.length > 0
      ? React.createElement(
          'div',
          {
            key: 'fibo-overlays',
            className: 'fibo-scaffold-overlays',
            style: {
              position: 'absolute',
              inset: '0px',
              pointerEvents: 'none',
              zIndex: 50,
            },
          },
          overlays.map((node, index) =>
            React.createElement(
              'div',
              {
                key:
                  React.isValidElement(node) && node.key != null && node.key !== ''
                    ? String(node.key)
                    : `fibo-overlay-slot-${index}`,
                style: { pointerEvents: 'auto' },
              },
              node,
            ),
          ),
        )
      : null;

  const hostStyle: React.CSSProperties = {
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    boxSizing: 'border-box',
    ...style,
  };
  if (!hostStyle.boxSizing) {
    hostStyle.boxSizing = 'border-box';
  }
  const paddingSet = [
    hostStyle.padding,
    hostStyle.paddingTop,
    hostStyle.paddingRight,
    hostStyle.paddingBottom,
    hostStyle.paddingLeft,
    hostStyle.paddingInline,
    hostStyle.paddingBlock,
  ].some((value) => value != null && value !== '');
  if (!paddingSet) {
    Object.assign(hostStyle, {
      ['--fibo-safe-top']: 'env(safe-area-inset-top, 0px)',
      ['--fibo-safe-right']: 'env(safe-area-inset-right, 0px)',
      ['--fibo-safe-bottom']: 'env(safe-area-inset-bottom, 0px)',
      ['--fibo-safe-left']: 'env(safe-area-inset-left, 0px)',
      paddingTop: 'var(--fibo-safe-top)',
      paddingRight: 'var(--fibo-safe-right)',
      paddingBottom: 'var(--fibo-safe-bottom)',
      paddingLeft: 'var(--fibo-safe-left)',
    });
  }

  const content = React.createElement(
    'div',
    {
      className: ['fibo-scaffold', className].filter(Boolean).join(' '),
      style: hostStyle,
      ref: rootRef,
      'data-extend-body': extendBody ? 'true' : undefined,
      'data-extend-header': extendBehindHeader ? 'true' : undefined,
      'data-keyboard': avoidKeyboard === false ? undefined : 'on',
      ...rest,
      ...(locale ? { lang: locale } : {}),
    },
    overlayLayer ? [children, overlayLayer] : children,
  );

  if (allProviders.size > 0) {
    return React.createElement(ProviderWrapper, {
      providers: allProviders,
      children: content,
    });
  }

  return content;
}
