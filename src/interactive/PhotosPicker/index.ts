import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface PhotosPickerViewProps {
  label: string;
  multiple: boolean;
  limit: number;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (files: File[]) => void;
}

const PhotosPickerView = React.memo(function PhotosPickerView(props: PhotosPickerViewProps) {
  const input = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  function choose(list: FileList | null) {
    const files = Array.from(list ?? []).filter((file) => file.type.startsWith('image/')).slice(0, props.limit);
    setPreviews((current) => {
      for (const preview of current) {
        if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(preview.url);
      }
      return files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    });
    props.onChange?.(files);
  }

  return React.createElement(
    'div',
    {
      className: ['fibo-photos', props.className].filter(Boolean).join(' '),
      style: { display: 'flex', flexDirection: 'column', gap: 8, ...props.style },
    },
    React.createElement('input', {
      ref: input,
      className: 'fibo-photos-input',
      type: 'file',
      accept: 'image/*',
      multiple: props.multiple,
      hidden: true,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => choose(event.target.files),
    }),
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'fibo-photos-trigger',
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
    previews.length > 0
      ? React.createElement(
          'div',
          {
            className: 'fibo-photos-grid',
            style: {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              gap: 8,
            },
          },
          ...previews.map((preview) =>
            React.createElement('img', {
              key: preview.url,
              className: 'fibo-photos-thumb',
              src: preview.url,
              alt: preview.name,
              style: { width: '100%', height: 72, objectFit: 'cover', borderRadius: 8 },
            }),
          ),
        )
      : null,
  );
});

class PhotosPickerBuilder extends FiboBuilder {
  private _label = 'Choose photos';
  private _multiple = true;
  private _limit = 12;
  private _onChange?: (files: File[]) => void;

  label(text: string): this {
    this._label = text;
    return this;
  }

  multiple(value = true): this {
    this._multiple = value;
    return this;
  }

  limit(count: number): this {
    if (Number.isFinite(count) && count > 0) this._limit = Math.floor(count);
    return this;
  }

  onChange(handler: (files: File[]) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, style: extraStyle, ...rest } = this._props;
    return React.createElement(PhotosPickerView, {
      label: this._label,
      multiple: this._multiple,
      limit: this._limit,
      onChange: this._onChange,
      className: [this.getClassName(), extraClass].filter(Boolean).join(' ') || undefined,
      style: { ...this.getStyle(), ...(extraStyle as React.CSSProperties | undefined) },
      ...rest,
    });
  }
}

export const PhotosPicker = createBuilder(PhotosPickerBuilder);

export interface PhotosPickerProps extends BaseProps {
  label?: string;
  multiple?: boolean;
  limit?: number;
  onChange?: (files: File[]) => void;
}
