'use client';

import React, { useContext } from 'react';
import { ProviderContext } from '../../core/StateWrapper';
import { renderScaffoldHost, type ScaffoldConfig } from './host';

export const ScaffoldInner = React.memo((props: ScaffoldConfig) => {
  const parentProviders = useContext(ProviderContext);
  return renderScaffoldHost(props, parentProviders);
});
