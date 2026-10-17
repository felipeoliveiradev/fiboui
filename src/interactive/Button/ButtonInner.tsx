'use client';

import React from 'react';
import { renderButtonHost } from './host';

export const ButtonInner = React.memo((props: any) => renderButtonHost(props, true));
