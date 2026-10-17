import { _styleManager } from './styleManager';
import type { FiboBuilder } from './builder';
import { resolveCssEase } from './easing';
import {
  interactionEffectClass,
  interactionEffectTriggerClass,
  normalizeInteractionEffect,
  type InteractionEffectName,
} from './interactionEffects';
import { ensureInteractionFxCss } from './ensureInteractionFx';
import { formatCssTransition, toTranslate3d } from './smoothInteraction';
import {
  camelToKebab,
  kebabToCamel,
  logicalLonghands,
  normalizeCssValue,
  resolveBoxShorthand,
  type LogicalAxes,
} from './cssFluent';

const SMOOTH_PROPS: Record<string, string[]> = {
  'background-color': ['background-color'],
  'border-color': ['border-color'],
  color: ['color'],
  opacity: ['opacity'],
  transform: ['transform'],
  'box-shadow': ['box-shadow'],
  'border-radius': ['border-radius'],
};

/**
 * The constructor returns a proxy that accepts any CSS method.
 * Declare the axes plus `boxShadow` (the class method is `.shadow()`).
 */
export interface PseudoStateBuilder extends LogicalAxes {
  boxShadow(value: string | number): this;
}

export class PseudoStateBuilder {
  private pseudoState: string;
  private parentBuilder: FiboBuilder;
  private isGroup: boolean;

  private transitionDuration: number = 200;
  private transitionEasing: string = 'ease-in-out';
  private transitionDelay: number = 0;
  private transitionProperties: string[] = ['all'];
  private transforms = new Map<string, string>();
  private _boxLonghands = new Set<string>();

  constructor(pseudoState: string, parentBuilder: FiboBuilder, isGroup: boolean = false) {
    this.pseudoState = pseudoState;
    this.parentBuilder = parentBuilder;
    this.isGroup = isGroup;

    const self = this;
    const proxy = new Proxy(this, {
      get(target, prop, receiver) {
        if (typeof prop !== 'string' || prop === 'constructor') {
          return Reflect.get(target, prop, receiver);
        }

        if (prop in target) {
          const val = Reflect.get(target, prop, receiver);
          if (typeof val !== 'function') return val;
          return (...args: unknown[]) => {
            const result = (val as Function).apply(target, args);
            return result === self ? proxy : result;
          };
        }

        return (value: unknown) => {
          const logical = logicalLonghands(prop);
          const props = logical ?? [prop];
          for (const name of props) {
            self.set(camelToKebab(name), normalizeCssValue(name, value));
          }
          return proxy;
        };
      },
    });
    return proxy;
  }

  /**
   * Apply a named interaction effect (full Hover.css–inspired catalog).
   * Works on any pseudo trigger — hover, press/active, focus, groupHover, etc.
   * Stamps CSS classes; sheet is fiboui-owned (not a Hover.css vendor).
   */
  effect(name: InteractionEffectName | string): this {
    const id = normalizeInteractionEffect(name);
    ensureInteractionFxCss();
    this.parentBuilder.addClassName('fibo-fx');
    this.parentBuilder.addClassName(interactionEffectClass(id));
    this.parentBuilder.addClassName(
      interactionEffectTriggerClass(this.pseudoState, this.isGroup),
    );
    // Omit `transform` from prepareSmooth so we do not stamp resting translate3d —
    // bob/hang/buzz keyframes start off-identity and would jump. Still transition
    // transform via ensureEffectTransition for nudge/grow/float presets.
    this.parentBuilder.prepareSmoothInteraction([
      'opacity',
      'box-shadow',
      'background-color',
      'border-color',
      'color',
      'border-radius',
    ]);
    this.parentBuilder.ensureEffectTransition(['transform']);
    return this;
  }

  bg(color: string): this {
    return this.set('background-color', color);
  }

  /** Same longhand as `.bg()` — interpolates against the resting surface. */
  backgroundColor(value: string): this {
    return this.bg(value);
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
    this.transforms.set('translateX', toTranslate3d('x', value));
    return this.flushTransform();
  }

  translateY(value: number | string): this {
    this.transforms.set('translateY', toTranslate3d('y', value));
    return this.flushTransform();
  }

  rotate(degrees: number): this {
    this.transforms.set('rotate', `rotate(${degrees}deg)`);
    return this.flushTransform();
  }

  shadow(value: string | number): this {
    return this.set('box-shadow', normalizeCssValue('boxShadow', value));
  }

  css(property: string, value: string | number): this {
    const camel = property.includes('-') ? kebabToCamel(property) : property;
    return this.set(camelToKebab(camel), normalizeCssValue(camel, value));
  }

  padding(value: string | number): this {
    return this.set('padding', normalizeCssValue('padding', value));
  }

  p(value: string | number): this {
    return this.padding(value);
  }

  margin(value: string | number): this {
    return this.set('margin', normalizeCssValue('margin', value));
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

    const props = Array.isArray(valueOrProperties)
      ? valueOrProperties
      : [valueOrProperties as string];
    const ease = resolveCssEase(easing || this.transitionEasing);
    return this.set(
      'transition',
      formatCssTransition(props, duration || this.transitionDuration, ease, delay || 0),
    );
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
    this.set(
      'transition',
      formatCssTransition(
        this.transitionProperties,
        this.transitionDuration,
        this.transitionEasing,
        this.transitionDelay,
      ),
    );
  }

  private flushTransform(): this {
    return this.set('transform', [...this.transforms.values()].join(' '));
  }

  private set(property: string, value: string): this {
    if (property === 'padding' || property === 'margin') {
      const resolved = resolveBoxShorthand(property, value, this._boxLonghands);
      if (resolved.shorthand == null) {
        for (const [prop, val] of resolved.longhands) {
          this._boxLonghands.add(prop);
          this.commit(prop, val);
        }
        return this;
      }
      value = resolved.shorthand;
    } else if (property.startsWith('padding-') || property.startsWith('margin-')) {
      this._boxLonghands.add(property);
    }
    return this.commit(property, value);
  }

  private commit(property: string, value: string): this {
    const smooth = SMOOTH_PROPS[property];
    if (smooth) {
      this.parentBuilder.prepareSmoothInteraction(smooth);
    }
    const className = _styleManager.registerPseudo(this.pseudoState, property, value, this.isGroup);
    this.parentBuilder.addClassName(className);
    return this;
  }

  end(): FiboBuilder {
    return this.parentBuilder;
  }
}
