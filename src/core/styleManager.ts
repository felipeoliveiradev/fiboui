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

  
  public register(property: string, value: string): string {
    const key = `${property}:${value}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    
    const safeValue = value.replace(/[^a-zA-Z0-9-]/g, '_');
    const className = `fibo-${property}-${safeValue}`;
    
    
    const rule = `.${className} { ${property}: ${value} !important; }`;
    
    if (this.sheet && this.sheet.sheet) {
      try {
        this.sheet.sheet.insertRule(rule, this.sheet.sheet.cssRules.length);
      } catch (e) {
        console.error('FiboUI: Failed to inject dynamic style', e);
      }
    }

    this.cache.set(key, className);
    return className;
  }
}

export const _styleManager = StyleManager.getInstance();
