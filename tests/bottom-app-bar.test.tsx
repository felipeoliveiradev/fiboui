import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { type ReactElement } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BottomAppBar, Scaffold, Text, ToolbarItem } from '../src'

afterEach(() => cleanup())

describe('BottomAppBar', () => {
  it('keeps three equal zones like AppBar', () => {
    const { container } = render(
      BottomAppBar()
        .items([
          ToolbarItem().leading().children(Text('L')),
          ToolbarItem().principal().children(Text('logo')),
          ToolbarItem().trailing().children(Text('R')),
        ])
        .build() as ReactElement,
    )
    expect(container.querySelector('.fibo-bottom-app-bar-leading')?.textContent).toContain('L')
    expect(container.querySelector('.fibo-bottom-app-bar-principal')?.textContent).toContain('logo')
    expect(container.querySelector('.fibo-bottom-app-bar-trailing')?.textContent).toContain('R')
    const principal = container.querySelector('.fibo-bottom-app-bar-principal') as HTMLElement
    expect(principal.style.justifyContent).toBe('center')
  })

  it('centers a lone principal item', () => {
    const { container } = render(
      BottomAppBar()
        .items([ToolbarItem().principal().children(Text('only'))])
        .build() as ReactElement,
    )
    expect(container.querySelectorAll('[data-toolbar-slot]')).toHaveLength(3)
    expect((container.querySelector('.fibo-bottom-app-bar-leading') as HTMLElement).dataset.empty).toBe(
      'true',
    )
  })

  it('Scaffold.bottomAppBar / bottomNavigationBar mounts the slot', () => {
    render(
      Scaffold()
        .bottomNavigationBar(
          BottomAppBar().items([ToolbarItem().principal().children(Text('tabs'))]),
        )
        .children(Text('body'))
        .build() as ReactElement,
    )
    expect(screen.getByText('tabs')).toBeInTheDocument()
    expect(document.querySelector('.fibo-scaffold-bottom-app-bar')).toBeTruthy()
    expect(document.querySelector('.fibo-scaffold-footer')).toBeNull()
  })

  it('floating capsule overlays the body instead of docking a full-width strip', () => {
    render(
      Scaffold()
        .bottomAppBar(
          BottomAppBar()
            .floating()
            .items([ToolbarItem().principal().children(Text('tabs'))]),
        )
        .children(Text('body'))
        .build() as ReactElement,
    )
    const bar = document.querySelector('.fibo-bottom-app-bar') as HTMLElement
    expect(bar.dataset.floating).toBe('true')
    expect(bar.closest('.fibo-scaffold-bottom')).toBeTruthy()

    const core = readFileSync(resolve(__dirname, '../src/styles/core.css'), 'utf8')
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8')
    expect(core).toContain(
      '.fibo-scaffold-bottom:has(.fibo-bottom-app-bar[data-floating=\'true\'])',
    )
    expect(core).toContain('pointer-events: none')
    expect(core).not.toContain('padding-bottom: 88px')
    expect(base).toContain('margin: 0 auto')
    expect(base).toContain('width: fit-content')
  })
})
