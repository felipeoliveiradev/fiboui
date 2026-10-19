import type { When } from '../core/when';

/** Shared paint slots for binary controls (Checkbox, Switch, and the same later). */
export type TogglePaintSlot = 'on' | 'off' | 'mixed';

/** `on`/`checked` and `off`/`unchecked` are the same slot. `mixed` is indeterminate. */
export function togglePaintSlot(state: When): TogglePaintSlot {
  if (state === 'on' || state === 'checked') return 'on';
  if (state === 'indeterminate' || state === 'mixed') return 'mixed';
  return 'off';
}
