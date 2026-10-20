import { livePrint, type NumericInput } from './livePrint';

/**
 * Number / money printers for live `Text` / `Button` templates.
 *
 * ```ts
 * Text(`€ ${Format.fixed(price)}`)
 * Text(Format.euro(price))
 * Text(Format.currency(price, 'USD'))
 * ```
 */
export const Format = {
  /** Decimals — default 2: `Format.fixed(price)` → `"12.50"`. */
  fixed(value: NumericInput, digits = 2): string {
    return livePrint(value, (n) => n.toFixed(digits));
  },

  /** Whole number, no decimals: `Format.integer(n)` → `"12"`. */
  integer(value: NumericInput): string {
    return livePrint(value, (n) => String(Math.round(n)));
  },

  /** `Format.euro(price)` → `"€ 12.50"`. */
  euro(value: NumericInput, digits = 2): string {
    return `€ ${Format.fixed(value, digits)}`;
  },

  /**
   * Locale currency. Default `EUR` / `es-ES`.
   * `Format.currency(price, 'USD', 'en-US')` → `"$12.50"`.
   */
  currency(value: NumericInput, currency = 'EUR', locale = 'es-ES'): string {
    return livePrint(value, (n) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n),
    );
  },

  /** `Format.percent(rate)` with rate `0–1` → `"12%"` (default 0 decimals). */
  percent(value: NumericInput, digits = 0): string {
    return livePrint(value, (n) => `${(n * 100).toFixed(digits)}%`);
  },

  /** Compact: `1200` → `"1.2K"` (en). */
  compact(value: NumericInput, locale = 'en'): string {
    return livePrint(value, (n) =>
      new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(n),
    );
  },
} as const;

/** Alias of `Format`. */
export const Transform = Format;
