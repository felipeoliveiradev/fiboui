import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Box,
  Edge,
  Scaffold,
  Text,
  transaction,
  withAnimation,
  withTransaction,
  type Transaction,
} from '../src'

afterEach(cleanup)

describe('safeAreaInset', () => {
  it('reserves a bottom bar without duplicating SafeArea class', () => {
    const { container } = render(
      Box()
        .safeAreaInset(Edge.bottom, Text('dock'))
        .children(Text('main'))
        .build()
    )
    const host = container.querySelector('.fibo-safe-area-inset') as HTMLElement
    expect(host.getAttribute('data-fibo-safe-area-inset')).toBe('bottom')
    expect(container.querySelector('.fibo-safe-area-inset-bar')).toBeTruthy()
    expect(screen.getByText('dock')).toBeTruthy()
    expect(screen.getByText('main')).toBeTruthy()
    // Not the pad-only SafeArea host
    expect(container.querySelector('.fibo-safe-area')).toBeNull()
  })

  it('puts top inset before body', () => {
    const { container } = render(
      Box()
        .safeAreaInset('top', Text('banner'))
        .children(Text('page'))
        .build()
    )
    const host = container.querySelector('.fibo-safe-area-inset')!
    const kids = Array.from(host.children)
    expect(kids[0].classList.contains('fibo-safe-area-inset-bar')).toBe(true)
    expect(kids[1].classList.contains('fibo-safe-area-inset-body')).toBe(true)
  })
})

describe('withAnimation / Transaction', () => {
  it('runs body and clears transaction after', () => {
    const box: { tx: Transaction | null } = { tx: null }
    withAnimation(() => {
      box.tx = transaction()
    })
    expect(box.tx?.animation).toBe(true)
    expect(transaction()).toBeNull()
  })

  it('withAnimation(false) skips VT but still scopes transaction', () => {
    const box: { tx: Transaction | null } = { tx: null }
    withAnimation(false, () => {
      box.tx = transaction()
    })
    expect(box.tx?.animation).toBe(false)
    expect(transaction()).toBeNull()
  })

  it('withTransaction nests and restores', () => {
    withTransaction({ animation: true }, () => {
      expect(transaction()?.animation).toBe(true)
      withTransaction({ animation: false }, () => {
        expect(transaction()?.animation).toBe(false)
      })
      expect(transaction()?.animation).toBe(true)
    })
    expect(transaction()).toBeNull()
  })
})

describe('navigationTitle (Scaffold → Header, no 6th bar)', () => {
  it('creates Header title via existing headerBar slot', () => {
    const { container } = render(
      Scaffold().navigationTitle('Settings').children(Text('content')).build()
    )
    expect(screen.getByText('Settings')).toBeTruthy()
    expect(container.querySelector('.fibo-header-title')).toBeTruthy()
    // Explicit headerBar wins
    const { container: c2 } = render(
      Scaffold()
        .headerBar(Text('Custom'))
        .navigationTitle('Ignored')
        .children(Text('x'))
        .build()
    )
    expect(screen.getByText('Custom')).toBeTruthy()
    expect(c2.textContent).not.toContain('Ignored')
  })

  it('builder.navigationTitle sets data attr only (no new chrome)', () => {
    const spy = vi.fn()
    void spy
    const { container } = render(
      Box().navigationTitle('Panel').children(Text('body')).build()
    )
    const host = container.querySelector('[data-fibo-navigation-title="Panel"]')
    expect(host).toBeTruthy()
    expect(container.querySelector('.fibo-header-title')).toBeNull()
  })
})
