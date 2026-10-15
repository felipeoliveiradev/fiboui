import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { getStyleTag } from 'fiboui';
import { App } from '../shared/App';

export function render(): { html: string; styles: string } {
  const html = renderToString(createElement(App));
  return { html, styles: getStyleTag() };
}
