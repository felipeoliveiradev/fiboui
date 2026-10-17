import { describe, expect, it } from 'vitest';
import { isBreakpointKey, toMediaQuery } from '../src/core/breakpoints';

describe('toMediaQuery: @media prefix must not leak into CSS', () => {
  it('strips @media when the query has no space after the at-keyword', () => {
    // CSS allows `@media(min-width: …)`. styleManager wraps as `@media ${q}`,
    // so a leftover prefix becomes invalid `@media @media(…)`.
    expect(toMediaQuery('@media(min-width: 900px)')).toBe('(min-width: 900px)');
  });

  it('strips @media case-insensitively', () => {
    expect(toMediaQuery('@MEDIA (min-width: 900px)')).toBe('(min-width: 900px)');
    expect(toMediaQuery('@Media(max-width: 10px)')).toBe('(max-width: 10px)');
  });

  it('resolves padded breakpoint keys after trim (same as named .md())', () => {
    expect(isBreakpointKey(' md '.trim())).toBe(true);
    expect(toMediaQuery(' md ')).toBe('(min-width: 768px)');
    expect(toMediaQuery('\tsm\n')).toBe('(min-width: 640px)');
  });
});
