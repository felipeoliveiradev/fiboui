import React, { ReactNode } from 'react';
import { FiboBuilder } from '../builder';
import { Gesture as GestureComponent } from './Gesture';
import { PanCallback } from './Pan';

export class GestureBuilder extends FiboBuilder {
  private _onPanStart?: PanCallback;
  private _onPanUpdate?: PanCallback;
  private _onPanEnd?: PanCallback;

  onPanStart(callback: PanCallback): this {
    this._onPanStart = callback;
    return this;
  }

  onPanUpdate(callback: PanCallback): this {
    this._onPanUpdate = callback;
    return this;
  }

  onPanEnd(callback: PanCallback): this {
    this._onPanEnd = callback;
    return this;
  }

  child(child: ReactNode): this {
    this._children = [child];
    return this;
  }

  build(): any {
    return React.createElement(GestureComponent, {
      key: this._props.key as React.Key | undefined,
      onPanStart: this._onPanStart,
      onPanUpdate: this._onPanUpdate,
      onPanEnd: this._onPanEnd,
      children: this._children[0]
    });
  }
}

export function Gesture(): GestureBuilder {
  return new GestureBuilder();
}
