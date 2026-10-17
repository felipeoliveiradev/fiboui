import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ShareLink } from '../src/interactive/ShareLink'

function stubShare(share: Navigator['share'] | undefined) {
  Object.defineProperty(navigator, 'share', {
    configurable: true,
    writable: true,
    value: share,
  })
}

afterEach(() => {
  cleanup()
  Reflect.deleteProperty(navigator, 'share')
})

describe('ShareLink', () => {
  it('calls navigator.share with the url', () => {
    const share = vi.fn(() => Promise.resolve())
    stubShare(share)

    render(
      ShareLink().url('https://fiboui.vercel.app').title('Fibo').label('Share') as never,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    expect(share).toHaveBeenCalledWith({
      url: 'https://fiboui.vercel.app',
      title: 'Fibo',
    })
  })

  it('copies the url when navigator.share is missing', () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubShare(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    render(ShareLink().url('https://fiboui.vercel.app').label('Share') as never)
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))

    expect(writeText).toHaveBeenCalledWith('https://fiboui.vercel.app')
  })

  it('disables javascript urls', () => {
    const share = vi.fn(() => Promise.resolve())
    stubShare(share)

    render(ShareLink().url('javascript:alert(1)').label('Share') as never)

    const button = screen.getByRole('button', { name: 'Share' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(share).not.toHaveBeenCalled()
  })
})
