import { _styleManager } from './styleManager';
import type { FiboBuilder } from './builder';
import { resolveCssEase } from './easing';

export class PseudoStateBuilder {
  private baseClassName: string;
  private pseudoState: string;
  private parentBuilder: FiboBuilder;
  private isGroup: boolean;

  private transitionDuration: number = 200;
  private transitionEasing: string = 'ease-in-out';
  private transitionDelay: number = 0;
  private transitionProperties: string[] = ['all'];
  private transforms = new Map<string, string>();

  constructor(baseClassName: string, pseudoState: string, parentBuilder: FiboBuilder, isGroup: boolean = false) {
    this.baseClassName = baseClassName;
    this.pseudoState = pseudoState;
    this.parentBuilder = parentBuilder;
    this.isGroup = isGroup;
  }

  bg(color: string): this {
    return this.set('background-color', color);
  }

  color(value: string): this {
    return this.set('color', value);
  }

  text(color: string): this {
    return this.color(color);
  }

  opacity(value: number): this {
    return this.set('opacity', String(value));
  }

  borderColor(value: string): this {
    return this.set('border-color', value);
  }

  transform(value: string): this {
    this.transforms.set('raw', value);
    return this.flushTransform();
  }

  scale(value: number): this {
    this.transforms.set('scale', `scale(${value})`);
    return this.flushTransform();
  }

  translateX(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    this.transforms.set('translateX', `translateX(${finalValue})`);
    return this.flushTransform();
  }

  translateY(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    this.transforms.set('translateY', `translateY(${finalValue})`);
    return this.flushTransform();
  }

  rotate(degrees: number): this {
    this.transforms.set('rotate', `rotate(${degrees}deg)`);
    return this.flushTransform();
  }

  shadow(value: string): this {
    return this.set('box-shadow', value);
  }

  css(property: string, value: string): this {
    return this.set(property, value);
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
      return this.set('transition', valueOrProperties);
    }

    const props = Array.isArray(valueOrProperties) ? valueOrProperties.join(', ') : valueOrProperties;
    const dur = `${duration || this.transitionDuration}ms`;
    const ease = resolveCssEase(easing || this.transitionEasing);
    const del = delay ? `${delay}ms` : '0ms';
    return this.set('transition', `${props} ${dur} ${ease} ${del}`);
  }

  duration(ms: number): this {
    this.transitionDuration = ms;
    this.applyTransition();
    return this;
  }

  easing(value: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | string): this {
    this.transitionEasing = resolveCssEase(value);
    this.applyTransition();
    return this;
  }

  ease(value: string): this {
    return this.easing(value);
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
    this.set('transition', `${props} ${duration} ${easing} ${delay}`);
  }

  private flushTransform(): this {
    return this.set('transform', [...this.transforms.values()].join(' '));
  }

  private set(property: string, value: string): this {
    if (this.isGroup) {
      _styleManager.registerGroupPseudo(this.baseClassName, this.pseudoState, property, value);
    } else {
      _styleManager.registerPseudo(this.baseClassName, this.pseudoState, property, value);
    }
    return this;
  }

  end(): FiboBuilder {
    return this.parentBuilder;
  }
}
