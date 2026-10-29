import type { ReactNode } from 'react';

/**
 * RSC stand-in for `core/gestures/GestureBuilders`.
 * Fluent factories stay chainable. `wrap` returns children — no pointer hosts.
 */

export type GestureMask = 'all' | 'gesture' | 'subviews' | 'none';
export type TapLocation = { x: number; y: number };
export type MagnifyValue = { magnification: number; velocity?: number };
export type RotateValue = { radians: number; degrees: number };
export type DragAxis = 'free' | 'horizontal' | 'vertical';

export class GestureBuilder {
  enabled(_value = true): this {
    return this;
  }

  including(_mask: GestureMask): this {
    return this;
  }

  bubble(_value = true): this {
    return this;
  }

  onRecognized(_callback: () => void): this {
    return this;
  }

  wrap(children: ReactNode): ReactNode {
    return children;
  }
}

class ChainGesture extends GestureBuilder {
  count(_n: number): this {
    return this;
  }

  spatial(_value = true): this {
    return this;
  }

  onStart(_callback?: unknown): this {
    return this;
  }

  onUpdate(_callback?: unknown): this {
    return this;
  }

  onEnd(_callback?: unknown): this {
    return this;
  }

  onPressingChanged(_callback?: (pressing: boolean) => void): this {
    return this;
  }

  minimumDistance(_px: number): this {
    return this;
  }

  maximumDistance(_px: number): this {
    return this;
  }

  duration(_ms: number): this {
    return this;
  }

  axis(_value: DragAxis): this {
    return this;
  }
}

export class DragGestureBuilder extends ChainGesture {}
export class TapGestureBuilder extends ChainGesture {}
export class LongPressGestureBuilder extends ChainGesture {}
export class MagnifyGestureBuilder extends ChainGesture {}
export class RotateGestureBuilder extends ChainGesture {}

export class SimultaneousGestureBuilder extends GestureBuilder {
  constructor(private readonly gestures: GestureBuilder[]) {
    super();
  }

  wrap(children: ReactNode): ReactNode {
    let node = children;
    for (const gesture of this.gestures) {
      gesture.bubble(true);
      node = gesture.wrap(node);
    }
    return node;
  }
}

export class ExclusiveGestureBuilder extends GestureBuilder {
  constructor(private readonly gestures: GestureBuilder[]) {
    super();
  }

  wrap(children: ReactNode): ReactNode {
    let node = children;
    for (const gesture of this.gestures) {
      node = gesture.wrap(node);
    }
    return node;
  }
}

export class SequenceGestureBuilder extends GestureBuilder {
  constructor(
    private readonly first: GestureBuilder,
    private readonly second: GestureBuilder
  ) {
    super();
  }

  wrap(children: ReactNode): ReactNode {
    return this.second.wrap(this.first.wrap(children));
  }
}

export function DragGesture(options?: {
  minimumDistance?: number;
  axis?: DragAxis;
}): DragGestureBuilder {
  const builder = new DragGestureBuilder();
  if (options?.minimumDistance != null) builder.minimumDistance(options.minimumDistance);
  if (options?.axis != null) builder.axis(options.axis);
  return builder;
}

export function TapGesture(): TapGestureBuilder {
  return new TapGestureBuilder();
}

export function SpatialTapGesture(): TapGestureBuilder {
  return TapGesture().spatial(true);
}

export function LongPressGesture(options?: {
  duration?: number;
  maximumDistance?: number;
}): LongPressGestureBuilder {
  const builder = new LongPressGestureBuilder();
  if (options?.duration != null) builder.duration(options.duration);
  if (options?.maximumDistance != null) builder.maximumDistance(options.maximumDistance);
  return builder;
}

export function MagnifyGesture(): MagnifyGestureBuilder {
  return new MagnifyGestureBuilder();
}

export function MagnificationGesture(): MagnifyGestureBuilder {
  return MagnifyGesture();
}

export function RotateGesture(): RotateGestureBuilder {
  return new RotateGestureBuilder();
}

export function SimultaneousGesture(
  ...gestures: GestureBuilder[]
): SimultaneousGestureBuilder {
  return new SimultaneousGestureBuilder(gestures);
}

export function ExclusiveGesture(...gestures: GestureBuilder[]): ExclusiveGestureBuilder {
  return new ExclusiveGestureBuilder(gestures);
}

export function SequenceGesture(
  first: GestureBuilder,
  second: GestureBuilder
): SequenceGestureBuilder {
  return new SequenceGestureBuilder(first, second);
}
