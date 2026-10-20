import { livePrint, type NumericInput } from './livePrint';

/**
 * CSS length printers for live styles / text.
 *
 * ```ts
 * Box().width(Unit.px(width))
 * Box().height(Unit.percent(height))
 * Text(Unit.rem(size))
 * ```
 */
export const Unit = {
  px(value: NumericInput): string {
    return livePrint(value, (n) => `${n}px`);
  },

  rem(value: NumericInput): string {
    return livePrint(value, (n) => `${n}rem`);
  },

  em(value: NumericInput): string {
    return livePrint(value, (n) => `${n}em`);
  },

  /** `Unit.percent(50)` → `"50%"`. */
  percent(value: NumericInput): string {
    return livePrint(value, (n) => `${n}%`);
  },

  vh(value: NumericInput): string {
    return livePrint(value, (n) => `${n}vh`);
  },

  vw(value: NumericInput): string {
    return livePrint(value, (n) => `${n}vw`);
  },
} as const;
