import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';

/** Browser view needs scripts. Applied only when the iframe src is https. */
const HTTPS_SANDBOX = 'allow-scripts allow-same-origin allow-popups';

class WebViewBuilder extends FiboBuilder {
  private _src = '';
  private _title = '';

  src(value: string): this {
    this._src = typeof value === 'string' ? value : '';
    return this;
  }

  title(value: string): this {
    this._title = typeof value === 'string' ? value : '';
    return this;
  }

  build(): ReactElement {
    const src = this._src && !isDangerousUrl(this._src) ? this._src : undefined;
    const https = typeof src === 'string' && /^https:/i.test(src.trim());

    return React.createElement('iframe', {
      className: `fibo-webview ${this.getClassName()}`.trim(),
      style: this.getStyle(),
      src,
      title: this._title || undefined,
      sandbox: https ? HTTPS_SANDBOX : undefined,
    });
  }
}

export const WebView = createBuilder(WebViewBuilder);
