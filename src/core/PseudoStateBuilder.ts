import { _styleManager } from './styleManager';
import type { FiboBuilder } from './builder';

export class PseudoStateBuilder {
  private baseClassName: string;
  private pseudoState: string;
  private parentBuilder: FiboBuilder;
  private isGroup: boolean;

  private transitionDuration: number = 200;
  private transitionEasing: string = 'ease-in-out';
  private transitionDelay: number = 0;
  private transitionProperties: string[] = ['all'];

  constructor(baseClassName: string, pseudoState: string, parentBuilder: FiboBuilder, isGroup: boolean = false) {
    this.baseClassName = baseClassName;
    this.pseudoState = pseudoState;
    this.parentBuilder = parentBuilder;
    this.isGroup = isGroup;
  }

  bg(color: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'background-color', color);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'background-color', color);
    }
    return this;
  }

  color(value: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'color', value);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'color', value);
    }
    return this;
  }

  text(color: string): this {
    return this.color(color);
  }

  opacity(value: number): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'opacity', String(value));
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'opacity', String(value));
    }
    return this;
  }

  borderColor(value: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'border-color', value);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'border-color', value);
    }
    return this;
  }

  transform(value: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transform', value);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transform', value);
    }
    return this;
  }

  scale(value: number): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transform', `scale(${value})`);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transform', `scale(${value})`);
    }
    return this;
  }

  translateX(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transform', `translateX(${finalValue})`);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transform', `translateX(${finalValue})`);
    }
    return this;
  }

  translateY(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transform', `translateY(${finalValue})`);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transform', `translateY(${finalValue})`);
    }
    return this;
  }

  shadow(value: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'box-shadow', value);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'box-shadow', value);
    }
    return this;
  }

  css(property: string, value: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, property, value);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, property, value);
    }
    return this;
  }

  transition(value: string): this;
  transition(properties: string | string[], duration: number, easing?: string, delay?: number): this;
  transition(
    valueOrProperties: string | string[],
    duration?: number,
    easing?: string,
    delay?: number
  ): this {

    if (typeof valueOrProperties === 'string' && duration === undefined) {
      if (this.isGroup) {
        _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transition', valueOrProperties);
      } else {
        _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transition', valueOrProperties);
      }
      return this;
    }

    const props = Array.isArray(valueOrProperties) ? valueOrProperties.join(', ') : valueOrProperties;
    const dur = `${duration || this.transitionDuration}ms`;
    const ease = easing || this.transitionEasing;
    const del = delay ? `${delay}ms` : '0ms';

    const transitionValue = `${props} ${dur} ${ease} ${del}`;

    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transition', transitionValue);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transition', transitionValue);
    }

    return this;
  }

  duration(ms: number): this {
    this.transitionDuration = ms;
    this.applyTransition();
    return this;
  }

  easing(value: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | string): this {
    this.transitionEasing = value;
    this.applyTransition();
    return this;
  }

  delay(ms: number): this {
    this.transitionDelay = ms;
    this.applyTransition();
    return this;
  }

  properties(props: string[]): this {
    this.transitionProperties = props;
    this.applyTransition();
    return this;
  }

  private applyTransition(): void {
    const props = this.transitionProperties.join(', ');
    const duration = `${this.transitionDuration}ms`;
    const easing = this.transitionEasing;
    const delay = this.transitionDelay > 0 ? `${this.transitionDelay}ms` : '0ms';

    const transitionValue = `${props} ${duration} ${easing} ${delay}`;

    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, 'transition', transitionValue);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, 'transition', transitionValue);
    }
  }

  end(): any {
    return this.parentBuilder;
  }
}
