import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextStableId, resetStableIds } from '../src/core/ids'
import { goHash, open } from '../src/core/platform'
import { endSsrRequest } from '../src/core/styleManager'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  resetStableIds()
})

describe('open() leftover XSS / scheme gate', () => {
  it('refuses javascript: with leading ZWSP / ZWNJ / ZWJ (isSafeOpenUrl strips Cf)', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null)
    open('\u200Bjavascript:alert(1)')
    open('\u200Cjavascript:alert(1)')
    open('\u200Djavascript:alert(1)')
    expect(spy).not.toHaveBeenCalled()
  })

  it('refuses file: URLs (same gate as isSafeOpenUrl)', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null)
    open('file:///etc/passwd')
    expect(spy).not.toHaveBeenCalled()
  })

  it('does not throw on non-string (SSR / bad caller)', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null)
    expect(() => open(undefined as unknown as string)).not.toThrow()
    expect(() => open(null as unknown as string)).not.toThrow()
    expect(spy).not.toHaveBeenCalled()
  })

  it('still opens http(s) and relative', () => {
    const spy = vi.spyOn(window, 'open').mockReturnValue(null)
    open('https://example.com')
    open('/docs')
    open('//cdn.example.com/x')
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy).toHaveBeenNthCalledWith(1, 'https://example.com', '_blank', 'noopener,noreferrer')
    expect(spy).toHaveBeenNthCalledWith(2, '/docs', '_blank', 'noopener,noreferrer')
    expect(spy).toHaveBeenNthCalledWith(3, '//cdn.example.com/x', '_blank', 'noopener,noreferrer')
  })
})

describe('open / goHash document+window guards', () => {
  it('open no-ops when window.open is missing (partial SSR polyfill)', () => {
    vi.stubGlobal('window', { location: { href: 'http://localhost/' } })
    expect(() => open('https://example.com')).not.toThrow()
  })

  it('goHash no-ops when document is undefined (SSR)', () => {
    vi.stubGlobal('document', undefined)
    expect(() => goHash('architecture')).not.toThrow()
  })
})

describe('nextStableId SSR reset', () => {
  it('endSsrRequest on Node rewinds so request N+1 matches a cold client', () => {
    resetStableIds()
    expect(nextStableId('gradient')).toBe('gradient-1')
    expect(nextStableId('gradient')).toBe('gradient-2')

    vi.stubGlobal('window', undefined)
    endSsrRequest()

    expect(nextStableId('gradient')).toBe('gradient-1')
  })
})
