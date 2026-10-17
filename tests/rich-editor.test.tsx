import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RichEditor } from '../src/content/RichEditor';

afterEach(cleanup);

describe('RichEditor', () => {
  it('textbox shows Hi', () => {
    const { getByRole } = render(
      RichEditor()
        .value('<p>Hi</p>')
        .onChange(() => {})
        .build()
    );
    const box = getByRole('textbox');
    expect(box.getAttribute('aria-multiline')).toBe('true');
    expect(box.getAttribute('contenteditable')).toBe('true');
    expect(box.textContent).toBe('Hi');
  });

  it('Bold and Italic call execCommand when available', () => {
    const exec = vi.fn(() => true);
    const previous = document.execCommand;
    document.execCommand = exec as typeof document.execCommand;
    try {
      const { getByRole } = render(RichEditor().value('<p>Hi</p>').build());
      fireEvent.click(getByRole('button', { name: 'Bold' }));
      fireEvent.click(getByRole('button', { name: 'Italic' }));
      expect(exec).toHaveBeenCalledWith('bold');
      expect(exec).toHaveBeenCalledWith('italic');
    } finally {
      document.execCommand = previous;
    }
  });

  it('strips script tags from stored html', () => {
    let stored = 'unset';
    const { getByRole } = render(
      RichEditor()
        .value('<p>Hi</p><script>alert(1)</script>')
        .onChange((html: string) => {
          stored = html;
        })
        .build()
    );
    const box = getByRole('textbox');
    expect(box.innerHTML.toLowerCase()).not.toContain('script');
    expect(box.textContent).toBe('Hi');

    box.innerHTML = '<p>Yo</p><script>alert(1)</script>';
    fireEvent.input(box);
    expect(stored.toLowerCase()).not.toContain('<script');
    expect(box.innerHTML.toLowerCase()).not.toContain('<script');
    expect(box.textContent).toBe('Yo');
  });
});
