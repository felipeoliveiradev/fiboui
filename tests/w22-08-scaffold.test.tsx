import { type ReactElement } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Scaffold, Text, interp, signal } from '../src'
import { PluginManager } from '../src/core/plugin/PluginManager'

afterEach(() => {
  cleanup()
  PluginManager.resetForTests()
})

function host(): HTMLElement {
  const el = document.querySelector('.fibo-scaffold')
  if (!(el instanceof HTMLElement)) throw new Error('missing .fibo-scaffold')
  return el
}

describe('W22-08 Scaffold leftover — appBar/body/fab slots vs children', () => {
  it('keeps headerBar, bottomAppBar, and plugin overlay when body is .props({ children })', () => {
    PluginManager.getInstance().registerOverlay(() => Text('fab-slot'))
    render(
      Scaffold()
        .headerBar(Text('app-bar'))
        .bottomAppBar(Text('bot-bar'))
        .sideBarLeft(Text('drawer-nav'))
        .props({ children: Text('body-from-props') })
        .build() as ReactElement,
    )

    expect(screen.getByText('app-bar')).toBeInTheDocument()
    expect(screen.getByText('bot-bar')).toBeInTheDocument()
    expect(screen.getByText('drawer-nav')).toBeInTheDocument()
    expect(screen.getByText('body-from-props')).toBeInTheDocument()
    expect(screen.getByText('fab-slot')).toBeInTheDocument()
    expect(host().querySelector('main')).toHaveTextContent('body-from-props')
    expect(screen.getByText('fab-slot').closest('.fibo-scaffold-overlays')).toBeTruthy()
  })

  it('puts .children() in main without dropping headerBar', () => {
    render(
      Scaffold()
        .headerBar(Text('app-bar'))
        .children(Text('body-children'))
        .build() as ReactElement,
    )
    expect(screen.getByText('app-bar')).toBeInTheDocument()
    expect(host().querySelector('main')).toHaveTextContent('body-children')
  })
})

describe('W22-08 Scaffold leftover — live interp in body and chrome slots', () => {
  it('string body children with interp() stay live', () => {
    const n = signal(1)
    render(
      Scaffold().children(`n=${interp(n)}`).id('sc-body-interp').build() as ReactElement,
    )
    expect(screen.getByText('n=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('n=2')).toBeInTheDocument()
    expect(document.getElementById('sc-body-interp')?.textContent).not.toMatch(/FIBO:/)
  })

  it('headerBar string with interp() stays live', () => {
    const n = signal(1)
    render(
      Scaffold()
        .headerBar(`bar=${interp(n)}`)
        .children(Text('body'))
        .build() as ReactElement,
    )
    expect(screen.getByText('bar=1')).toBeInTheDocument()
    act(() => {
      n.value = 2
    })
    expect(screen.getByText('bar=2')).toBeInTheDocument()
  })

  it('sideBarLeft string with interp() stays live', () => {
    const n = signal(3)
    render(
      Scaffold()
        .sideBarLeft(`nav=${interp(n)}`)
        .children(Text('body'))
        .build() as ReactElement,
    )
    expect(screen.getByText('nav=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('nav=4')).toBeInTheDocument()
  })

  it('.props({ children }) string with interp stays live in main', () => {
    const n = signal(3)
    render(
      Scaffold()
        .headerBar(Text('app-bar'))
        .props({ children: `p=${interp(n)}` })
        .build() as ReactElement,
    )
    expect(screen.getByText('app-bar')).toBeInTheDocument()
    expect(screen.getByText('p=3')).toBeInTheDocument()
    act(() => {
      n.value = 4
    })
    expect(screen.getByText('p=4')).toBeInTheDocument()
    expect(host().querySelector('main')).toHaveTextContent('p=4')
  })
})

describe('W22-08 Scaffold leftover — overflow, safe area, drawer stacking', () => {
  it('does not copy leftover overflow:hidden onto main', () => {
    const { container } = render(
      Scaffold().children(Text('body')).build() as ReactElement,
    )
    const main = container.querySelector('main') as HTMLElement
    expect(main.style.overflow).toBe('auto')
    expect(main.style.minWidth).toBe('0px')
    expect(main.style.minHeight).toBe('0px')
    expect(host().style.overflow).toBe('hidden')
  })

  it('pads the shell with env(safe-area-inset-*) so chrome is not under the notch', () => {
    render(Scaffold().children(Text('body')).build() as ReactElement)
    const el = host()
    const css = el.getAttribute('style') ?? ''
    expect(el.style.boxSizing).toBe('border-box')
    expect(el.style.paddingTop).toMatch(/fibo-safe-top|safe-area-inset-top/)
    expect(el.style.paddingRight).toMatch(/fibo-safe-right|safe-area-inset-right/)
    expect(el.style.paddingBottom).toMatch(/fibo-safe-bottom|safe-area-inset-bottom/)
    expect(el.style.paddingLeft).toMatch(/fibo-safe-left|safe-area-inset-left/)
    expect(css).toMatch(/safe-area-inset-top/)
    expect(css).toMatch(/safe-area-inset-right/)
    expect(css).toMatch(/safe-area-inset-bottom/)
    expect(css).toMatch(/safe-area-inset-left/)
  })

  it('isolates body stacking so a mode=over drawer paints above body descendants', () => {
    const { container } = render(
      Scaffold()
        .sideBarLeft(Text('drawer'))
        .structure({ sidebarLeft: { mode: 'over', width: 180 } })
        .children(Box().style({ zIndex: 50 }).children(Text('body-high-z')))
        .build() as ReactElement,
    )
    const main = container.querySelector('main') as HTMLElement
    const drawer = screen.getByText('drawer').parentElement as HTMLElement
    expect(main.style.position).toBe('relative')
    expect(main.style.zIndex).toBe('0')
    expect(drawer.style.position).toBe('absolute')
    expect(Number(drawer.style.zIndex)).toBeGreaterThan(Number(main.style.zIndex))
  })

  it('isolates body stacking for a mode=over right drawer', () => {
    const { container } = render(
      Scaffold()
        .sideBarRight(Text('drawer-r'))
        .structure({ sidebarRight: { mode: 'over', width: 160 } })
        .children(Text('body'))
        .build() as ReactElement,
    )
    const main = container.querySelector('main') as HTMLElement
    const drawer = screen.getByText('drawer-r').parentElement as HTMLElement
    expect(main.style.zIndex).toBe('0')
    expect(drawer.style.right).toBe('0px')
    expect(Number(drawer.style.zIndex)).toBeGreaterThan(Number(main.style.zIndex))
  })
})
