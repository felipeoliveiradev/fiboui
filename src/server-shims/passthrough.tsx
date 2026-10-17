import React, {
  cloneElement,
  createElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

function finiteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function asHostElement(children: ReactNode): ReactElement {
  if (isValidElement(children)) return children;
  return createElement('span', null, children);
}

export function AnimatedWrapper({
  animatedProps,
  children,
}: {
  animatedProps?: Map<string, { value: unknown }>;
  animationConfig?: unknown;
  children?: ReactNode;
}) {
  if (!animatedProps || animatedProps.size === 0) return children;
  const transforms: Record<string, unknown> = {};
  animatedProps.forEach((signal, propName) => {
    transforms[propName] = signal.value;
  });
  const transformParts: string[] = [];
  const tx = finiteNumber(transforms.translateX);
  const ty = finiteNumber(transforms.translateY);
  const scale = finiteNumber(transforms.scale);
  const rotate = finiteNumber(transforms.rotate);
  if (tx !== undefined) transformParts.push(`translateX(${tx}px)`);
  if (ty !== undefined) transformParts.push(`translateY(${ty}px)`);
  if (scale !== undefined) transformParts.push(`scale(${scale})`);
  if (rotate !== undefined) transformParts.push(`rotate(${rotate}deg)`);
  if (transformParts.length === 0) return children;
  const host = asHostElement(children);
  return cloneElement(host, {
    style: { ...(host.props as { style?: CSSProperties }).style, transform: transformParts.join(' ') },
  });
}

export function Reveal({
  preset = 'fadeUp',
  forceMotion,
  style,
  children,
}: {
  preset?: string;
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
  forceMotion?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const className = [
    'fibo-reveal',
    `fibo-reveal-${preset}`,
    'min-w-0',
    forceMotion ? 'fibo-motion-force' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return React.createElement('div', { className, style, 'data-fibo-reveal': preset }, children);
}

export function ScrollProgress({ children }: { children: ReactElement }) {
  return React.createElement(
    'div',
    { 'data-fibo-scroll-progress': '1', style: { display: 'contents' } },
    children
  );
}

function resolveShow(show: unknown): boolean {
  if (show == null) return true;
  if (typeof show === 'object' && show !== null && 'value' in show) {
    return Boolean((show as { value: unknown }).value);
  }
  return Boolean(show);
}

function isPresenceProps(value: unknown): value is { show?: unknown; children?: ReactNode } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  if ('value' in value && typeof (value as { subscribe?: unknown }).subscribe === 'function') {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(value, 'show');
}

function renderPresence(show: unknown, children?: ReactNode) {
  if (!resolveShow(show)) return null;
  return React.createElement(React.Fragment, null, children);
}

/** RSC: fluent `Presence(show).enter().children()` plus component props. No document/IO. */
export function Presence(arg?: unknown): any {
  if (isPresenceProps(arg)) {
    return renderPresence(arg.show, arg.children);
  }
  let show = arg;
  const api: Record<string, unknown> = {};
  const chain = () => api;
  api.show = (value: unknown) => {
    show = value;
    return api;
  };
  api.enter = chain;
  api.exit = chain;
  api.duration = chain;
  api.reducedMotion = chain;
  api.children = (c: ReactNode) => renderPresence(show, c);
  api.build = () => renderPresence(show, undefined);
  return api;
}

export { isPresenceProps };

export function PresenceHost({
  show,
  children,
}: {
  show?: unknown;
  children?: ReactNode;
}) {
  return renderPresence(show, children);
}

/** Client `bindScrollProgress` writes `--fibo-progress` from window scroll. RSC: no-op. */
export function bindScrollProgress(_node?: HTMLElement | null): () => void {
  return () => undefined;
}

export function ValueBinder({
  signal,
  builder,
  loading,
  error,
}: {
  signal?: { value: unknown };
  builder?: (val: unknown) => ReactNode;
  loading?: () => ReactNode;
  error?: (err: unknown) => ReactNode;
}) {
  const value = signal?.value;
  const err = (value as { error?: unknown } | undefined)?.error;
  if (err && error) return error(err);
  const loadingFlag = (value as { isLoading?: unknown; loading?: unknown } | undefined)?.isLoading
    || (value as { loading?: unknown } | undefined)?.loading;
  if (loadingFlag === true && loading) return loading();
  if (builder) return builder(value);
  return null;
}
