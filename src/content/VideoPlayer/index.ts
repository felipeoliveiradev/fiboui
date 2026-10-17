import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';

class VideoPlayerBuilder extends FiboBuilder {
  private _src = '';
  private _poster = '';
  private _controls = false;

  src(value: string): this {
    this._src = typeof value === 'string' ? value : '';
    return this;
  }

  poster(value: string): this {
    this._poster = typeof value === 'string' ? value : '';
    return this;
  }

  controls(value = true): this {
    this._controls = Boolean(value);
    return this;
  }

  build(): ReactElement {
    const src = this._src && !isDangerousUrl(this._src) ? this._src : undefined;
    const poster = !isDangerousUrl(this._poster) ? this._poster : undefined;

    return React.createElement('video', {
      className: `fibo-video ${this.getClassName()}`.trim(),
      style: this.getStyle(),
      src,
      poster,
      controls: this._controls,
    });
  }
}

export const VideoPlayer = createBuilder(VideoPlayerBuilder);
