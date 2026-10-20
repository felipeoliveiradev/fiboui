import { describe, expect, it } from 'vitest'
import { compileParts, renderParts, signal } from '../src/core/state'

describe('compileParts', () => {
  it('splits "Pontos 0" when the signal value is 0', () => {
    const n = signal(0)
    const parts = compileParts('Pontos 0', [n])
    expect(parts).not.toBeNull()
    expect(renderParts(parts!)).toBe('Pontos 0')
  })

  it('returns null when the same numeric string appears twice', () => {
    const n = signal(0)
    expect(compileParts('0 pontos: 0', [n])).toBeNull()
  })

  it('rejects toFixed output when String(value) only partially matches', () => {
    const n = signal(1.5)
    expect(compileParts('€ 1.50', [n])).toBeNull()
  })

  it('matches peeked values that stringify uniquely in the result', () => {
    const n = signal(42)
    const parts = compileParts('Score: 42 pts', [n])
    expect(parts).not.toBeNull()
    expect(renderParts(parts!)).toBe('Score: 42 pts')
  })
})
