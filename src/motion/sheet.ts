import React, { ReactElement } from 'react';
import { MOTION_CSS } from './css';

export const MOTION_STYLE_ID = 'fibo-motion';

const extras = new Map<string, string>();

export function getMotionCss(): string {
  if (extras.size === 0) return MOTION_CSS;
  return `${MOTION_CSS}\n${[...extras.values()].join('\n')}`;
}

export function registerMotionRule(id: string, css: string): void {
  if (extras.has(id)) return;
  extras.set(id, css);
  syncDom();
}

/** Inject the shared sheet once in the browser. Safe to call during SSR (no-op). */
export function ensureMotionCss(): void {
  syncDom();
}

function syncDom(): void {
  if (typeof document === 'undefined') return;
  let el = document.getElementById(MOTION_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = MOTION_STYLE_ID;
    el.setAttribute('data-fibo-motion', '1');
    document.head.appendChild(el);
  }
  const css = getMotionCss();
  if (el.textContent !== css) {
    el.textContent = css;
  }
}

/** Renders a `<style>` tag so `renderToString` / Next SSR include keyframes. */
export function MotionStyles(): ReactElement {
  return React.createElement('style', {
    id: MOTION_STYLE_ID,
    'data-fibo-motion': '1',
    dangerouslySetInnerHTML: { __html: getMotionCss() },
  });
}

export function resetMotionCssForTests(): void {
  extras.clear();
  if (typeof document !== 'undefined') {
    document.getElementById(MOTION_STYLE_ID)?.remove();
  }
}
