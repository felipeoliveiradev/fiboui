import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link, Router } from '../src';

afterEach(() => {
  cleanup();
});

function mount(to: string, extra?: Record<string, unknown>) {
  return render(
    <Router
      routes={[
        {
          path: '/',
          component: () => (
            <Link to={to} {...extra}>
              Go
            </Link>
          ),
        },
      ]}
    />
  );
}

describe('Link href sanitization', () => {
  it('strips javascript: href (XSS)', () => {
    mount('javascript:alert(1)');
    const a = screen.getByText('Go');
    expect(a.getAttribute('href') ?? '').not.toMatch(/javascript/i);
  });

  it('strips data: and vbscript: hrefs', () => {
    const { unmount } = mount('data:text/html,<script>alert(1)</script>');
    expect(screen.getByText('Go').getAttribute('href') ?? '').not.toMatch(/data:/i);
    unmount();
    mount('vbscript:msgbox(1)');
    expect(screen.getByText('Go').getAttribute('href') ?? '').not.toMatch(/vbscript/i);
  });

  it('strips javascript: with odd casing, whitespace, and BOM', () => {
    for (const to of ['JAVASCRIPT:alert(1)', '  javascript:alert(1)', '\tjavascript:alert(1)', '\uFEFFjavascript:alert(1)']) {
      const { unmount } = mount(to);
      expect(screen.getByText('Go').getAttribute('href') ?? '', to).not.toMatch(/javascript/i);
      unmount();
    }
  });

  it('does not SPA-navigate javascript: (click is cancelled)', () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    mount('javascript:alert(1)');
    expect(fireEvent.click(screen.getByText('Go'))).toBe(false);
    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });

  it('keeps http(s), protocol-relative, mailto, hash, and in-app paths', () => {
    const cases: Array<[string, string]> = [
      ['https://example.com/x', 'https://example.com/x'],
      ['http://example.com/x', 'http://example.com/x'],
      ['//cdn.example.com/y', '//cdn.example.com/y'],
      ['mailto:a@b.c', 'mailto:a@b.c'],
      ['#section', '#section'],
      ['/settings', '/settings'],
    ];
    for (const [to, href] of cases) {
      const { unmount } = mount(to);
      expect(screen.getByText('Go')).toHaveAttribute('href', href);
      unmount();
    }
  });

  it('rest.href cannot override a safe to', () => {
    mount('/ok', { href: 'javascript:alert(1)' });
    expect(screen.getByText('Go')).toHaveAttribute('href', '/ok');
    expect(screen.getByText('Go').getAttribute('href')).not.toMatch(/javascript/i);
  });

  it('target=_blank gets rel=noopener noreferrer (tabnabbing)', () => {
    mount('/blank', { target: '_blank' });
    const a = screen.getByText('Go');
    expect(a).toHaveAttribute('target', '_blank');
    const rel = a.getAttribute('rel') ?? '';
    expect(rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
  });

  it('preserves caller rel tokens when adding noopener', () => {
    mount('/blank', { target: '_blank', rel: 'nofollow' });
    const rel = (screen.getByText('Go').getAttribute('rel') ?? '').split(/\s+/);
    expect(rel).toEqual(expect.arrayContaining(['nofollow', 'noopener', 'noreferrer']));
  });
});
