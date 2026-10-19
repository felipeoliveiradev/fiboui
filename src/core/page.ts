import React, { type ComponentType, type ReactElement, type ReactNode, useSyncExternalStore } from 'react';
import { buildChild } from './children';
import type { FiboChild } from './types';
import { FiboStyles } from './styleManager';
import { compileFormulas } from './formula';
import {
  paintLiveSlots,
  renderParts,
  runBuildFrame,
  type ComputedSignal,
  type LiveSlot,
  type Signal,
  type Subscribable,
} from './state';

export type FiboPageBuild = () => FiboChild | ReactNode;

export type FiboPageMeta = {
  title?: string;
  description?: string;
};

export type FiboPageOptions = {
  /** Append `<FiboStyles />` after the tree (SSR dynamic CSS). Default true. */
  styles?: boolean;
  /** SSR `<title>` / `<meta name="description">` (React 19 hoists into `<head>`). */
  meta?: FiboPageMeta;
};

export type FiboPageComponent = ComponentType & { meta?: FiboPageMeta };

/**
 * Next/Vite page helper — **zero JSX** in app code, SSR-safe.
 *
 * Next App Router still SSRs Client Components: HTML is rendered on the server,
 * then hydrated. Import `fiboui/style.css` once from `app/layout.tsx` (or the
 * Vite entry) so the base sheet is in the document on first paint.
 *
 * ```ts
 * // app/page.tsx — Server Component (no 'use client')
 * import { page, Column, Text } from 'fiboui'
 *
 * export default page(() =>
 *   Column().gap(12).children([Text('Hello')])
 * )
 * ```
 *
 * App Router resolves `fiboui` via the `react-server` export (static builders).
 * `build()` runs during RSC render so StyleManager rules exist before `<FiboStyles />`.
 */
export function page(
  build: FiboPageBuild,
  options: FiboPageOptions = {}
): FiboPageComponent {
  const { styles = true, meta } = options;
  const cells: (Signal<unknown> | ComputedSignal<unknown>)[] = [];
  const slots: LiveSlot[] = [];
  const formulas = compileFormulas(build.toString());
  let shape = '';
  let version = 0;
  let cached: ReactElement | null = null;
  let cachedVersion = -1;
  let patching = false;
  let wiredRoots: Subscribable<unknown>[] = [];
  let rootUnsubs: Array<() => void> = [];
  const listeners = new Set<() => void>();

  function sameDeps(a: Subscribable<unknown>[], b: Subscribable<unknown>[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function syncSubs(count: number) {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot) continue;
      if (i >= count) {
        slot.unsubs?.forEach((unsub) => unsub());
        slot.unsubs = [];
        slot.wired = undefined;
        continue;
      }
      if (slot.wired && sameDeps(slot.wired, slot.signals)) continue;
      slot.unsubs?.forEach((unsub) => unsub());
      slot.unsubs = slot.signals.map((sig) => sig.subscribe(() => onSlot(sig)));
      slot.wired = slot.signals;
    }
  }

  function syncRoots(next: Subscribable<unknown>[]) {
    if (sameDeps(wiredRoots, next)) return;
    rootUnsubs.forEach((unsub) => unsub());
    rootUnsubs = next.map((sig) => sig.subscribe(() => onSlot()));
    wiredRoots = next;
  }

  function patchLocal(origin: Subscribable<unknown>): boolean {
    let hit = false;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot?.signals.includes(origin)) continue;
      hit = true;
      if (!slot.parts || !slot.node) return false;
      slot.next = renderParts(slot.parts);
    }
    if (!hit) return false;
    return paintLiveSlots(slots, slots.length);
  }

  function onSlot(origin?: Subscribable<unknown>) {
    if (patching) return;
    patching = true;
    try {
      if (origin && patchLocal(origin)) return;
      refresh();
    } finally {
      patching = false;
    }
  }

  function decorate(tree: ReactNode): ReactElement {
    const nodes: ReactNode[] = [];
    if (typeof meta?.title === 'string' && meta.title.length > 0) {
      nodes.push(React.createElement('title', { key: 'fibo-title' }, meta.title));
    }
    if (typeof meta?.description === 'string' && meta.description.length > 0) {
      nodes.push(
        React.createElement('meta', {
          key: 'fibo-description',
          name: 'description',
          content: meta.description,
        })
      );
    }
    nodes.push(tree);
    if (styles) nodes.push(React.createElement(FiboStyles));
    return React.createElement(React.Fragment, null, ...nodes);
  }

  function produce(): {
    tree: ReactNode;
    layout: boolean;
    shape: string;
    slotCount: number;
    roots: Subscribable<unknown>[];
  } {
    let tree!: ReactNode;
    const built = runBuildFrame(cells, slots, () => {
      tree = buildChild(build());
    }, formulas);
    return { tree, ...built.outcome };
  }

  function refresh() {
    const next = produce();
    syncSubs(next.slotCount);
    syncRoots(next.roots);
    const same = next.shape === shape && !next.layout;
    if (same && paintLiveSlots(slots, next.slotCount)) return;
    shape = next.shape;
    version += 1;
    cached = decorate(next.tree);
    cachedVersion = version;
    for (const listener of listeners) listener();
  }

  function view(): ReactElement {
    if (cached && cachedVersion === version) return cached;
    const next = produce();
    shape = next.shape;
    cached = decorate(next.tree);
    cachedVersion = version;
    syncSubs(next.slotCount);
    syncRoots(next.roots);
    return cached;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        for (const slot of slots) {
          slot?.unsubs?.forEach((unsub) => unsub());
          if (!slot) continue;
          slot.unsubs = [];
          slot.wired = undefined;
        }
        rootUnsubs.forEach((unsub) => unsub());
        rootUnsubs = [];
        wiredRoots = [];
        cached = null;
        cachedVersion = -1;
      }
    };
  }

  function getSnapshot() {
    return version;
  }

  function getServerSnapshot() {
    return 0;
  }

  function FiboPage(): ReactElement {
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    return view();
  }

  FiboPage.displayName = 'FiboPage';
  if (meta) {
    (FiboPage as FiboPageComponent).meta = meta;
  }
  return FiboPage;
}

/**
 * Alias of `page()`. Prefer `export default page(() => …)` from a Server Component.
 */
export const createPage = page;

/**
 * Wrap any builder / node with `FiboStyles` without JSX.
 *
 * ```ts
 * export default function Home() {
 *   return withFiboStyles(Column().children([Text('Hi')]))
 * }
 * ```
 */
export function withFiboStyles(child: FiboChild | ReactNode): ReactElement {
  return React.createElement(
    React.Fragment,
    null,
    buildChild(child),
    React.createElement(FiboStyles)
  );
}
