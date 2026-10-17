import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { Scaffold, Text, useProvider } from '../src'
import { PluginManager } from '../src/core/plugin/PluginManager'
import { ProviderWrapper } from '../src/core/StateWrapper'

afterEach(() => {
  cleanup()
  PluginManager.resetForTests()
})

function StoreProbe() {
  const store = useProvider<{ from: string }>('app-store')
  return <span data-testid="store">{store?.from ?? 'missing'}</span>
}

describe('W14-08 Scaffold host + locale a11y', () => {
  it('forwards id, aria-label, and data-testid onto the scaffold host', () => {
    const { container } = render(
      Scaffold()
        .id('app-shell')
        .props({ 'aria-label': 'Application', 'data-testid': 'scaffold-host' })
        .children(Text('body'))
        .build(),
    )
    const host = container.querySelector('.fibo-scaffold') as HTMLElement
    expect(host).toBeTruthy()
    expect(host).toHaveAttribute('id', 'app-shell')
    expect(host).toHaveAttribute('aria-label', 'Application')
    expect(host).toHaveAttribute('data-testid', 'scaffold-host')
    expect(screen.getByTestId('scaffold-host')).toBe(host)
  })

  it('stamps locale as lang on the host (SSR-safe)', () => {
    const html = renderToString(
      Scaffold().locale('pt-BR').children(Text('Olá')).build() as ReactElement,
    )
    expect(html).toMatch(/lang="pt-BR"/)
    expect(html).toContain('Olá')

    const { container } = render(
      Scaffold().locale('pt-BR').children(Text('Olá')).build(),
    )
    expect(container.querySelector('.fibo-scaffold')).toHaveAttribute('lang', 'pt-BR')
  })
})

describe('W14-08 Scaffold providers + overlays + chrome', () => {
  it('does not clobber ancestor ProviderWrapper values when locale/theme are set', () => {
    render(
      <ProviderWrapper
        providers={new Map<string, unknown>([['app-store', { from: 'parent' }]])}
      >
        {Scaffold()
          .locale('pt-BR')
          .theme('noir')
          .provider('locale-only', 'keep')
          .children(<StoreProbe />)
          .build()}
      </ProviderWrapper>,
    )
    expect(screen.getByTestId('store')).toHaveTextContent('parent')
  })

  it('keeps plugin overlays out of the flex column so main chrome does not shrink', () => {
    PluginManager.getInstance().registerOverlay(() => Text('toast-overlay'))
    const { container } = render(
      Scaffold().children(Text('body')).build(),
    )
    const host = container.querySelector('.fibo-scaffold') as HTMLElement
    const toast = screen.getByText('toast-overlay')
    const layer = toast.closest('.fibo-scaffold-overlays') as HTMLElement
    expect(layer).toBeTruthy()
    expect(layer.parentElement).toBe(host)
    expect(layer.style.position).toBe('absolute')
    expect(layer.style.pointerEvents).toBe('none')
    expect(layer.style.inset).toBe('0px')
    expect(host.children).toHaveLength(2)
  })

  it('does not let header, footer, or side chrome shrink in the flex shell', () => {
    render(
      Scaffold()
        .headerBar(Text('top'))
        .footerBar(Text('bot'))
        .sideBarLeft(Text('nav-l'))
        .sideBarRight(Text('nav-r'))
        .structure({
          header: { height: 56 },
          footer: { height: 40 },
          sidebarLeft: { width: 200 },
          sidebarRight: { width: 160 },
        })
        .children(Text('body'))
        .build(),
    )
    const header = screen.getByText('top').parentElement as HTMLElement
    const footer = screen.getByText('bot').parentElement as HTMLElement
    const left = screen.getByText('nav-l').parentElement as HTMLElement
    const right = screen.getByText('nav-r').parentElement as HTMLElement
    expect(header.style.flexShrink).toBe('0')
    expect(footer.style.flexShrink).toBe('0')
    expect(left.style.flexShrink).toBe('0')
    expect(right.style.flexShrink).toBe('0')
  })

  it('pins mode=over right sidebar to the edge like the left drawer', () => {
    render(
      Scaffold()
        .sideBarRight(Text('side-right'))
        .structure({ sidebarRight: { mode: 'over', width: 180 } })
        .children(Text('body'))
        .build(),
    )
    const nav = screen.getByText('side-right').parentElement as HTMLElement
    expect(nav.style.position).toBe('absolute')
    expect(nav.style.right).toBe('0px')
    expect(nav.style.top).toBe('0px')
    expect(nav.style.height).toBe('100%')
  })
})
