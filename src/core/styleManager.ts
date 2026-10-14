import { FIBO_MOTION_CSS } from './motionCss';
import React, { ReactElement } from 'react';

export class StyleManager {
  private static instance: StyleManager;
  private sheet: HTMLStyleElement | null = null;
  private cache: Map<string, string> = new Map();
  private extras: string[] = [];
  private defaultsReady = false;

  private constructor() {
    if (typeof document !== 'undefined') {
      this.sheet = document.createElement('style');
      this.sheet.id = 'fibo-dynamic-styles';
      document.head.appendChild(this.sheet);
    }
    this.ensureDefaults();
  }

  public static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager();
    }
    return StyleManager.instance;
  }

  /**
   * CSS `@media` rule, deduped. Used by `.media()` / `.md()` — not JS resize.
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

  public getCss(): string {
    this.ensureDefaults();
    const fromSheet =
      this.sheet?.sheet
        ? Array.from(this.sheet.sheet.cssRules)
            .map((r) => r.cssText)
            .join('\n')
        : '';
    return [FIBO_MOTION_CSS, ...this.extras, fromSheet].filter(Boolean).join('\n');
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
    if (track) this.extras.push(rule);
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

  public registerPseudo(
    baseClassName: string,
    pseudoState: string,
    property: string,
    value: string
  ): string {
    const key = `${baseClassName}:${pseudoState}:${property}:${value}`;
    if (this.cache.has(key)) {
      return baseClassName;
    }

    const rule = `.${baseClassName}:${pseudoState} { ${property}: ${value} !important; }`;

    this.insert(rule);
    this.cache.set(key, baseClassName);
    return baseClassName;
  }

  public registerGroupPseudo(
    baseClassName: string,
    pseudoState: string,
    property: string,
    value: string
  ): string {
    const key = `group:${baseClassName}:${pseudoState}:${property}:${value}`;
    if (this.cache.has(key)) {
      return baseClassName;
    }

    const rule = `.group:${pseudoState} .${baseClassName} { ${property}: ${value} !important; }`;

    this.insert(rule);
    this.cache.set(key, baseClassName);
    return baseClassName;
  }
}

function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = ((h << 5) + h) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

export const _styleManager = StyleManager.getInstance();

export function ensureMotionCss(): void {
  _styleManager.ensureDefaults();
}

export function getMotionCss(): string {
  return _styleManager.getCss();
}

export function MotionStyles(): ReactElement {
  ensureMotionCss();
  return React.createElement('style', {
    id: 'fibo-motion-presets',
    'data-fibo-motion': '1',
    dangerouslySetInnerHTML: { __html: FIBO_MOTION_CSS },
  });
}
