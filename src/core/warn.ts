/** Dev-only warnings. One message per key so the console stays readable. */

import { noteFiboDev, resetFiboDevStats } from './devStats';

const seen = new Set<string>();

function isProd(): boolean {
  try {
    return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
  } catch {
    return false;
  }
}

/** Print once in development. Silent in production. */
export function warnDev(key: string, message: string): void {
  if (isProd()) return;
  if (seen.has(key)) return;
  seen.add(key);
  let where = '';
  try {
    const frames = (new Error().stack ?? '')
      .split('\n')
      .map((row) => row.trim().replace(/^at\s+/, ''))
      .filter((row) =>
        row.length > 0
        && !row.includes('warnDev')
        && !row.includes('/core/warn')
        && !row.includes('claimSignalReads')
        && !row.includes('rememberRoot')
        && !row.includes('Object.get'),
      )
      .slice(0, 6);
    if (frames.length > 0) where = `\n  ${frames.join('\n  ')}`;
  } catch {
    /* ignore */
  }
  noteFiboDev('warn');
  console.warn(`[fiboui] ${message}${where}`);
}

/** Tests reset the dedupe set between cases. */
export function resetWarnDev(): void {
  seen.clear();
  resetFiboDevStats();
}
