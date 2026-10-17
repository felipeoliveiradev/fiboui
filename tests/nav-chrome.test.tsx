import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
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

  it('TabView shows the selected panel', () => {
    render(
      TabView()
        .tabs([
          { value: 'a', label: 'One', child: Text('Alpha') },
          { value: 'b', label: 'Two', child: Text('Beta') },
        ])
        .value('a')
        .onChange(() => {}),
    )
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
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
