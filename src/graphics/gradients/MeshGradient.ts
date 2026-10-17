import React, { CSSProperties, ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

const ANCHORS = ['12% 18%', '88% 16%', '78% 82%', '18% 78%', '50% 46%', '36% 62%'];

function meshPaints(colors: unknown): string[] {
  const list = Array.isArray(colors)
    ? colors.filter((c): c is string => typeof c === 'string' && c.length > 0)
    : [];
  if (list.length >= 2) return list;
  const one = list[0];
  return [one ?? '#000000', one ?? '#ffffff'];
}

function meshLayers(colors: string[]): { image: string; color: string } {
  const paints = meshPaints(colors);
  const image = paints
    .map((color, index) => {
      const at = ANCHORS[index % ANCHORS.length];
      return `radial-gradient(circle at ${at}, ${color} 0%, transparent 62%)`;
    })
    .join(', ');
  return { image, color: paints[paints.length - 1] };
}

class MeshGradientBuilder extends FiboBuilder {
  private _colors: string[] = ['#ff6a2a', '#0b6e99'];

  colors(colors: string[]): this {
    this._colors = meshPaints(colors);
    return this;
  }

  build(): ReactElement {
    const mesh = meshLayers(this._colors);
    const { className: extraClass, style: propsStyle, dangerouslySetInnerHTML: _html, ...dom } = this._props;
    const incoming =
      propsStyle && typeof propsStyle === 'object' && !Array.isArray(propsStyle)
        ? (propsStyle as CSSProperties)
        : {};
    const style: CSSProperties = {
      ...this.getStyle(),
      backgroundColor: mesh.color,
      backgroundImage: mesh.image,
      ...incoming,
    };
    if (typeof style.backgroundImage !== 'string' || !style.backgroundImage.includes('radial-gradient')) {
      style.backgroundImage = mesh.image;
    }

    const className = ['fibo-mesh-gradient', ...this._classNames, extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement('div', {
      ...dom,
      role: dom.role ?? 'img',
      'aria-label': dom['aria-label'] ?? 'Mesh gradient',
      className,
      style,
    });
  }
}

export const MeshGradient = createBuilder(MeshGradientBuilder);
