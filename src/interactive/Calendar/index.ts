'use client';

import React, { ReactElement } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';
import { BaseProps } from '../../core/types';

export interface CalendarEvent {
  date: string;
  title: string;
}

interface CalendarInnerProps {
  month?: string;
  events?: CalendarEvent[];
  onSelect?: (date: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function parseMonth(month: string): { year: number; month: number } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  if (monthNumber < 1 || monthNumber > 12) return null;
  return { year, month: monthNumber };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

const CalendarInner = React.memo(function CalendarInner(props: CalendarInnerProps) {
  const parsed = parseMonth(props.month ?? '');
  const titlesByDate = new Map<string, string[]>();

  for (const event of props.events ?? []) {
    const titles = titlesByDate.get(event.date);
    if (titles) titles.push(event.title);
    else titlesByDate.set(event.date, [event.title]);
  }

  const days: React.ReactElement[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) =>
    React.createElement(
      'span',
      { key: `week-${index}`, className: 'fibo-calendar-weekday' },
      label,
    ),
  );
  if (parsed) {
    const lead = (new Date(parsed.year, parsed.month - 1, 1).getDay() + 6) % 7;
    for (let blank = 0; blank < lead; blank += 1) {
      days.push(React.createElement('span', { key: `pad-${blank}`, className: 'fibo-calendar-pad' }));
    }
    const count = daysInMonth(parsed.year, parsed.month);
    for (let day = 1; day <= count; day++) {
      const date = isoDate(parsed.year, parsed.month, day);
      const titles = titlesByDate.get(date) ?? [];
      const label = titles.length > 0 ? `${date} ${titles.join(', ')}` : date;
      days.push(
        React.createElement(
          'button',
          {
            key: date,
            type: 'button',
            className: 'fibo-calendar-day',
            'aria-label': label,
            'data-date': date,
            onClick: () => props.onSelect?.(date),
          },
          String(day),
          titles.map((title, index) =>
            React.createElement(
              'span',
              { key: `${date}-${index}`, className: 'fibo-calendar-event' },
              title
            )
          )
        )
      );
    }
  }

  return React.createElement(
    'div',
    {
      role: 'grid',
      className: props.className,
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        ...props.style,
      },
      'aria-label': 'Calendar',
    },
    days
  );
});

class CalendarBuilder extends FiboBuilder {
  private _month = '';
  private _events: CalendarEvent[] = [];
  private _onSelect?: (date: string) => void;

  month(value: string): this {
    this._month = value;
    return this;
  }

  events(items: CalendarEvent[]): this {
    this._events = items;
    return this;
  }

  onSelect(handler: (date: string) => void): this {
    this._onSelect = handler;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = ['fibo-calendar', this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(CalendarInner, {
      ...rest,
      className,
      style: this.getStyle(),
      month: this._month,
      events: this._events,
      onSelect: this._onSelect,
    });
  }
}

export const Calendar = createBuilder(CalendarBuilder);

export interface CalendarProps extends BaseProps {
  month?: string;
  events?: CalendarEvent[];
  onSelect?: (date: string) => void;
}
