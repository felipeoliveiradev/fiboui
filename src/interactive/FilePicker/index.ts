import React, { ReactElement, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface FilePickerViewProps {
  label: string;
  accept?: string;
  multiple: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (files: File[]) => void;
}

const FilePickerView = React.memo(function FilePickerView(props: FilePickerViewProps) {
  const input = useRef<HTMLInputElement>(null);

  function choose(list: FileList | null) {
    props.onChange?.(Array.from(list ?? []));
  }

  return React.createElement(
    'div',
    {
      className: ['fibo-file', props.className].filter(Boolean).join(' '),
      style: { display: 'flex', flexDirection: 'column', gap: 8, ...props.style },
    },
    React.createElement('input', {
      ref: input,
      className: 'fibo-file-input',
      type: 'file',
      accept: props.accept,
      multiple: props.multiple,
      hidden: true,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => choose(event.target.files),
    }),
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'fibo-file-trigger',
        onClick: () => input.current?.click(),
        style: {
          alignSelf: 'flex-start',
          border: '1px solid #334155',
          background: '#0F172A',
          color: '#E2E8F0',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer',
        },
      },
      props.label,
    ),
  );
});

class FilePickerBuilder extends FiboBuilder {
  private _label = 'Choose files';
  private _accept?: string;
  private _multiple = false;
  private _onChange?: (files: File[]) => void;

  label(text: string): this {
    this._label = text;
    return this;
  }

  accept(types: string): this {
    this._accept = types;
    return this;
  }

  multiple(value = true): this {
    this._multiple = value;
    return this;
  }

  onChange(handler: (files: File[]) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(FilePickerView, {
      label: this._label,
      accept: this._accept,
      multiple: this._multiple,
      onChange: this._onChange,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const FilePicker = createBuilder(FilePickerBuilder);

export interface FilePickerProps extends BaseProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
}
