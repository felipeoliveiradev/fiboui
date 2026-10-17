import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from '../src/structure/Carousel';

afterEach(cleanup);

describe('Carousel', () => {
  it('Next calls onChange with index+1 and does not pass the last page', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const view = Carousel()
      .children(['One', 'Two'])
      .index(0)
      .onChange(onChange)
      .build() as React.ReactElement;

    const { container } = render(view);
    const track = container.querySelector('.fibo-carousel-track') as HTMLElement;
    expect(track.style.scrollSnapType).toBe('x mandatory');
    expect(track.style.overflowX).toBe('auto');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onChange).toHaveBeenCalledWith(1);

    onChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
