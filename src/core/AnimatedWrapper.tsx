import { CSSProperties, ReactElement, cloneElement, useEffect, useState } from 'react';
import { AnimationOptions } from './animations';
import { Signal } from './state';

interface AnimatedWrapperProps {
  animatedProps: Map<string, Signal<any>>;
  animationConfig?: Partial<AnimationOptions>;
  children: ReactElement;
}

function readAnimatedValues(animatedProps: Map<string, Signal<any>>): Record<string, unknown> {
  const initial: Record<string, unknown> = {};
  animatedProps.forEach((signal, propName) => {
    initial[propName] = signal.value;
  });
  return initial;
}

export function AnimatedWrapper({ animatedProps, animationConfig, children }: AnimatedWrapperProps) {
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
  if (transforms.translateX !== undefined) {
    transformParts.push(`translateX(${transforms.translateX}px)`);
  }
  if (transforms.translateY !== undefined) {
    transformParts.push(`translateY(${transforms.translateY}px)`);
  }
  if (transforms.scale !== undefined) {
    transformParts.push(`scale(${transforms.scale})`);
  }
  if (transforms.rotate !== undefined) {
    transformParts.push(`rotate(${transforms.rotate}deg)`);
  }

  const animatedStyle: CSSProperties = {};

  if (transformParts.length > 0) {
    animatedStyle.transform = transformParts.join(' ');
  }

  if (animationConfig) {
    const { duration = 300, curve = 'easeOut' } = animationConfig;
    const timingFunction = curve === 'spring'
      ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      : curve;
    animatedStyle.transition = `transform ${duration}ms ${timingFunction}`;
  }

  const mergedStyle = {
    ...children.props.style,
    ...animatedStyle
  };

  return cloneElement(children, { style: mergedStyle });
}
