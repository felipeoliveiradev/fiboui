import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Textarea } from '../src/interactive/Textarea'

afterEach(cleanup)

describe('Textarea', () => {
  it('static error sets span id and aria-invalid on the control', () => {
    render(
      Textarea().name('bio').error('Required').label('Bio').placeholder('notes') as any
    )
    const control = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    const err = document.getElementById('fibo-err-bio')
    expect(err).toBeTruthy()
    expect(err?.id).toBe('fibo-err-bio')
    expect(err?.textContent).toBe('Required')
    expect(control.getAttribute('aria-invalid')).toBe('true')
    expect(control.getAttribute('aria-describedby')).toBe('fibo-err-bio')
  })

  it('resetStyle keeps rows instead of collapsing to 1lh', () => {
    render(Textarea().resetStyle().rows(6).placeholder('notes') as any)
    const ta = screen.getByPlaceholderText('notes') as HTMLTextAreaElement
    expect(ta.rows).toBe(6)
    expect(ta.closest('.fibo-textarea-container')?.className).toContain('fibo-reset')
    expect(ta.style.height).not.toBe('1lh')
  })

  it('resetStyle hug CSS does not force textarea to 1lh', () => {
    const css = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8')
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const blocks = withoutComments.split('}')
    for (const block of blocks) {
      if (/\.fibo-reset\s+textarea/.test(block) && /height\s*:\s*1lh/.test(block)) {
        throw new Error('textarea hug still forces height: 1lh')
      }
    }
    expect(withoutComments).toMatch(/\.fibo-reset\s+textarea/)
  })
})
