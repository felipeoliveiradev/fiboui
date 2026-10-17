'use client';

import {
  CSSProperties,
  ReactElement,
  ReactNode,
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useState,
} from 'react';
import { AnimationOptions } from './animations';
import { usePrefersReducedMotion } from './animationHooks';
import { resolveCssEase } from './easing';
import { Signal } from './state';

interface AnimatedWrapperProps {
  animatedProps: Map<string, Signal<any>>;
  animationConfig?: Partial<AnimationOptions>;
  children?: ReactNode;
}

function readAnimatedValues(animatedProps: Map<string, Signal<any>>): Record<string, unknown> {
  const initial: Record<string, unknown> = {};
  animatedProps.forEach((signal, propName) => {
    initial[propName] = signal.value;
  });
  return initial;
}

function finiteNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function asHostElement(children: ReactNode): ReactElement {
  if (isValidElement(children)) return children;
  return createElement('span', null, children);
}

export function AnimatedWrapper({ animatedProps, animationConfig, children }: AnimatedWrapperProps) {
  const reduce = usePrefersReducedMotion();
  const [transforms, setTransforms] = useState<Record<string, any>>(() =>
    readAnimatedValues(animatedProps)
  );

  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    animatedProps.forEach((signal, propName) => {
      const update = (value: any) => {
        setTransforms(prev => ({
          ...prev,
          [propName]: value
        }));
      };

      unsubscribers.push(signal.subscribe(update));
      update(signal.value);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [animatedProps]);

  const transformParts: string[] = [];
  const tx = finiteNumber(transforms.translateX);
  const ty = finiteNumber(transforms.translateY);
  const scale = finiteNumber(transforms.scale);
  const rotate = finiteNumber(transforms.rotate);
  if (tx !== undefined) transformParts.push(`translateX(${tx}px)`);
  if (ty !== undefined) transformParts.push(`translateY(${ty}px)`);
  if (scale !== undefined) transformParts.push(`scale(${scale})`);
  if (rotate !== undefined) transformParts.push(`rotate(${rotate}deg)`);

  const animatedStyle: CSSProperties = {};

  if (transformParts.length > 0) {
    animatedStyle.transform = transformParts.join(' ');
  }

  if (animationConfig && !reduce) {
    const { duration = 300, curve = 'easeOut', stiffness, damping } = animationConfig;
    const timingFunction = resolveCssEase(curve, { stiffness, damping });
    const dur = typeof duration === 'number' && Number.isFinite(duration) && duration >= 0 ? duration : 300;
    animatedStyle.transition = `transform ${dur}ms ${timingFunction}`;
  }

  const host = asHostElement(children);
  const mergedStyle = {
    ...host.props.style,
    ...animatedStyle
  };

  return cloneElement(host, { style: mergedStyle });
}
