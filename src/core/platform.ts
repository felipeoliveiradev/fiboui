/**
 * Browser helpers that did NOT exist in fiboui before.
 * Do not re-wrap APIs that already live elsewhere:
 * - in-page scroll / hash → `scrollTo(id, { hash: true })` in `scroll.ts`
 * - route changes → `useNavigate()` / `Link`
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

/** Open a URL (default: new tab + noopener). Replaces raw `window.open`. */
export function openExternal(
  url: string,
  options?: { target?: '_blank' | '_self'; features?: string },
): void {
  if (typeof window === 'undefined') return;
  const target = options?.target ?? '_blank';
  const features =
    options?.features ?? (target === '_blank' ? 'noopener,noreferrer' : undefined);
  window.open(url, target, features);
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
