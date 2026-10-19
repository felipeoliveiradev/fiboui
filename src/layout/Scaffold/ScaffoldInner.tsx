'use client';

import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { ProviderContext } from '../../core/StateWrapper';
import { bindScaffold, createScaffoldHandle, scaffoldContext, type ScaffoldHandle } from './behavior';
import { renderScaffoldHost, type ScaffoldConfig } from './host';

type DrawerHost = HTMLElement & {
  __fiboOnDrawer?: ScaffoldConfig['onDrawerChanged'];
};

export const ScaffoldInner = React.memo((props: ScaffoldConfig) => {
  const parentProviders = useContext(ProviderContext);
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<ScaffoldHandle | null>(null);
  if (!handleRef.current) handleRef.current = createScaffoldHandle(rootRef);

  useLayoutEffect(() => {
    const root = rootRef.current as DrawerHost | null;
    if (root) root.__fiboOnDrawer = props.onDrawerChanged;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return bindScaffold(root);
  }, []);

  return React.createElement(
    scaffoldContext.Provider,
    { value: handleRef.current },
    renderScaffoldHost({ ...props, rootRef }, parentProviders),
  );
});
