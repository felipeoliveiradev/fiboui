import { type ReactElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Scaffold, Text, useScaffold } from '../src'

afterEach(() => cleanup())

function OpenDrawer() {
  const api = useScaffold()
  return <button type="button" onClick={() => api.openDrawer()}>open-drawer</button>
}

function Snack() {
  const api = useScaffold()
  return <button type="button" onClick={() => api.showSnackBar('Saved', { label: 'Undo', onPress: () => {} })}>show-snack</button>
}

function Sheet() {
  const api = useScaffold()
  return <button type="button" onClick={() => api.showSheet()}>show-sheet</button>
}

describe('Scaffold slots', () => {
  it('places the fab and keeps the drawer closed until opened', () => {
    const { container } = render(
      Scaffold()
        .fab(Text('add'))
        .fabAt('end')
        .drawer(Text('menu'))
        .children(<OpenDrawer />)
        .build() as ReactElement,
    )
    expect(container.querySelector('.fibo-fab-end')).toBeTruthy()
    const panel = screen.getByText('menu').closest('[data-scaffold-drawer]') as HTMLElement
    expect(panel.dataset.open).toBe('false')
    fireEvent.click(screen.getByText('open-drawer'))
    expect(panel.dataset.open).toBe('true')
    expect(container.querySelector('[data-scaffold-scrim]')?.getAttribute('data-open')).toBe('true')
  })

  it('shows a snack and a sheet without remounting the body', () => {
    let mounts = 0
    function Body() {
      mounts += 1
      return <Sheet />
    }
    const { container } = render(
      Scaffold()
        .bottomSheet(Text('sheet-body'))
        .footerButtons(Text('Save'))
        .children(<Body />)
        .build() as ReactElement,
    )
    expect(screen.getByText('Save')).toBeTruthy()
    const sheet = container.querySelector('[data-scaffold-sheet]') as HTMLElement
    expect(sheet.textContent).toContain('sheet-body')
    expect(sheet.hasAttribute('hidden')).toBe(true)
    const before = mounts
    fireEvent.click(screen.getByText('show-sheet'))
    expect(sheet.hasAttribute('hidden')).toBe(false)
    expect(mounts).toBe(before)
  })

  it('paints a snack bar from the handle', () => {
    render(
      Scaffold().children(<Snack />).build() as ReactElement,
    )
    fireEvent.click(screen.getByText('show-snack'))
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    expect(screen.getByRole('status')).toHaveTextContent('Undo')
  })

  it('marks extend and lifts for the keyboard', () => {
    const listeners = new Map<string, () => void>()
    const viewport = {
      height: 500,
      offsetTop: 0,
      addEventListener: (name: string, fn: () => void) => listeners.set(name, fn),
      removeEventListener: () => {},
    }
    const previous = window.visualViewport
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    const { container } = render(
      Scaffold().extendBody().extendBehindHeader().children(Text('body')).build() as ReactElement,
    )
    const host = container.querySelector('.fibo-scaffold') as HTMLElement
    expect(host.dataset.extendBody).toBe('true')
    expect(host.dataset.extendHeader).toBe('true')
    expect(host.dataset.keyboard).toBe('on')
    listeners.get('resize')?.()
    expect(host.style.paddingBottom).toContain('300')
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: previous })
  })
})
