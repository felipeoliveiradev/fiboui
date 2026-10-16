'use client';

import { CSSProperties, ReactElement, cloneElement, useSyncExternalStore } from 'react';
import { ResponsiveStyles } from './types';
import { applyResponsiveStyles } from './component';

function subscribeViewport(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
}

function getViewportWidth(): number {
  return typeof window === 'undefined' ? 1024 : window.innerWidth;
}

interface ResponsiveWrapperProps {
  responsive: ResponsiveStyles;
  children: ReactElement<{ style?: CSSProperties }>;
}

export function ResponsiveWrapper({ responsive, children }: ResponsiveWrapperProps) {
  const width = useSyncExternalStore(subscribeViewport, getViewportWidth, () => 1024);
  const merged = applyResponsiveStyles(children.props.style ?? {}, responsive, width);
  return cloneElement(children, { style: merged });
}

/**
 * Current viewport width. Hydration uses 1024 (desktop) so the first client
 * render matches SSR; the real width arrives after mount.
 * Prefer `.md()` / `.responsive()` (CSS `@media`) over this hook.
 */
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribeViewport, getViewportWidth, () => 1024);
}
