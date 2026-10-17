import { describe, expect, it } from 'vitest';
import { isDangerousUrl, isNativeHref, isSafeOpenUrl, mergeRel } from '../src/core/safeUrl';

describe('isDangerousUrl', () => {
  it('flags javascript / data / vbscript / file', () => {
    expect(isDangerousUrl('javascript:alert(1)')).toBe(true);
    expect(isDangerousUrl('JAVASCRIPT:alert(1)')).toBe(true);
    expect(isDangerousUrl('  javascript:alert(1)')).toBe(true);
    expect(isDangerousUrl('\tjavascript:alert(1)')).toBe(true);
    expect(isDangerousUrl('\uFEFFjavascript:alert(1)')).toBe(true);
    expect(isDangerousUrl('data:text/html,<script>alert(1)</script>')).toBe(true);
    expect(isDangerousUrl('vbscript:msgbox(1)')).toBe(true);
    expect(isDangerousUrl('file:///etc/passwd')).toBe(true);
  });

  it('allows http(s), relative, mailto, hash', () => {
    expect(isDangerousUrl('https://example.com')).toBe(false);
    expect(isDangerousUrl('/settings')).toBe(false);
    expect(isDangerousUrl('#top')).toBe(false);
    expect(isDangerousUrl('mailto:a@b.c')).toBe(false);
    expect(isDangerousUrl('')).toBe(false);
  });
});

describe('isNativeHref', () => {
  it('treats http(s), protocol-relative, mailto, hash as native', () => {
    expect(isNativeHref('https://example.com/x')).toBe(true);
    expect(isNativeHref('//cdn.example.com/y')).toBe(true);
    expect(isNativeHref('mailto:a@b.c')).toBe(true);
    expect(isNativeHref('#section')).toBe(true);
  });

  it('does not treat javascript: as native', () => {
    expect(isNativeHref('javascript:alert(1)')).toBe(false);
    expect(isNativeHref('/settings')).toBe(false);
  });
});

describe('isSafeOpenUrl', () => {
  it('allows http(s) and relative; rejects javascript:', () => {
    expect(isSafeOpenUrl('https://example.com')).toBe(true);
    expect(isSafeOpenUrl('/docs')).toBe(true);
    expect(isSafeOpenUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeOpenUrl('mailto:a@b.c')).toBe(false);
  });
});

describe('mergeRel', () => {
  it('dedupes tokens', () => {
    expect(mergeRel('noopener', 'noopener noreferrer').split(/\s+/).sort()).toEqual([
      'noopener',
      'noreferrer',
    ]);
  });
});
