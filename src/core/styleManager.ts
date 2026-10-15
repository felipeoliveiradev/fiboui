import { FIBO_MOTION_CSS } from './motionCss';
import React, { ReactElement } from 'react';

export function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

export class StyleManager {
  private static instance: StyleManager;
  private sheet: HTMLStyleElement | null = null;
  private cache: Map<string, string> = new Map();
  private extras: string[] = [];
  private defaultsReady = false;

  private constructor() {
    this.attachSheet();
    this.ensureDefaults();
  }

  public static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager();
    }
    return StyleManager.instance;
  }

  /** Test-only: empty cache/sheet so a simulated client starts cold. */
  public reset(): void {
    this.cache.clear();
    this.extras = [];
    this.defaultsReady = false;
    this.sheet = null;
    this.attachSheet();
    this.ensureDefaults();
  }

  public static resetForTests(): void {
    StyleManager.getInstance().reset();
  }

  private attachSheet(): void {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('fibo-dynamic-styles') as HTMLStyleElement | null;
    if (existing) {
      this.sheet = existing;
      this.defaultsReady = true;
      return;
    }
    this.sheet = document.createElement('style');
    this.sheet.id = 'fibo-dynamic-styles';
    this.sheet.setAttribute('data-fibo', '1');
    document.head.appendChild(this.sheet);
  }

  /**
   * CSS `@media` rule, deduped. Used by `.media()` / `.md()` / `.responsive()` — not JS resize.
   */
  public registerMedia(query: string, property: string, value: string): string {
    const key = `@media ${query}|${property}:${value}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const className = `fibo-mq-${hashKey(key)}`;
    const rule = `@media ${query} { .${className} { ${property}: ${value} !important; } }`;
    this.insert(rule);
    this.cache.set(key, className);
    return className;
  }

  public ensureDefaults(): void {
    if (this.defaultsReady) return;
    this.defaultsReady = true;
    if (this.sheet && !this.sheet.textContent?.includes('fibo-fadeIn')) {
      this.sheet.appendChild(document.createTextNode(FIBO_MOTION_CSS));
    }
  }

  /**
   * Append a large static CSS blob once (keyed). Used by interaction-effect presets.
   * Tracked in `extras` so `getCss()` / SSR style tags include it after first use.
   */
  public injectExtra(css: string, key: string): void {
    const cacheKey = `extra:${key}`;
    if (this.cache.has(cacheKey)) return;
    this.cache.set(cacheKey, key);
    this.insert(css, true);
  }

  public getCss(): string {
    this.ensureDefaults();
    const rules = [...this.extras].sort();
    return [FIBO_MOTION_CSS, ...rules].filter(Boolean).join('\n');
  }

  public registerKeyframes(id: string, from: string, to: string): string {
    const key = `kf:${from}=>${to}`;
    if (this.cache.has(key)) return this.cache.get(key)!;
    const name = `fibo-c-${id}`;
    this.insert(`@keyframes ${name} { from { ${from} } to { ${to} } }`);
    this.insert(`.${name} { animation-name: ${name}; }`);
    this.cache.set(key, name);
    return name;
  }

  private insert(rule: string, track = true): void {
    if (track && this.extras.includes(rule)) return;
    if (track) this.extras.push(rule);
    if (this.sheet && this.sheet.textContent?.includes(rule)) {
      return;
    }
    if (this.sheet && this.sheet.sheet) {
      try {
        this.sheet.sheet.insertRule(rule, this.sheet.sheet.cssRules.length);
      } catch {
        if (this.sheet) this.sheet.appendChild(document.createTextNode(rule));
      }
    } else if (this.sheet) {
      this.sheet.appendChild(document.createTextNode(rule));
    }
  }

  /** Set a `:root` custom property (e.g. `--fibo-sticky-offset`). */
  public registerRoot(property: string, value: string): void {
    const key = `:root:${property}:${value}`;
    if (this.cache.has(key)) return;
    this.insert(`:root { ${property}: ${value}; }`);
    this.cache.set(key, ':root');
  }

  /** Once: `html { scroll-padding-top: var(--fibo-sticky-offset, 0px) }`. */
  public ensureScrollPadding(): void {
    const key = 'html:scroll-padding-top';
    if (this.cache.has(key)) return;
    this.insert('html { scroll-padding-top: var(--fibo-sticky-offset, 0px); }');
    this.cache.set(key, 'html');
  }

  public register(property: string, value: string): string {
    const key = `${property}:${value}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const safeValue = value.replace(/[^a-zA-Z0-9-]/g, '_');
    const className = `fibo-${property}-${safeValue}`;
    const rule = `.${className} { ${property}: ${value} !important; }`;

    this.insert(rule);
    this.cache.set(key, className);
    return className;
  }

  /**
   * One class per (pseudo, property, value). Same rules → same class on server and client.
   * Order-independent: each declaration hashes on its own.
   */
  public registerPseudo(
    pseudoState: string,
    property: string,
    value: string,
    isGroup = false
  ): string {
    const key = `${isGroup ? 'group:' : ''}${pseudoState}:${property}:${value}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const className = `fibo-ps-${hashKey(key)}`;
    const rule = isGroup
      ? `.group:${pseudoState} .${className} { ${property}: ${value} !important; }`
      : `.${className}:${pseudoState} { ${property}: ${value} !important; }`;

    this.insert(rule);
    this.cache.set(key, className);
    return className;
  }

  public registerGroupPseudo(
    _baseClassName: string,
    pseudoState: string,
    property: string,
    value: string
  ): string {
    return this.registerPseudo(pseudoState, property, value, true);
  }
}

export const _styleManager = StyleManager.getInstance();

export function ensureMotionCss(): void {
  StyleManager.getInstance().ensureDefaults();
}

export function getMotionCss(): string {
  return StyleManager.getInstance().getCss();
}

export function getCss(): string {
  return StyleManager.getInstance().getCss();
}

/** `<style id="fibo-dynamic-styles">` HTML. Call **after** `renderToString` so rules are collected. */
export function getStyleTag(): string {
  const css = getCss().replace(/<\/style/gi, '<\\/style');
  const tag = `<style id="fibo-dynamic-styles" data-fibo="1">${css}</style>`;
  // Vite SSR: snapshot then clear so the next request does not inherit rules.
  if (typeof document === 'undefined') {
    StyleManager.resetForTests();
  }
  return tag;
}

/**
 * Reset the StyleManager singleton between SSR requests (Next.js / custom servers).
 * Call after the response CSS has been captured when using `<FiboStyles />` mid-tree.
 */
export function endSsrRequest(): void {
  StyleManager.resetForTests();
}

/**
 * Inject collected CSS into a document. Place as a **later sibling** of the app
 * so registrations from children run first during SSR.
 */
export function FiboStyles(): ReactElement {
  ensureMotionCss();
  return React.createElement('style', {
    id: 'fibo-dynamic-styles',
    'data-fibo': '1',
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: { __html: getCss() },
  });
}

export function MotionStyles(): ReactElement {
  ensureMotionCss();
  return React.createElement('style', {
    id: 'fibo-motion-presets',
    'data-fibo-motion': '1',
    dangerouslySetInnerHTML: { __html: FIBO_MOTION_CSS },
  });
}
