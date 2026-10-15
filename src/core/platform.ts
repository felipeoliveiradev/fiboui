import { scrollTo } from './scroll';

/**
 * Browser/platform facade — the only place apps should touch “native” behavior.
 * App / ViewModel code uses these helpers; never `window` / `document` / `navigator` directly.
 */

/** Write text to the system clipboard. Returns false if unavailable. */
export async function writeClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Open a URL (default: new tab with noopener). */
export function openUrl(
  url: string,
  options?: { target?: '_blank' | '_self'; features?: string },
): void {
  if (typeof window === 'undefined') return;
  const target = options?.target ?? '_blank';
  const features =
    options?.features ?? (target === '_blank' ? 'noopener,noreferrer' : undefined);
  window.open(url, target, features);
}

/**
 * In-page hash navigation: set `location.hash` and smooth-scroll to the element.
 * Accepts `"architecture"` or `"#architecture"`.
 */
export function goHash(
  id: string,
  options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition },
): void {
  if (typeof window === 'undefined') return;
  const hash = id.startsWith('#') ? id.slice(1) : id;
  if (!hash) return;
  window.location.hash = hash;
  scrollTo(hash, {
    behavior: options?.behavior ?? 'smooth',
    block: options?.block ?? 'start',
  });
}

export type HotkeyChord = {
  /** Key from KeyboardEvent.key, e.g. `"k"`, `"Escape"`. */
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** Require meta OR ctrl (⌘K / Ctrl+K). */
  metaOrCtrl?: boolean;
  preventDefault?: boolean;
  /** Skip when false. */
  when?: () => boolean;
  run: () => void;
};

function chordMatches(e: KeyboardEvent, c: HotkeyChord): boolean {
  if (e.key.toLowerCase() !== c.key.toLowerCase()) return false;
  if (c.metaOrCtrl) {
    if (!(e.metaKey || e.ctrlKey)) return false;
  } else {
    if (c.meta !== undefined && e.metaKey !== c.meta) return false;
    if (c.ctrl !== undefined && e.ctrlKey !== c.ctrl) return false;
  }
  if (c.alt !== undefined && e.altKey !== c.alt) return false;
  if (c.shift !== undefined && e.shiftKey !== c.shift) return false;
  return true;
}

/**
 * Bind global keydown chords. Returns an unsubscribe function.
 * SSR-safe: no-ops when `window` is missing.
 */
export function bindHotkeys(chords: HotkeyChord[]): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const onKeyDown = (e: KeyboardEvent) => {
    for (const chord of chords) {
      if (chord.when && !chord.when()) continue;
      if (!chordMatches(e, chord)) continue;
      if (chord.preventDefault !== false) e.preventDefault();
      chord.run();
      return;
    }
  };

  window.addEventListener('keydown', onKeyDown);
  return () => window.removeEventListener('keydown', onKeyDown);
}

/** Schedule a callback (SSR-safe). Prefer this over raw `setTimeout` in apps. */
export function delay(ms: number, fn: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const id = window.setTimeout(fn, ms);
  return () => window.clearTimeout(id);
}
