import type { CSSProperties } from 'react';

/**
 * Build a valid CSS `transition` value for one or more properties.
 *
 * WRONG: `transform, opacity, border-color 240ms ease-out`
 * (only the last property gets duration — the rest default to 0s → snap)
 *
 * RIGHT: `transform 240ms ease-out, opacity 240ms ease-out, border-color 240ms ease-out`
 */
export function formatCssTransition(
  properties: string | string[],
  durationMs: number,
  easing: string,
  delayMs = 0,
): string {
  // Split "transform, opacity" so callers who pass a comma-string still get
  // per-property duration (otherwise only the last token animates).
  const list = (Array.isArray(properties) ? properties : [properties])
    .flatMap((p) => String(p).split(','))
    .map((p) => p.trim())
    .filter(Boolean);
  if (list.length === 0) list.push('all');
  const dur = `${durationMs}ms`;
  const delay = delayMs > 0 ? ` ${delayMs}ms` : '';
  return list.map((p) => `${p} ${dur} ${easing}${delay}`).join(', ');
}

/**
 * Promote surface shorthands to longhands so CSS transitions can interpolate
 * against `:hover` / `:active` rules that set `background-color` / `border-color`.
 *
 * Inline `background` / `border` shorthands do not interpolate cleanly against
 * longhand pseudo declarations (and can fight `!important` cascade timing).
 */
export function promoteSurfaceLonghandsInStyle(style: CSSProperties): CSSProperties {
  const next: CSSProperties = { ...style };
  let changed = false;

  const bg = next.background;
  if (
    typeof bg === 'string' &&
    bg.trim() &&
    next.backgroundColor == null &&
    isPromotableBackground(bg)
  ) {
    next.backgroundColor = bg;
    delete next.background;
    changed = true;
  }

  const border = next.border;
  if (typeof border === 'string' && border.trim()) {
    const parts = splitBorderShorthand(border);
    if (parts) {
      if (next.borderWidth == null && parts.width != null) next.borderWidth = parts.width;
      if (next.borderStyle == null && parts.style != null) next.borderStyle = parts.style;
      if (next.borderColor == null && parts.color != null) next.borderColor = parts.color;
      delete next.border;
      changed = true;
    }
  }

  return changed ? next : style;
}

/** Resting transform that matches translate3d hover targets (avoids none→translate jumps). */
export const REST_TRANSLATE_3D = 'translate3d(0, 0, 0)';

export function withRestTransform(style: CSSProperties): CSSProperties {
  if (style.transform != null && String(style.transform).trim() !== '') {
    return style;
  }
  return { ...style, transform: REST_TRANSLATE_3D };
}

export function toTranslate3d(
  axis: 'x' | 'y',
  value: number | string,
): string {
  const px = typeof value === 'number' ? `${value}px` : value;
  return axis === 'x' ? `translate3d(${px}, 0, 0)` : `translate3d(0, ${px}, 0)`;
}

function isPromotableBackground(value: string): boolean {
  const s = value.trim().toLowerCase();
  if (!s) return false;
  // Gradients / images are not color longhands — leave shorthand alone.
  if (
    s.includes('gradient(') ||
    s.includes('url(') ||
    s.includes('image(') ||
    s.includes('element(') ||
    s.startsWith('repeat') ||
    s.includes(' / ')
  ) {
    return false;
  }
  return true;
}

function splitBorderShorthand(
  border: string,
): { width?: string; style?: string; color?: string } | null {
  const trimmed = border.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^(\S+)\s+(\S+)\s+(.+)$/);
  if (!match) return null;
  return { width: match[1], style: match[2], color: match[3] };
}
