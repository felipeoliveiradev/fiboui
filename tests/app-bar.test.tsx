import { type ReactElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AppBar, Scaffold, Text, ToolbarItem } from '../src'

afterEach(() => cleanup())

describe('AppBar', () => {
  it('places leading, principal and trailing items', () => {
    const { container } = render(
      AppBar()
        .items([
          ToolbarItem().leading().size({ height: 44 }).tooltip('Menu').openDrawer().children(Text('mark')),
          ToolbarItem().principal().children(Text('Ink')),
          ToolbarItem().trailing().size({ width: 84 }).tooltip('Go').onPress(() => {}).children(Text('GO')),
          ToolbarItem().trailing().children(Text('more')),
        ])
        .build() as ReactElement,
    )
    expect(container.querySelector('.fibo-app-bar-leading')?.textContent).toContain('mark')
    expect(container.querySelector('.fibo-app-bar-principal')?.textContent).toContain('Ink')
    const trailing = container.querySelector('.fibo-app-bar-trailing')
    expect(trailing?.textContent).toContain('GO')
    expect(trailing?.textContent).toContain('more')
    const menu = screen.getByRole('button', { name: 'Menu' }) as HTMLElement
    expect(menu.style.height).toBe('44px')
    expect(menu.style.width).toBe('')
    const go = screen.getByRole('button', { name: 'Go' }) as HTMLElement
    expect(go.style.width).toBe('84px')
    expect(go.style.height).toBe('')
    expect(screen.queryByRole('button', { name: 'Ink' })).toBeNull()
  })

  it('opens the drawer from the toolbar without remounting the body', () => {
    let mounts = 0
    function Body() {
      mounts += 1
      return Text('body').build() as ReactElement
    }
    const { container } = render(
      Scaffold()
        .drawer(Text('menu'))
        .appBar(
          AppBar().items([
            ToolbarItem().leading().tooltip('Menu').openDrawer().children(Text('mark')),
          ]),
        )
        .children(<Body />)
        .build() as ReactElement,
    )
    const panel = screen.getByText('menu').closest('[data-scaffold-drawer]') as HTMLElement
    expect(panel.dataset.open).toBe('false')
    const before = mounts
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(panel.dataset.open).toBe('true')
    expect(mounts).toBe(before)
    expect(container.querySelector('[data-scaffold-action="open-drawer"]')).toBeTruthy()
  })
})
