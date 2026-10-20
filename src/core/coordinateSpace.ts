import type { GeometryRect } from './viewChrome';

/** Registry of named coordinate spaces (SwiftUI CoordinateSpace.named). */
const namedSpaces = new Map<string, () => GeometryRect | null>();

export function registerCoordinateSpace(
  name: string,
  measure: () => GeometryRect | null
): () => void {
  const key = name.startsWith('named:') ? name.slice(6) : name;
  namedSpaces.set(key, measure);
  return () => {
    if (namedSpaces.get(key) === measure) namedSpaces.delete(key);
  };
}

export function measureCoordinateSpace(name: string): GeometryRect | null {
  if (name === 'local' || name === 'global') return null;
  const key = name.startsWith('named:') ? name.slice(6) : name;
  return namedSpaces.get(key)?.() ?? null;
}

export function listCoordinateSpaces(): string[] {
  return Array.from(namedSpaces.keys());
}
