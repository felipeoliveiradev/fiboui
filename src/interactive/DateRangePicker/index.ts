'use client';

import React, { ReactElement, useState } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

interface DateRangePickerInnerProps {
  start?: string;
  end?: string;
  onChange?: (start: string, end: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function orderedRange(start: string, end: string): [string, string] {
  if (start && end && end < start) return [end, start];
  return [start, end];
}

const DateRangePickerInner = React.memo(function DateRangePickerInner(
  props: DateRangePickerInnerProps
) {
  const startId = React.useId();
  const endId = React.useId();
  const [start, setStart] = useState(props.start ?? '');
  const [end, setEnd] = useState(props.end ?? '');

  const commit = (nextStart: string, nextEnd: string) => {
    const [orderedStart, orderedEnd] = orderedRange(nextStart, nextEnd);
    setStart(orderedStart);
    setEnd(orderedEnd);
    props.onChange?.(orderedStart, orderedEnd);
  };

  const startInput = React.createElement('input', {
    id: startId,
    type: 'date',
    className: 'fibo-date-range-picker-start',
    value: start,
    'aria-label': 'Start',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      commit(event.target.value, end);
    },
  });

  const endInput = React.createElement('input', {
    id: endId,
    type: 'date',
    className: 'fibo-date-range-picker-end',
    value: end,
    'aria-label': 'End',
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      commit(start, event.target.value);
    },
  });

  return React.createElement(
    'div',
    { className: props.className, style: props.style },
    startInput,
    endInput
  );
});

class DateRangePickerBuilder extends FiboBuilder {
  private _start = '';
  private _end = '';
  private _onChange?: (start: string, end: string) => void;

  start(iso: string): this {
    this._start = iso;
    return this;
  }

  end(iso: string): this {
    this._end = iso;
    return this;
  }

  onChange(handler: (start: string, end: string) => void): this {
    this._onChange = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-date-range-picker', this.getClassName(), extraClass]
      .filter(Boolean)
      .join(' ');

    return React.createElement(DateRangePickerInner, {
      ...rest,
      className,
      style: this.getStyle(),
      start: this._start,
      end: this._end,
      onChange: this._onChange,
    });
  }
}

export const DateRangePicker = createBuilder(DateRangePickerBuilder);

export interface DateRangePickerProps extends BaseProps {
  start?: string;
  end?: string;
  onChange?: (start: string, end: string) => void;
}
