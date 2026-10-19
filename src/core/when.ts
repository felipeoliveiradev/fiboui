import type { CSSProperties } from 'react';

/**
 * Closed set of paint states. Same method on every builder:
 *
 * ```ts
 * Row().when(When.hover, (s) => s.bg('#c8ff00'))
 * Checkbox().when(When.on, (s) => s.bg('#c8ff00'))
 * List().when(When.hover, (s) => s.bg('#f3f4f6'))
 * ```
 *
 * `on`/`checked` and `off`/`unchecked` are the same slot.
 * `indeterminate`/`mixed` is the third checkbox slot.
 * `hover` / `focus` / `active` / `visited` / `disabled` are CSS pseudos.
 * On `List`, those three (`hover`, `focus`, `active`) paint each row.
 */
export const When = {
  hover: 'hover',
  focus: 'focus',
  active: 'active',
  visited: 'visited',
  disabled: 'disabled',
  on: 'on',
  off: 'off',
  checked: 'checked',
  unchecked: 'unchecked',
  indeterminate: 'indeterminate',
  mixed: 'mixed',
} as const;

export type When = (typeof When)[keyof typeof When];

/** Fluent callback, a style object, or a raw CSS declaration string (list rows). */
export type WhenStyle =
  | CSSProperties
  | string
  | ((builder: any) => void);

const PSEUDO: Partial<Record<When, string>> = {
  hover: 'hover',
  focus: 'focus',
  active: 'active',
  visited: 'visited',
  disabled: 'disabled',
};

export function whenPseudo(state: When): string | undefined {
  return PSEUDO[state];
}

export function isToggleWhen(
  state: When,
): state is 'on' | 'off' | 'checked' | 'unchecked' | 'indeterminate' | 'mixed' {
  return (
    state === 'on' ||
    state === 'off' ||
    state === 'checked' ||
    state === 'unchecked' ||
    state === 'indeterminate' ||
    state === 'mixed'
  );
}
