import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Text } from '../src/content/Text'
import { Anchor } from '../src/navigation/Anchor'
import { BottomBar } from '../src/navigation/BottomBar'
import { Breadcrumbs } from '../src/navigation/Breadcrumbs'
import { TabView } from '../src/navigation/TabView'

afterEach(cleanup)

describe('nav chrome', () => {
  it('Anchor renders a with href', () => {
    render(Anchor('Docs').href('https://example.com').target('_blank'))
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('Anchor drops a javascript href', () => {
    render(Anchor('Docs').href('javascript:alert(1)'))
    const link = screen.getByText('Docs')
    expect(link.tagName).toBe('A')
    expect(link.getAttribute('href')).toBeNull()
  })

  it('TabView shows the selected panel (keepAlive keeps neighbors mounted)', () => {
    const { container } = render(
      TabView()
        .tabs([
          { value: 'a', label: 'One', child: Text('Alpha') },
          { value: 'b', label: 'Two', child: Text('Beta') },
        ])
        .value('a')
        .barPosition('bottom')
        .onChange(() => {}),
    )
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    const panels = container.querySelectorAll('[role="tabpanel"]')
    expect(panels[0]).toHaveAttribute('aria-hidden', 'false')
    expect(panels[1]).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.fibo-tabview-list')).toHaveAttribute('data-bar-position', 'bottom')
  })

  it('TabView.swipe track uses CSS transform for the active index', () => {
    const { container } = render(
      TabView()
        .tabs([
          { value: 'a', label: 'One', child: Text('Alpha') },
          { value: 'b', label: 'Two', child: Text('Beta') },
        ])
        .value('b')
        .swipe(true)
        .onChange(() => {}),
    )
    const track = container.querySelector('.fibo-tabview-track') as HTMLElement
    expect(track.style.transform).toContain('-100%')
  })

  /** jsdom has no PointerEvent — stamp coords onto a cancelable Event (same as w8-02). */
  function firePointer(
    el: Element,
    type: 'pointerdown' | 'pointermove' | 'pointerup',
    init: {
      pointerId: number
      clientX: number
      clientY: number
      pointerType?: 'mouse' | 'touch' | 'pen'
    },
  ) {
    const ev = new Event(type, { bubbles: true, cancelable: true })
    Object.assign(ev, {
      pointerId: init.pointerId,
      clientX: init.clientX,
      clientY: init.clientY,
      button: 0,
      buttons: 1,
      pointerType: init.pointerType ?? 'touch',
    })
    el.dispatchEvent(ev)
  }

  it('TabView swipe does not capture on pointerdown (nested taps stay live)', () => {
    const onTap = vi.fn()
    const onChange = vi.fn()
    const { container } = render(
      TabView()
        .swipe(true)
        .barPosition('none')
        .value('a')
        .onChange(onChange)
        .tabs([
          {
            value: 'a',
            label: 'One',
            child: Text('Poster').onTapGesture(onTap),
          },
          { value: 'b', label: 'Two', child: Text('Beta') },
        ]),
    )
    const viewport = container.querySelector('.fibo-tabview-viewport') as HTMLElement
    viewport.setPointerCapture = vi.fn()
    viewport.releasePointerCapture = vi.fn()
    const poster = screen.getByText('Poster')

    firePointer(poster, 'pointerdown', {
      pointerId: 1,
      clientX: 40,
      clientY: 40,
      pointerType: 'mouse',
    })
    expect(viewport.getAttribute('data-dragging')).toBeNull()
    expect(viewport.setPointerCapture).not.toHaveBeenCalled()

    firePointer(poster, 'pointerup', {
      pointerId: 1,
      clientX: 41,
      clientY: 40,
      pointerType: 'mouse',
    })
    expect(onTap).toHaveBeenCalledTimes(1)
    expect(onChange).not.toHaveBeenCalled()
    expect(viewport.getAttribute('data-dragging')).toBeNull()
  })

  it('TabView swipe arms only after horizontal touch intent past slop', () => {
    const onChange = vi.fn()
    const { container } = render(
      TabView()
        .swipe(true)
        .barPosition('none')
        .value('a')
        .onChange(onChange)
        .tabs([
          { value: 'a', label: 'One', child: Text('Alpha') },
          { value: 'b', label: 'Two', child: Text('Beta') },
        ]),
    )
    const viewport = container.querySelector('.fibo-tabview-viewport') as HTMLElement
    Object.defineProperty(viewport, 'clientWidth', { value: 320, configurable: true })
    viewport.setPointerCapture = vi.fn()
    viewport.releasePointerCapture = vi.fn()

    act(() => {
      firePointer(viewport, 'pointerdown', {
        pointerId: 2,
        clientX: 200,
        clientY: 80,
        pointerType: 'touch',
      })
    })
    expect(viewport.setPointerCapture).not.toHaveBeenCalled()

    // |dx| = 8 < arm slop (12)
    act(() => {
      firePointer(viewport, 'pointermove', {
        pointerId: 2,
        clientX: 192,
        clientY: 82,
        pointerType: 'touch',
      })
    })
    expect(viewport.setPointerCapture).not.toHaveBeenCalled()

    // |dx| = 40 — horizontal touch swipe armed
    act(() => {
      firePointer(viewport, 'pointermove', {
        pointerId: 2,
        clientX: 160,
        clientY: 84,
        pointerType: 'touch',
      })
    })
    expect(viewport.setPointerCapture).toHaveBeenCalled()
    expect(viewport.getAttribute('data-dragging')).toBe('true')

    act(() => {
      firePointer(viewport, 'pointerup', {
        pointerId: 2,
        clientX: 80,
        clientY: 84,
        pointerType: 'touch',
      })
    })
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('TabView mouse never arms swipe (even large drag)', () => {
    const onChange = vi.fn()
    const { container } = render(
      TabView()
        .swipe(true)
        .barPosition('none')
        .value('a')
        .onChange(onChange)
        .tabs([
          { value: 'a', label: 'One', child: Text('Alpha') },
          { value: 'b', label: 'Two', child: Text('Beta') },
        ]),
    )
    const viewport = container.querySelector('.fibo-tabview-viewport') as HTMLElement
    Object.defineProperty(viewport, 'clientWidth', { value: 320, configurable: true })
    viewport.setPointerCapture = vi.fn()
    viewport.releasePointerCapture = vi.fn()

    act(() => {
      firePointer(viewport, 'pointerdown', {
        pointerId: 3,
        clientX: 200,
        clientY: 80,
        pointerType: 'mouse',
      })
      firePointer(viewport, 'pointermove', {
        pointerId: 3,
        clientX: 40,
        clientY: 80,
        pointerType: 'mouse',
      })
      firePointer(viewport, 'pointerup', {
        pointerId: 3,
        clientX: 40,
        clientY: 80,
        pointerType: 'mouse',
      })
    })
    expect(viewport.setPointerCapture).not.toHaveBeenCalled()
    expect(onChange).not.toHaveBeenCalled()
    expect(viewport.getAttribute('data-dragging')).toBeNull()
  })

  it('Breadcrumbs last item has aria-current', () => {
    render(
      Breadcrumbs().items([
        { label: 'Home', href: '/' },
        { label: 'Inbox' },
      ]),
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
    expect(document.querySelector('ol')).not.toBeNull()
    const current = screen.getByText('Inbox')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current.tagName).not.toBe('A')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('BottomBar selected item has aria-current', () => {
    render(
      BottomBar()
        .items([
          { value: 'home', label: 'Home', onPress: () => {} },
          { value: 'mail', label: 'Mail' },
        ])
        .value('home'),
    )
    const nav = screen.getByRole('navigation')
    expect(getComputedStyle(nav).flexDirection === 'row' || nav.className.includes('fibo-bottom-bar')).toBe(true)
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page')
    expect(screen.getByText('Mail').getAttribute('aria-current')).toBeNull()
  })
})
