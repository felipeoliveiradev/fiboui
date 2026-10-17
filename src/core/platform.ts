import { isSafeOpenUrl } from './safeUrl';
import { scrollTo } from './scroll';

/**
 * Browser helpers that did not exist as package exports before.
 * Prefer extending existing APIs (`scrollTo`) over inventing parallel ones.
 * Keep stable names the site already used (`goHash`, `openExternal`) as aliases.
 */

function getWindow(): Window | undefined {
  const win = globalThis.window;
  return typeof win === 'undefined' || win == null ? undefined : win;
}

/** Write text to the system clipboard. Returns false if unavailable. */
export async function writeClipboard(text: string): Promise<boolean> {
  const nav = globalThis.navigator;
  if (typeof nav === 'undefined' || !nav?.clipboard?.writeText) return false;
  try {
    await nav.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Open a URL (default: new tab + noopener). Canonical name. */
export function open(
  url: string,
  options?: { target?: '_blank' | '_self'; features?: string },
): void {
  const win = getWindow();
  if (!win || typeof win.open !== 'function') return;
  if (!isSafeOpenUrl(url)) return;
  const target = options?.target ?? '_blank';
  const features =
    options?.features ?? (target === '_blank' ? 'noopener,noreferrer' : undefined);
  win.open(url, target, features);
}

/** Alias — name the fibogrid site already used. Do not remove (no break). */
export const openExternal = open;

/**
 * In-page hash jump. Name the site already used.
 * Implementation = existing `scrollTo(id, { hash: true })` (no parallel logic).
 */
export function goHash(
  id: string,
  options?: { behavior?: ScrollBehavior; block?: ScrollLogicalPosition },
): void {
  scrollTo(id, {
    behavior: options?.behavior ?? 'smooth',
    block: options?.block ?? 'start',
    hash: true,
  });
}

export type HotkeyChord = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  /** Require meta OR ctrl (⌘K / Ctrl+K). */
  metaOrCtrl?: boolean;
  preventDefault?: boolean;
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

/** Bind global keydown chords. Returns unsubscribe. SSR-safe. */
export function bindHotkeys(chords: HotkeyChord[]): () => void {
  const win = getWindow();
  if (!win?.addEventListener) return () => undefined;

  const onKeyDown = (e: KeyboardEvent) => {
    for (const chord of chords) {
      if (chord.when && !chord.when()) continue;
      if (!chordMatches(e, chord)) continue;
      if (chord.preventDefault !== false) e.preventDefault();
      chord.run();
      return;
    }
  };

  win.addEventListener('keydown', onKeyDown);
  return () => win.removeEventListener('keydown', onKeyDown);
}
