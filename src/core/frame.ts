import React, { ReactElement, CSSProperties } from 'react';
import {
  Size,
  StackAlign,
  stackAlignFlex,
  isSizeWord,
  sizeWordCss,
  type Size as SizeToken,
} from './tokens';

/** Fixed px, CSS length, `%`, or a {@link Size} word (`Size.infinity`, `Size.full`, …). */
export type FrameSize = number | string | SizeToken;

/**
 * SwiftUI `View.frame` — both overloads in one object.
 *
 * ```ts
 * .frame({ width: 300, height: 400 })
 * .frame({ maxWidth: Size.infinity, maxHeight: Size.infinity, alignment: StackAlign.topTrailing })
 * .frame({ maxWidth: Size.infinity, fill: true }) // child stretches — bg/border fill the slot
 * ```
 */
export interface FrameSpec {
  width?: FrameSize;
  height?: FrameSize;
  minWidth?: FrameSize;
  idealWidth?: FrameSize;
  maxWidth?: FrameSize;
  minHeight?: FrameSize;
  idealHeight?: FrameSize;
  maxHeight?: FrameSize;
  alignment?: StackAlign | keyof typeof StackAlign;
  /**
   * Stretch the direct child to the frame slot (`width/height: 100%`).
   * Default `false` — SwiftUI-like hug + `alignment`.
   * Use when paint (`.bg`, border) lives on the child and should fill the frame.
   */
  fill?: boolean;
}

function isInfinity(value: FrameSize | undefined): boolean {
  return value === Size.infinity || value === 'infinity';
}

/** Resolve a frame size to a CSS length. `Size.infinity` → fill parent (`100%`). */
export function resolveFrameSize(
  value: FrameSize | undefined,
  role: 'min' | 'ideal' | 'max' | 'fixed',
  axis: 'width' | 'height' = 'width'
): string | undefined {
  if (value == null) return undefined;
  if (isInfinity(value)) {
    // SwiftUI: max*.infinity = expand; min*.infinity → 0 so
    // (min:0, max:infinity) unconditionally accepts the proposal.
    if (role === 'min') return '0px';
    return '100%';
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}px`;
  }
  const raw = String(value);
  if (isSizeWord(raw)) {
    return sizeWordCss(raw, axis);
  }
  return raw;
}

export function isFixedNumericFrame(
  spec: FrameSpec
): spec is FrameSpec & { width: number; height: number } {
  if (spec.fill) return false;
  if (typeof spec.width !== 'number' || typeof spec.height !== 'number') {
    return false;
  }
  if (
    spec.minWidth != null ||
    spec.idealWidth != null ||
    spec.maxWidth != null ||
    spec.minHeight != null ||
    spec.idealHeight != null ||
    spec.maxHeight != null
  ) {
    return false;
  }
  if (spec.alignment == null) return true;
  return resolveAlign(spec.alignment) === StackAlign.center;
}

function resolveAlign(align: FrameSpec['alignment']): StackAlign {
  if (align == null) return StackAlign.center;
  if (typeof align === 'string' && align in StackAlign) {
    return StackAlign[align as keyof typeof StackAlign];
  }
  return align as StackAlign;
}

function frameHostStyle(spec: FrameSpec): CSSProperties {
  const flex = stackAlignFlex(resolveAlign(spec.alignment));
  const style: CSSProperties = {
    boxSizing: 'border-box',
    display: 'flex',
    minWidth: 0,
    minHeight: 0,
    // `fill` stretches the child — host uses stretch instead of corner align.
    alignItems: (spec.fill
      ? 'stretch'
      : flex.alignItems) as CSSProperties['alignItems'],
    justifyContent: (spec.fill
      ? 'flex-start'
      : flex.justifyContent) as CSSProperties['justifyContent'],
  };

  const maxW = resolveFrameSize(spec.maxWidth, 'max', 'width');
  const maxH = resolveFrameSize(spec.maxHeight, 'max', 'height');
  const minW = resolveFrameSize(spec.minWidth, 'min', 'width');
  const minH = resolveFrameSize(spec.minHeight, 'min', 'height');
  const idealW = resolveFrameSize(spec.idealWidth ?? spec.width, 'ideal', 'width');
  const idealH = resolveFrameSize(spec.idealHeight ?? spec.height, 'ideal', 'height');

  if (minW != null) style.minWidth = minW;
  if (minH != null) style.minHeight = minH;
  if (maxW != null) style.maxWidth = maxW;
  if (maxH != null) style.maxHeight = maxH;

  if (idealW != null) style.width = idealW;
  else if (isInfinity(spec.maxWidth)) style.width = '100%';

  if (idealH != null) style.height = idealH;
  else if (isInfinity(spec.maxHeight)) style.height = '100%';

  if (
    isInfinity(spec.maxWidth) &&
    (spec.minWidth == null || isInfinity(spec.minWidth) || spec.minWidth === 0)
  ) {
    style.minWidth = '0px';
    style.width = '100%';
  }
  if (
    isInfinity(spec.maxHeight) &&
    (spec.minHeight == null || isInfinity(spec.minHeight) || spec.minHeight === 0)
  ) {
    style.minHeight = '0px';
    style.height = '100%';
  }

  return style;
}

const FILL_CHILD_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
  boxSizing: 'border-box',
  flex: '1 1 auto',
  alignSelf: 'stretch',
};

/** Stretch the framed child so paint (bg/border) fills the slot. */
function applyFillToChild(child: ReactElement): ReactElement {
  if (!React.isValidElement(child)) return child;
  const props = child.props as { style?: CSSProperties };
  return React.cloneElement(child as ReactElement<{ style?: CSSProperties }>, {
    style: {
      ...props.style,
      ...FILL_CHILD_STYLE,
    },
  });
}

/** Invisible SwiftUI-style frame wrapper around a built host element. */
export function wrapFrame(child: ReactElement, spec: FrameSpec): ReactElement {
  const content = spec.fill ? applyFillToChild(child) : child;
  return React.createElement(
    'div',
    {
      className: 'fibo-frame',
      'data-fibo-frame': resolveAlign(spec.alignment),
      'data-fibo-fill': spec.fill ? 'true' : undefined,
      style: frameHostStyle(spec),
    },
    content
  );
}
