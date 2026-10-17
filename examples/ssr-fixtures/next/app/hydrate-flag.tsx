'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __FIBO_HYDRATED__?: boolean;
  }
}

/** Client island so Playwright can wait for hydrate without putting hooks on the page tree. */
export function HydrateFlag() {
  useEffect(() => {
    window.__FIBO_HYDRATED__ = true;
  }, []);
  return null;
}
