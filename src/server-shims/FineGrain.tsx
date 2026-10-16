import React, { ReactNode } from 'react';

/** RSC: no signal subscription — render the resolved child as-is. */
export function FineGrainText({ children }: { children?: ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

export function bindText(value: unknown) {
  return typeof value === 'function' ? (value as () => unknown)() : value;
}
