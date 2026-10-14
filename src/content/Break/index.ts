import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

class BreakBuilder extends FiboBuilder {
  build(): ReactElement {
    return React.createElement('br', {
      className: this.getClassName() || undefined,
      style: this.getStyle(),
      ...this._props,
    });
  }
}

/** Line break — `Text('A').h1()` plus `Break()` plus `Text('B')` when pre-line is not enough. */
export const Break = createBuilder(BreakBuilder);
