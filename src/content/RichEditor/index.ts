import React, { CSSProperties, ReactElement, useLayoutEffect, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

/** Drop `<script>` elements so stored markup cannot carry executable tags. */
export function stripScriptTags(html: string): string {
  if (typeof html !== 'string' || html.length === 0) return '';
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<script\b[^>]*>/gi, '');
}

function execCommand(command: 'bold' | 'italic'): void {
  const exec = (document as Document & { execCommand?: (commandId: string) => boolean }).execCommand;
  if (typeof exec !== 'function') return;
  exec.call(document, command);
}

interface RichEditorViewProps {
  html: string;
  onChange?: (html: string) => void;
  className?: string;
  style?: CSSProperties;
}

function RichEditorView({ html, onChange, className, style }: RichEditorViewProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const clean = stripScriptTags(html);
    if (surface.innerHTML !== clean) surface.innerHTML = clean;
  }, [html]);

  const storeHtml = () => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const clean = stripScriptTags(surface.innerHTML);
    if (surface.innerHTML !== clean) surface.innerHTML = clean;
    onChange?.(clean);
  };

  const apply = (command: 'bold' | 'italic') => {
    surfaceRef.current?.focus();
    execCommand(command);
    storeHtml();
  };

  return React.createElement(
    'div',
    { className, style },
    React.createElement(
      'div',
      { className: 'fibo-rich-editor-toolbar', role: 'toolbar', 'aria-label': 'Formatting' },
      React.createElement(
        'button',
        { type: 'button', onMouseDown: (event: React.MouseEvent) => event.preventDefault(), onClick: () => apply('bold') },
        'Bold'
      ),
      React.createElement(
        'button',
        { type: 'button', onMouseDown: (event: React.MouseEvent) => event.preventDefault(), onClick: () => apply('italic') },
        'Italic'
      )
    ),
    React.createElement('div', {
      ref: surfaceRef,
      className: 'fibo-rich-editor-surface',
      contentEditable: true,
      role: 'textbox',
      'aria-multiline': true,
      suppressContentEditableWarning: true,
      onInput: storeHtml,
    })
  );
}

class RichEditorBuilder extends FiboBuilder {
  private _html = '';
  private _onChange?: (html: string) => void;

  /** HTML shown in the editor. Script tags are removed before they are stored. */
  value(html: string): this {
    this._html = stripScriptTags(html);
    return this;
  }

  /** Called with the editor HTML after each edit. The argument never contains script tags. */
  onChange(handler: (html: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    return React.createElement(RichEditorView, {
      html: this._html,
      onChange: this._onChange,
      className: `fibo-rich-editor ${this.getClassName()}`.trim(),
      style: this.getStyle(),
    });
  }
}

export const RichEditor = createBuilder(RichEditorBuilder);
