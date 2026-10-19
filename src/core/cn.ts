import { extendTailwindMerge } from 'tailwind-merge';

/**
 * User paint classes from StyleManager (`fibo-height-44px`, `fibo-background-color-…`)
 * sit in the same Tailwind group as the host utility (`h-auto`, `h-14`, `bg-transparent`).
 * `fiboCn(host, user)` drops the host utility. Works for every component that merges
 * its chrome with the builder class list — not a per-widget exception.
 */
const any = [() => true] as const;

export const fiboCn = extendTailwindMerge({
  extend: {
    classGroups: {
      h: [{ 'fibo-height': any }],
      w: [{ 'fibo-width': any }],
      'min-h': [{ 'fibo-min-height': any }],
      'max-h': [{ 'fibo-max-height': any }],
      'min-w': [{ 'fibo-min-width': any }],
      'max-w': [{ 'fibo-max-width': any }],
      'bg-color': [{ 'fibo-background-color': any }],
      'text-color': [{ 'fibo-color': any }],
      'font-size': [{ 'fibo-font-size': any }],
      'font-weight': [{ 'fibo-font-weight': any }],
      leading: [{ 'fibo-line-height': any }],
      tracking: [{ 'fibo-letter-spacing': any }],
      rounded: [{ 'fibo-border-radius': any }],
      opacity: [{ 'fibo-opacity': any }],
      p: [{ 'fibo-padding': any }],
      px: [{ 'fibo-padding-left': any }, { 'fibo-padding-right': any }],
      py: [{ 'fibo-padding-top': any }, { 'fibo-padding-bottom': any }],
      m: [{ 'fibo-margin': any }],
      gap: [{ 'fibo-gap': any }],
      display: [{ 'fibo-display': any }],
      position: [{ 'fibo-position': any }],
      top: [{ 'fibo-top': any }],
      right: [{ 'fibo-right': any }],
      bottom: [{ 'fibo-bottom': any }],
      left: [{ 'fibo-left': any }],
      z: [{ 'fibo-z-index': any }],
      overflow: [{ 'fibo-overflow': any }],
      shadow: [{ 'fibo-box-shadow': any }],
      'border-w': [{ 'fibo-border-width': any }],
      'border-color': [{ 'fibo-border-color': any }],
    },
  },
});
