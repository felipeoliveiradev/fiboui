import { Route } from './RouterContext';

export interface MatchedRoute {
  route: Route | null;
  params: Record<string, string>;
  leaf: Route | null;
  chain: Route[];
}

type SegKind = 'static' | 'param' | 'splat';

interface PatternSeg {
  kind: SegKind;
  value: string;
  optional: boolean;
}

function decodeSeg(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function parsePart(part: string): PatternSeg {
  if (part === '*' || part === '**') {
    return { kind: 'splat', value: '*', optional: false };
  }

  if (part.startsWith(':')) {
    let raw = part.slice(1);
    let optional = false;
    if (raw.endsWith('?')) {
      optional = true;
      raw = raw.slice(0, -1);
    }
    if (raw.endsWith('*')) {
      return { kind: 'splat', value: raw.slice(0, -1) || '*', optional };
    }
    return { kind: 'param', value: raw, optional };
  }

  return { kind: 'static', value: part, optional: false };
}

function patternScore(pattern: string): number {
  const parts = pattern.split('/').filter(Boolean);
  let score = 0;
  for (const part of parts) {
    const seg = parsePart(part);
    if (seg.kind === 'splat') score += 1;
    else if (seg.kind === 'param') score += seg.optional ? 9 : 10;
    else score += 100;
  }
  return score + parts.length * 0.01;
}

function minSegmentsAfter(patternSegs: PatternSeg[], from: number): number {
  let min = 0;
  for (let i = from; i < patternSegs.length; i++) {
    const seg = patternSegs[i];
    if (seg.optional) continue;
    min += 1;
  }
  return min;
}

function matchSegments(
  patternSegs: PatternSeg[],
  pathParts: string[],
  exact: boolean
): { match: boolean; params: Record<string, string> } {
  const decoded = pathParts.map(decodeSeg);

  const rec = (
    si: number,
    pi: number,
    params: Record<string, string>
  ): Record<string, string> | null => {
    if (si === patternSegs.length) {
      if (exact && pi !== pathParts.length) return null;
      return params;
    }

    const seg = patternSegs[si];

    if (seg.kind === 'splat') {
      const available = pathParts.length - pi;
      const minTake = seg.optional ? 0 : 1;
      const maxTake = available - minSegmentsAfter(patternSegs, si + 1);
      if (maxTake < minTake) return null;
      for (let take = maxTake; take >= minTake; take--) {
        const captured = decoded.slice(pi, pi + take).join('/');
        const next = rec(si + 1, pi + take, { ...params, [seg.value]: captured });
        if (next) return next;
      }
      return null;
    }

    if (pi >= pathParts.length) {
      if (seg.optional) return rec(si + 1, pi, params);
      return null;
    }

    if (seg.kind === 'param') {
      const consumed = rec(si + 1, pi + 1, { ...params, [seg.value]: decoded[pi] });
      if (consumed) return consumed;
      if (seg.optional) return rec(si + 1, pi, params);
      return null;
    }

    if (decoded[pi] === decodeSeg(seg.value)) {
      return rec(si + 1, pi + 1, params);
    }
    return null;
  };

  const params = rec(0, 0, {});
  if (!params) return { match: false, params: {} };
  return { match: true, params };
}

export function matchPath(
  pathname: string,
  pattern: string,
  exact: boolean = true
): { match: boolean; params: Record<string, string> } {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length === 1 && patternParts[0] === '*') {
    return { match: true, params: { '*': pathParts.map(decodeSeg).join('/') } };
  }

  return matchSegments(patternParts.map(parsePart), pathParts, exact);
}

const UNMATCHED: MatchedRoute = { route: null, params: {}, leaf: null, chain: [] };

export function findMatchingRoute(
  routes: Route[],
  pathname: string
): MatchedRoute {
  let best: MatchedRoute = UNMATCHED;
  let bestScore = -Infinity;

  for (const route of routes) {
    const hasKids = !!(route.children && route.children.length > 0);
    const exact = route.exact ?? !hasKids;
    const { match, params } = matchPath(pathname, route.path, exact);

    let candidate: MatchedRoute | null = null;
    let score = -Infinity;

    if (match) {
      if (hasKids) {
        const child = findMatchingRoute(route.children!, pathname);
        candidate = {
          route,
          params: { ...params, ...child.params },
          leaf: child.leaf ?? route,
          chain: [route, ...child.chain],
        };
        score = patternScore(route.path) + (child.route ? 1000 : 0);
      } else {
        candidate = { route, params, leaf: route, chain: [route] };
        score = patternScore(route.path);
        // `/` has zero segments (score 0) and would lose to a catch-all `*`.
        if (score === 0) score = 100;
      }
    } else if (hasKids) {
      const child = findMatchingRoute(route.children!, pathname);
      if (child.route) {
        candidate = child;
        score = patternScore(child.leaf?.path ?? child.route.path);
      }
    }

    if (candidate && score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}

function joinSegments(parts: string[]): string {
  if (parts.length === 0) return '/';
  return `/${parts.join('/')}`;
}

export function buildPath(pattern: string, params: Record<string, string> = {}): string {
  const patternParts = pattern.split('/').filter(Boolean);
  const out: string[] = [];

  for (const part of patternParts) {
    const seg = parsePart(part);

    if (seg.kind === 'splat') {
      const rest = params[seg.value] ?? (seg.value === '*' ? undefined : params['*']) ?? '';
      if (rest) {
        out.push(...rest.split('/').filter(Boolean));
      }
      continue;
    }

    if (seg.kind === 'param') {
      const value = params[seg.value];
      if (value == null || value === '') {
        if (seg.optional) continue;
        out.push(`:${seg.value}`);
        continue;
      }
      out.push(value);
      continue;
    }

    out.push(seg.value);
  }

  return joinSegments(out);
}
