/** Schemes that execute script or load an unexpected document as href/action/open(). */
const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file):/i;

function decodeForScheme(url: string): string {
  let s = url.trim().replace(/[\u0000-\u001F\u007F\u00A0\u200B-\u200D\uFEFF]/g, '');
  try {
    s = decodeURIComponent(s);
  } catch {
    /* keep stripped form */
  }
  return s.replace(/[\u0000-\u001F\u007F\u00A0\u200B-\u200D\uFEFF]/g, '');
}

/** True for javascript: / data: / vbscript: / file: (any casing, whitespace, BOM). */
export function isDangerousUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length === 0) return false;
  return DANGEROUS_SCHEME.test(decodeForScheme(url));
}

/**
 * href the browser should handle (not SPA navigate): hash, http(s),
 * protocol-relative, mailto/tel/sms. Dangerous schemes are never native.
 */
export function isNativeHref(url: string): boolean {
  if (typeof url !== 'string') return false;
  const t = url.trim();
  if (!t || isDangerousUrl(t)) return false;
  return t.startsWith('#') || /^(https?:)?\/\//i.test(t) || /^(mailto|tel|sms):/i.test(t);
}

/** window.open — http(s), protocol-relative, or relative. No javascript:/data:. */
export function isSafeOpenUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  const t = url.trim();
  if (!t || isDangerousUrl(t)) return false;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(t);
  if (scheme && !/^https?$/i.test(scheme[1])) return false;
  return true;
}

export function mergeRel(existing: string | undefined, extra: string): string {
  const parts = new Set(`${existing ?? ''} ${extra}`.trim().split(/\s+/).filter(Boolean));
  return [...parts].join(' ');
}
