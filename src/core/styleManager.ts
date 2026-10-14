export class StyleManager {
  private static instance: StyleManager;
  private sheet: HTMLStyleElement | null = null;
  private cache: Map<string, string> = new Map();

  private constructor() {
    if (typeof document !== 'undefined') {
      this.sheet = document.createElement('style');
      this.sheet.id = 'fibo-dynamic-styles';
      document.head.appendChild(this.sheet);
    }
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

  private insert(rule: string): void {
    if (this.sheet && this.sheet.sheet) {
      try {
        this.sheet.sheet.insertRule(rule, this.sheet.sheet.cssRules.length);
      } catch (e) {
        console.error('FiboUI: Failed to inject dynamic style', e);
      }
    }
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
