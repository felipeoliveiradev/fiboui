import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';

class PdfViewBuilder extends FiboBuilder {
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

    return React.createElement('embed', {
      className: `fibo-pdf ${this.getClassName()}`.trim(),
      style: this.getStyle(),
      type: 'application/pdf',
      src,
      title: this._title || undefined,
    });
  }
}

export const PdfView = createBuilder(PdfViewBuilder);
