'use client';

import React, { ReactElement, useEffect, useRef } from 'react';
import { FiboBuilder, createBuilder } from '../../core/builder';

interface ParsedCombo {
  key: string;
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

interface ShortcutsInnerProps {
  combo: string;
  onFire?: () => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const MODIFIERS: Record<string, keyof Omit<ParsedCombo, 'key'>> = {
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  ctrl: 'ctrl',
  control: 'ctrl',
  alt: 'alt',
  option: 'alt',
  shift: 'shift',
};

export function parseShortcutCombo(combo: string): ParsedCombo {
  const parsed: ParsedCombo = {
    key: '',
    meta: false,
    ctrl: false,
    alt: false,
    shift: false,
  };

  for (const raw of combo.split('+')) {
    const part = raw.trim();
    if (!part) continue;
    const modifier = MODIFIERS[part.toLowerCase()];
    if (modifier) {
      parsed[modifier] = true;
      continue;
    }
    parsed.key = part.length === 1 ? part.toLowerCase() : part;
  }

  return parsed;
}

function isInputFocused(target: EventTarget | null): boolean {
  const active = typeof document !== 'undefined' ? document.activeElement : null;
  return isEditable(target) || isEditable(active);
}

function isEditable(node: EventTarget | null): boolean {
  if (!(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function comboMatches(event: KeyboardEvent, combo: ParsedCombo): boolean {
  if (!combo.key) return false;
  if (event.key.toLowerCase() !== combo.key.toLowerCase()) return false;
  if (event.metaKey !== combo.meta) return false;
  if (event.ctrlKey !== combo.ctrl) return false;
  if (event.altKey !== combo.alt) return false;
  if (event.shiftKey !== combo.shift) return false;
  return true;
}

function hintText(combo: string): string {
  return combo
    .split('+')
    .map((part) => {
      const token = part.trim();
      if (token.toLowerCase() === 'meta') return '⌘';
      return token.length === 1 ? token.toUpperCase() : token;
    })
    .join('');
}

const ShortcutsInner = React.memo(function ShortcutsInner(props: ShortcutsInnerProps) {
  const onFireRef = useRef(props.onFire);
  onFireRef.current = props.onFire;

  useEffect(() => {
    const parsed = parseShortcutCombo(props.combo);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (isInputFocused(event.target)) return;
      if (!comboMatches(event, parsed)) return;
      event.preventDefault();
      onFireRef.current?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [props.combo]);

  const className = ['fibo-shortcuts', props.className].filter(Boolean).join(' ');
  const hint = props.combo ? React.createElement('kbd', null, hintText(props.combo)) : null;

  if (!props.label) {
    return React.createElement(
      'span',
      {
        className,
        style: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', ...props.style },
        'aria-hidden': true,
        'data-combo': props.combo,
      },
      hint,
    );
  }

  return React.createElement(
    'span',
    {
      className,
      style: props.style,
      'data-combo': props.combo,
    },
    hint,
    props.label,
  );
});

class ShortcutsBuilder extends FiboBuilder {
  private _combo = '';
  private _onFire?: () => void;
  private _label?: string;

  combo(value: string): this {
    this._combo = value;
    return this;
  }

  onFire(handler: () => void): this {
    this._onFire = handler;
    return this;
  }

  label(text: string): this {
    this._label = text;
    return this;
  }

  build(): ReactElement {
    const { className: extraClass, key: _key, ...rest } = this._props;
    const className = [this.getClassName(), extraClass].filter(Boolean).join(' ');

    return React.createElement(ShortcutsInner, {
      ...rest,
      className: className || undefined,
      style: this.getStyle(),
      combo: this._combo,
      onFire: this._onFire,
      label: this._label,
    });
  }
}

export const Shortcuts = createBuilder(ShortcutsBuilder);
