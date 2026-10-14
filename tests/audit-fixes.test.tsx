import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Image, NavLink, Router, useProvider } from '../src';
import { ProviderWrapper } from '../src/core/StateWrapper';

describe('audit high/critical patches', () => {
  it('Image.foregroundStyle applies color', () => {
    render(Image('/logo.png').alt('logo').foregroundStyle('#ff00aa').build());
    const img = screen.getByAltText('logo');
    expect(['#ff00aa', 'rgb(255, 0, 170)']).toContain(img.style.color);
  });

  it('ProviderWrapper defaults so useProvider does not throw', () => {
    function Child() {
      const value = useProvider<string>('missing');
      return <span>{value ?? 'empty'}</span>;
    }

    render(
      <ProviderWrapper>
        <Child />
      </ProviderWrapper>
    );
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('NavLink active class follows Router currentPath', () => {
    render(
      <Router
        routes={[
          { path: '/', component: () => <NavLink to="/">Home</NavLink> },
        ]}
      />
    );
    expect(screen.getByText('Home').className).toMatch(/active/);
  });
});
