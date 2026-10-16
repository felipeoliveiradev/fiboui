import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Box, Image, NavLink, Router, useProvider } from '../src';
import { ProviderWrapper } from '../src/core/StateWrapper';
import { StyleManager } from '../src/core/styleManager';

describe('audit high/critical patches', () => {
  it('shadow(0) and shadow("0") register box-shadow none', () => {
    StyleManager.resetForTests();
    render(Box().shadow(0).children('a').build());
    expect(StyleManager.getInstance().getCss()).toMatch(/box-shadow:\s*none/);

    StyleManager.resetForTests();
    render(Box().shadow('0').children('b').build());
    expect(StyleManager.getInstance().getCss()).toMatch(/box-shadow:\s*none/);
    expect(StyleManager.getInstance().getCss()).not.toMatch(
      /box-shadow:\s*0 4px 6px/,
    );
  });

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
