import type { CSSProperties } from 'react';
import type { CrossAxisAlignment, MainAxisAlignment } from '../core/types';

const justify: Record<MainAxisAlignment, CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  spaceBetween: 'space-between',
  spaceAround: 'space-around',
  spaceEvenly: 'space-evenly',
};

const align: Record<CrossAxisAlignment, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

/**
 * Stamp the flex axis inline. A parent `.resetStyle()` sets `all: unset` on
 * descendants, which beats the Tailwind `flex` / `flex-row` classes. Inline
 * layout survives that, so `Row` stays a row inside a reset bar.
 */
export function stampFlexAxis(
  style: CSSProperties,
  direction: 'row' | 'column',
  main: MainAxisAlignment,
  cross: CrossAxisAlignment,
): void {
  if (style.display == null) style.display = 'flex';
  if (style.flexDirection == null) style.flexDirection = direction;
  if (style.justifyContent == null) style.justifyContent = justify[main];
  if (style.alignItems == null) style.alignItems = align[cross];
}
