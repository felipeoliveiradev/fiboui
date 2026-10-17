import { isValidElement, type ReactElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Icons } from '../src/core/icons';
import { Reveal } from '../src/core/Reveal';
import { ScrollProgress } from '../src/core/ScrollProgress';
import { ValueBinder } from '../src/core/ValueBinder';

afterEach(cleanup);

function renderSvg(node: ReactElement): SVGSVGElement {
  expect(isValidElement(node)).toBe(true);
  const { container } = render(node);
  const svg = container.querySelector('svg');
  expect(svg).toBeTruthy();
  return svg as SVGSVGElement;
}

const DECORATIVE = ['Heart', 'Eth', 'More', 'Clock', 'Info', 'Check', 'Search', 'Close'] as const;

describe('Icons catalog a11y', () => {
  it.each(DECORATIVE)('%s is decorative (aria-hidden, not tabbable)', (name) => {
    const svg = renderSvg(Icons[name] as ReactElement);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg.getAttribute('role')).not.toBe('img');
  });

  it('Verify is a named image, not a silent graphic', () => {
    const svg = renderSvg(Icons.Verify as ReactElement);
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg).toHaveAttribute('aria-label', 'Verified');
    expect(svg.getAttribute('aria-hidden')).not.toBe('true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(screen.getByRole('img', { name: 'Verified' })).toBe(svg);
  });
});

describe('Reveal leftover a11y', () => {
  it('does not hide children from the accessibility tree before IntersectionObserver', () => {
    render(
      <Reveal preset="fadeUp">
        <button type="button">Reveal me</button>
      </Reveal>
    );
    expect(screen.getByRole('button', { name: 'Reveal me' })).toBeTruthy();
  });
});

describe('ScrollProgress leftover a11y', () => {
  it('does not hide wrapped content or stamp a nameless progressbar', () => {
    render(
      <ScrollProgress>
        <div className="fibo-scroll-progress">
          <span>page body</span>
        </div>
      </ScrollProgress>
    );
    expect(screen.getByText('page body')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('ValueBinder leftover a11y', () => {
  it('renders consumer error UI without swallowing the message', () => {
    const signal = {
      value: { error: new Error('load failed') },
      subscribe: () => () => undefined,
    };
    render(
      <ValueBinder
        signal={signal}
        builder={() => <span>ok</span>}
        error={(err) => <p role="alert">{err instanceof Error ? err.message : 'err'}</p>}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('load failed');
    expect(screen.queryByText('ok')).toBeNull();
  });
});
