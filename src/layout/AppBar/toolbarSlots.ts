import React, { type CSSProperties, type ReactNode } from 'react';

/** Where a toolbar item sits. Flutter NavigationToolbar / SwiftUI top·bottom bar. */
export type ToolbarPlace = 'leading' | 'principal' | 'trailing';

export const TOOLBAR_PLACES: readonly ToolbarPlace[] = ['leading', 'principal', 'trailing'];

export function isToolbarPlace(value: unknown): value is ToolbarPlace {
  return value === 'leading' || value === 'principal' || value === 'trailing';
}

export function toolbarPlaceOf(node: ReactNode): ToolbarPlace {
  if (!React.isValidElement(node)) return 'trailing';
  const props = node.props as { 'data-toolbar-place'?: unknown };
  return isToolbarPlace(props['data-toolbar-place']) ? props['data-toolbar-place'] : 'trailing';
}

const JUSTIFY: Record<ToolbarPlace, 'flex-start' | 'center' | 'flex-end'> = {
  leading: 'flex-start',
  principal: 'center',
  trailing: 'flex-end',
};

/**
 * Always three equal zones. Empty slots still occupy their third so a lone
 * `.principal()` stays centered (AppBar + BottomAppBar).
 */
export function buildToolbarSlots(
  nodes: ReactNode[],
  classPrefix: string,
): React.ReactElement[] {
  const groups: Record<ToolbarPlace, ReactNode[]> = {
    leading: [],
    principal: [],
    trailing: [],
  };
  for (const node of nodes) {
    groups[toolbarPlaceOf(node)].push(node);
  }

  return TOOLBAR_PLACES.map((place) =>
    React.createElement(
      'div',
      {
        key: place,
        className: `${classPrefix}-${place}`,
        'data-toolbar-slot': place,
        'data-empty': groups[place].length === 0 ? 'true' : undefined,
        style: {
          flex: '1 1 0',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: JUSTIFY[place],
          gap: 12,
        } satisfies CSSProperties,
      },
      ...groups[place],
    ),
  );
}
