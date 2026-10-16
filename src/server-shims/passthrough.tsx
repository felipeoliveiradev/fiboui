import React, { ReactElement, ReactNode } from 'react';

export function AnimatedWrapper({ children }: { children: ReactElement }) {
  return children;
}

export function Reveal({ children }: { children?: ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function ScrollProgress({ children }: { children: ReactElement }) {
  return children;
}

export function Presence({ children }: { children?: ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function ValueBinder() {
  return null;
}
