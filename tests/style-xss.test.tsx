import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { FiboStyles, getStyleTag } from '../src';
import { StyleManager } from '../src/core/styleManager';

describe('style tag XSS (</style> breakout)', () => {
  afterEach(() => {
    StyleManager.resetForTests();
  });

  it('getStyleTag escapes </style> in registered CSS', () => {
    StyleManager.getInstance().register('color', '</style><script>alert(1)</script>');
    const tag = getStyleTag();
    expect(tag.toLowerCase()).not.toMatch(/<\/style>\s*<script>/);
    expect(tag).toContain('<\\/style');
  });

  it('FiboStyles SSR HTML does not break out of the style element', () => {
    StyleManager.getInstance().register('color', '</style><script>alert(1)</script>');
    const html = renderToString(createElement(FiboStyles));
    expect(html.toLowerCase()).not.toMatch(/<\/style>\s*<script>/);
    expect(html).toContain('<\\/style');
  });
});
