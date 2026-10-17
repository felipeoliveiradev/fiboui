import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { isDangerousUrl } from '../../core/safeUrl';
import { BaseProps } from '../../core/types';

interface ShareLinkViewProps {
  url: string;
  title: string;
  label: string;
  disabled: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function blockedShareUrl(url: string): boolean {
  return isDangerousUrl(url);
}

async function shareOrCopy(url: string, title: string): Promise<void> {
  const share = navigator.share;
  if (typeof share === 'function') {
    await share.call(navigator, { url, title });
    return;
  }
  await navigator.clipboard.writeText(url);
}

function ShareLinkView(props: ShareLinkViewProps) {
  return React.createElement(
    'button',
    {
      type: 'button',
      className: ['fibo-share-link', props.className].filter(Boolean).join(' '),
      style: props.style,
      disabled: props.disabled,
      onClick: () => {
        if (props.disabled || blockedShareUrl(props.url)) return;
        void shareOrCopy(props.url, props.title);
      },
    },
    props.label,
  );
}

class ShareLinkBuilder extends FiboBuilder {
  private _url = '';
  private _title = '';
  private _label = 'Share';

  url(value: string): this {
    this._url = value;
    return this;
  }

  title(value: string): this {
    this._title = value;
    return this;
  }

  label(value: string): this {
    this._label = value;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle } = this._props;
    return React.createElement(ShareLinkView, {
      url: this._url,
      title: this._title,
      label: this._label,
      disabled: blockedShareUrl(this._url),
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
    });
  }
}

export const ShareLink = createBuilder(ShareLinkBuilder);

export interface ShareLinkProps extends BaseProps {
  url?: string;
  title?: string;
  label?: string;
}
