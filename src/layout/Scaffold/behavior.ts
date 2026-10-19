import { createContext, useContext, type RefObject } from 'react';

export type DrawerSide = 'start' | 'end';

export type SnackAction = { label: string; onPress: () => void };

export type ScaffoldHandle = {
  openDrawer: () => void;
  closeDrawer: () => void;
  openEndDrawer: () => void;
  closeEndDrawer: () => void;
  showSnackBar: (message: string, action?: SnackAction) => void;
  showSheet: () => void;
  hideSheet: () => void;
};

type SnackItem = { message: string; action?: SnackAction; duration: number };

type DrawerHost = HTMLElement & {
  __fiboOnDrawer?: (side: DrawerSide, open: boolean) => void;
};

const ScaffoldContext = createContext<ScaffoldHandle | null>(null);

export function useScaffold(): ScaffoldHandle {
  const handle = useContext(ScaffoldContext);
  if (!handle) throw new Error('useScaffold() needs a Scaffold above this component');
  return handle;
}

export const scaffoldContext = ScaffoldContext;

const queues = new WeakMap<HTMLElement, SnackItem[]>();
const timers = new WeakMap<HTMLElement, number>();

function drawerOf(root: HTMLElement, side: DrawerSide): HTMLElement | null {
  return root.querySelector(`[data-scaffold-drawer="${side}"]`);
}

export function setDrawer(root: HTMLElement | null, side: DrawerSide, open: boolean): void {
  if (!root) return;
  const panel = drawerOf(root, side);
  if (!panel) return;
  panel.dataset.open = open ? 'true' : 'false';
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  panel.style.transform = '';
  const scrim = root.querySelector<HTMLElement>('[data-scaffold-scrim]');
  const other = side === 'start' ? 'end' : 'start';
  const otherOpen = drawerOf(root, other)?.dataset.open === 'true';
  if (scrim) scrim.dataset.open = open || otherOpen ? 'true' : 'false';
  if (open) panel.focus();
  (root as DrawerHost).__fiboOnDrawer?.(side, open);
}

export function setSheet(root: HTMLElement | null, open: boolean): void {
  if (!root) return;
  const sheet = root.querySelector<HTMLElement>('[data-scaffold-sheet]');
  if (!sheet) return;
  if (open) sheet.removeAttribute('hidden');
  else sheet.setAttribute('hidden', '');
}

function closeSnack(root: HTMLElement, el: HTMLElement): void {
  const timer = timers.get(root);
  if (timer != null) window.clearTimeout(timer);
  timers.delete(root);
  el.dataset.open = 'false';
  el.replaceChildren();
  pump(root);
}

function paintSnack(root: HTMLElement, el: HTMLElement, item: SnackItem): void {
  el.replaceChildren();
  const msg = document.createElement('span');
  msg.textContent = item.message;
  el.append(msg);
  if (item.action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.action.label;
    button.addEventListener('click', () => {
      item.action?.onPress();
      closeSnack(root, el);
    }, { once: true });
    el.append(button);
  }
  el.dataset.open = 'true';
  timers.set(root, window.setTimeout(() => closeSnack(root, el), item.duration));
}

function pump(root: HTMLElement): void {
  const el = root.querySelector<HTMLElement>('[data-scaffold-snack]');
  if (!el || el.dataset.open === 'true') return;
  const next = queues.get(root)?.shift();
  if (!next) return;
  paintSnack(root, el, next);
}

export function pushSnack(root: HTMLElement | null, message: string, action?: SnackAction): void {
  if (!root || !message) return;
  const queue = queues.get(root) ?? [];
  queue.push({ message, action, duration: 4000 });
  queues.set(root, queue);
  pump(root);
}

export function createScaffoldHandle(rootRef: RefObject<HTMLElement | null>): ScaffoldHandle {
  const root = () => rootRef.current;
  return {
    openDrawer: () => setDrawer(root(), 'start', true),
    closeDrawer: () => setDrawer(root(), 'start', false),
    openEndDrawer: () => setDrawer(root(), 'end', true),
    closeEndDrawer: () => setDrawer(root(), 'end', false),
    showSnackBar: (message, action) => pushSnack(root(), message, action),
    showSheet: () => setSheet(root(), true),
    hideSheet: () => setSheet(root(), false),
  };
}

function bindKeyboard(root: HTMLElement): () => void {
  if (root.dataset.keyboard !== 'on') return () => {};
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  let last = -1;
  const update = () => {
    const diff = window.innerHeight - viewport.height - viewport.offsetTop;
    const inset = Number.isFinite(diff) && diff > 0 ? Math.round(diff) : 0;
    if (inset === last) return;
    last = inset;
    root.style.setProperty('--fibo-keyboard', `${inset}px`);
    const safe = 'var(--fibo-safe-bottom, 0px)';
    root.style.paddingBottom = inset > 0 ? `calc(${safe} + ${inset}px)` : safe;
  };
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
  };
}

function bindDrawer(root: HTMLElement, side: DrawerSide): () => void {
  const panel = drawerOf(root, side);
  if (!panel) return () => {};
  const edge = root.querySelector<HTMLElement>(`[data-scaffold-edge="${side}"]`);
  const scrim = root.querySelector<HTMLElement>('[data-scaffold-scrim]');
  let tracking = false;
  let dragging = false;
  let startX = 0;
  let base = 0;
  let pointerId = 0;

  const width = () => panel.getBoundingClientRect().width || 280;
  const openNow = () => panel.dataset.open === 'true';

  const onDown = (event: PointerEvent) => {
    tracking = true;
    dragging = false;
    startX = event.clientX;
    pointerId = event.pointerId;
  };

  const onMove = (event: PointerEvent) => {
    if (!tracking || event.pointerId !== pointerId) return;
    const dx = event.clientX - startX;
    if (!dragging) {
      if (Math.abs(dx) < 8) return;
      dragging = true;
      const w = width();
      base = openNow() ? 0 : side === 'start' ? -w : w;
      panel.style.transition = 'none';
      panel.setPointerCapture?.(pointerId);
    }
    const w = width();
    let x = base + (event.clientX - startX);
    x = side === 'start' ? Math.max(-w, Math.min(0, x)) : Math.max(0, Math.min(w, x));
    panel.style.transform = `translate3d(${x}px,0,0)`;
    if (scrim) {
      scrim.dataset.open = 'true';
      scrim.style.opacity = String(1 - Math.abs(x) / w);
    }
  };

  const onUp = (event: PointerEvent) => {
    if (!tracking || event.pointerId !== pointerId) return;
    tracking = false;
    if (!dragging) return;
    dragging = false;
    panel.style.transition = '';
    if (scrim) scrim.style.opacity = '';
    const dx = event.clientX - startX;
    const w = width();
    const open = openNow();
    const next = side === 'start'
      ? (open ? dx > -w * 0.3 : dx > w * 0.3)
      : (open ? dx < w * 0.3 : dx < -w * 0.3);
    setDrawer(root, side, next);
  };

  edge?.addEventListener('pointerdown', onDown);
  panel.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  return () => {
    edge?.removeEventListener('pointerdown', onDown);
    panel.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };
}

/** Listeners only. Opening a drawer or a snack does not render React again. */
export function bindScaffold(root: HTMLElement): () => void {
  const stopKeyboard = bindKeyboard(root);
  const stopStart = bindDrawer(root, 'start');
  const stopEnd = bindDrawer(root, 'end');
  const scrim = root.querySelector<HTMLElement>('[data-scaffold-scrim]');
  const onScrim = () => {
    setDrawer(root, 'start', false);
    setDrawer(root, 'end', false);
  };
  scrim?.addEventListener('click', onScrim);
  const onAction = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const hit = target.closest('[data-scaffold-action]');
    if (!hit || !root.contains(hit)) return;
    const action = hit.getAttribute('data-scaffold-action');
    if (action === 'open-drawer') setDrawer(root, 'start', true);
    else if (action === 'open-end-drawer') setDrawer(root, 'end', true);
  };
  root.addEventListener('click', onAction);
  return () => {
    stopKeyboard();
    stopStart();
    stopEnd();
    scrim?.removeEventListener('click', onScrim);
    root.removeEventListener('click', onAction);
  };
}
