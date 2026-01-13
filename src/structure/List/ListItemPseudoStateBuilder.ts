import { _styleManager } from '../../core/styleManager';

export class ListItemPseudoStateBuilder {
  private styles: Map<string, string> = new Map();

  constructor() {

  }

  bg(color: string): this {
    this.styles.set('background-color', color);
    return this;
  }

  color(value: string): this {
    this.styles.set('color', value);
    return this;
  }

  opacity(value: number): this {
    this.styles.set('opacity', String(value));
    return this;
  }

  borderColor(value: string): this {
    this.styles.set('border-color', value);
    return this;
  }

  transform(value: string): this {
    this.styles.set('transform', value);
    return this;
  }

  scale(value: number): this {
    this.styles.set('transform', `scale(${value})`);
    return this;
  }

  translateX(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    this.styles.set('transform', `translateX(${finalValue})`);
    return this;
  }

  translateY(value: number | string): this {
    const finalValue = typeof value === 'number' ? `${value}px` : value;
    this.styles.set('transform', `translateY(${finalValue})`);
    return this;
  }

  shadow(value: string): this {
    this.styles.set('box-shadow', value);
    return this;
  }

  css(property: string, value: string): this {
    this.styles.set(property, value);
    return this;
  }

  toCSSString(): string {
    const cssProps: string[] = [];
    this.styles.forEach((value, property) => {
      cssProps.push(`${property}: ${value}`);
    });
    return cssProps.join('; ') + ';';
  }
}
