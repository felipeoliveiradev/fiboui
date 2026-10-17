import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Alert } from '../src/content/Alert'
import { interp, listSignal, signal } from '../src'

afterEach(cleanup)

function decorativeBlobs(root: ParentNode): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>('.fibo-alert [class*="pointer-events-none"]'),
  )
}

describe('W20-03 Alert decorative blobs are not announced', () => {
  it('paints three decorative blobs and hides them from the accessibility tree', () => {
    const { container } = render(
      Alert().title('Note').description('Body').intent('info').build(),
    )
    const blobs = decorativeBlobs(container)
    expect(blobs).toHaveLength(3)
    for (const blob of blobs) {
      expect(blob).toHaveAttribute('aria-hidden', 'true')
      expect(blob.textContent).toBe('')
    }
  })

  it('live region name is title/description, not empty blob groups', () => {
    render(Alert().title('Saved').description('All good').intent('success').build())
    const host = screen.getByRole('status', { name: /Saved/ })
    expect(host).toHaveTextContent('Saved')
    expect(host).toHaveTextContent('All good')
    expect(host.querySelectorAll('[aria-hidden="true"][class*="pointer-events-none"]').length).toBe(3)
  })

  it('SSR markup hides the blobs', () => {
    const html = renderToString(
      Alert().title('Boom').intent('error').build() as ReactElement,
    )
    expect(html).toContain('role="alert"')
    const blobHits = html.match(/pointer-events-none/g) ?? []
    expect(blobHits.length).toBe(3)
    expect(html).toMatch(/aria-hidden="true"[^>]*pointer-events-none|pointer-events-none[^>]*aria-hidden="true"/)
    const hiddenBlobs = html.match(/pointer-events-none[^>]*>/g) ?? []
    expect(hiddenBlobs.length).toBe(3)
    for (const tag of hiddenBlobs) {
      expect(tag).toMatch(/aria-hidden="true"/)
    }
  })
})

describe('W20-03 Alert leftover hunt still holds', () => {
  it('unknown intent does not crash and stays a polite status', () => {
    expect(() =>
      render(Alert().title('Chip').intent('nope' as 'info').build()),
    ).not.toThrow()
    const host = screen.getByRole('status', { name: /Chip/ })
    expect(host.className).not.toMatch(/\bundefined\b/)
    expect(host).toHaveAttribute('aria-live', 'polite')
  })

  it('title and description interp stay live, including the accessible name', () => {
    const todos = listSignal<{ title: string }>([])
    const name = signal('Ada')
    render(
      Alert()
        .title(`Open: ${todos.$length} ${interp(name)}`)
        .description(`left ${todos.$length}`)
        .intent('warning')
        .build(),
    )
    const host = screen.getByRole('alert')
    expect(screen.getByText('Open: 0 Ada')).toBeInTheDocument()
    expect(screen.getByText('left 0')).toBeInTheDocument()
    expect(host.getAttribute('aria-label') ?? host.textContent ?? '').toMatch(/Open: 0 Ada/)
    act(() => {
      todos.add({ title: 'A' })
      name.value = 'Bob'
    })
    expect(screen.getByText('Open: 1 Bob')).toBeInTheDocument()
    expect(screen.getByText('left 1')).toBeInTheDocument()
    expect(host.getAttribute('aria-label') ?? host.textContent ?? '').toMatch(/Open: 1 Bob/)
  })
})
