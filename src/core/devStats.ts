export type FiboDevStats = {
  /** runBuildFrame / page produce counts */
  produces: number;
  /** node wire replays */
  replays: number;
  /** times a signal was promoted to page root (warn path) */
  pageRoots: number;
  /** warnDev calls that actually printed */
  warns: number;
};

const stats: FiboDevStats = {
  produces: 0,
  replays: 0,
  pageRoots: 0,
  warns: 0,
};

export function fiboDevStats(): FiboDevStats {
  return { ...stats };
}

export function resetFiboDevStats(): void {
  stats.produces = 0;
  stats.replays = 0;
  stats.pageRoots = 0;
  stats.warns = 0;
}

export function noteFiboDev(kind: 'produce' | 'replay' | 'pageRoot' | 'warn'): void {
  switch (kind) {
    case 'produce':
      stats.produces += 1;
      break;
    case 'replay':
      stats.replays += 1;
      break;
    case 'pageRoot':
      stats.pageRoots += 1;
      break;
    case 'warn':
      stats.warns += 1;
      break;
  }
}
