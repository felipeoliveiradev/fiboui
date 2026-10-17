import React, { ReactElement, ReactNode } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

const HEADING_RE = /^(#{1,6})[ \t]+(.*)$/;

function safeHttpHref(raw: string): string | null {
  const value = raw.trim();
  if (!value || /[\u0000-\u001F\s]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    return null;
  }
  return null;
}

function parseInline(source: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;
  let textStart = 0;
  let key = 0;

  const flush = (end: number) => {
    if (end > textStart) nodes.push(source.slice(textStart, end));
  };

  while (index < source.length) {
    if (source.startsWith('`', index)) {
      const end = source.indexOf('`', index + 1);
      if (end !== -1) {
        flush(index);
        nodes.push(
          React.createElement('code', { key: `${keyPrefix}-c${key++}` }, source.slice(index + 1, end))
        );
        index = end + 1;
        textStart = index;
        continue;
      }
    }

    if (source.startsWith('**', index)) {
      const end = source.indexOf('**', index + 2);
      if (end !== -1) {
        flush(index);
        nodes.push(
          React.createElement('strong', { key: `${keyPrefix}-b${key++}` }, source.slice(index + 2, end))
        );
        index = end + 2;
        textStart = index;
        continue;
      }
    }

    if (source[index] === '*' && !source.startsWith('**', index)) {
      const end = source.indexOf('*', index + 1);
      if (end !== -1) {
        flush(index);
        nodes.push(
          React.createElement('em', { key: `${keyPrefix}-i${key++}` }, source.slice(index + 1, end))
        );
        index = end + 1;
        textStart = index;
        continue;
      }
    }

    if (source[index] === '[') {
      const labelEnd = source.indexOf(']', index + 1);
      if (labelEnd !== -1 && source[labelEnd + 1] === '(') {
        const urlEnd = source.indexOf(')', labelEnd + 2);
        if (urlEnd !== -1) {
          const label = source.slice(index + 1, labelEnd);
          const href = safeHttpHref(source.slice(labelEnd + 2, urlEnd));
          flush(index);
          if (href) {
            nodes.push(
              React.createElement(
                'a',
                {
                  key: `${keyPrefix}-a${key++}`,
                  href,
                  rel: 'noopener noreferrer',
                },
                label
              )
            );
          } else {
            nodes.push(source.slice(index, urlEnd + 1));
          }
          index = urlEnd + 1;
          textStart = index;
          continue;
        }
      }
    }

    index += 1;
  }

  flush(source.length);
  return nodes;
}

function parseBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const heading = HEADING_RE.exec(line);
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      blocks.push(
        React.createElement(tag, { key: `md-${lineIndex}` }, parseInline(heading[2], `md-${lineIndex}`))
      );
      return;
    }
    if (line.trim() === '') return;
    blocks.push(
      React.createElement('p', { key: `md-${lineIndex}` }, parseInline(line, `md-${lineIndex}`))
    );
  });

  return blocks;
}

class MarkdownBuilder extends FiboBuilder {
  private _text = '';

  text(value: string): this {
    this._text = typeof value === 'string' ? value : '';
    return this;
  }

  build(): ReactElement {
    return React.createElement(
      'div',
      {
        className: `fibo-markdown ${this.getClassName()}`.trim(),
        style: this.getStyle(),
      },
      parseBlocks(this._text)
    );
  }
}

export const Markdown = createBuilder(MarkdownBuilder);
