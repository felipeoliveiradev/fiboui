import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { type ReactElement } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  App,
  analyze,
  hidden,
  nav,
  started,
} from '../examples/monetron/src/App'

const ROOT = resolve(__dirname, '..')

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8')
}

function resetMonetron() {
  started.value = false
  hidden.value = false
  analyze.value = false
  nav.value = 0
}

beforeEach(resetMonetron)
afterEach(() => {
  cleanup()
  resetMonetron()
})

function mountApp() {
  return render(App() as ReactElement)
}

describe('W15-04 Monetron leftover — icon-button a11y', () => {
  it('#eye is a named, tabbable toggle and Space/Enter masks live amounts', () => {
    mountApp()
    const eye = document.getElementById('eye')
    expect(eye, '#eye').toBeTruthy()
    expect(eye).toHaveAttribute('role', 'button')
    expect(eye).toHaveAttribute('tabindex', '0')
    expect(eye).toHaveAttribute('aria-label')
    expect(eye!.getAttribute('aria-label')).toMatch(/balance/i)
    expect(screen.getByRole('button', { name: /balance/i })).toBe(eye)

    expect(document.getElementById('wallet')?.textContent).toBe('$ 195,654.80')
    expect(document.getElementById('stat-saving')?.textContent).toBe('$44,770.00')

    act(() => {
      fireEvent.keyDown(eye!, { key: 'Enter' })
    })
    expect(hidden.value).toBe(true)
    expect(document.getElementById('wallet')?.textContent).toBe('$ ••••••')
    expect(document.getElementById('stat-saving')?.textContent).toBe('••••••')
    expect(document.getElementById('hold-stocks')?.textContent).toBe('••••••')
    expect(document.getElementById('total')?.textContent).toBe('••••')
    const eyeOn = document.getElementById('eye')
    expect(eyeOn).toHaveAttribute('aria-pressed', 'true')
    expect(eyeOn).toHaveAttribute('aria-label', 'Show balances')

    act(() => {
      fireEvent.keyDown(eyeOn!, { key: ' ' })
    })
    expect(hidden.value).toBe(false)
    expect(document.getElementById('wallet')?.textContent).toBe('$ 195,654.80')
    expect(document.getElementById('eye')).toHaveAttribute('aria-pressed', 'false')
    expect(document.getElementById('eye')).toHaveAttribute('aria-label', 'Hide balances')
  })

  it('dashboard nav tabs are named, tabbable, and keyboard-selectable', () => {
    mountApp()
    const labels = ['Overview', 'Analytics', 'Trends', 'Apps']
    for (let i = 0; i < 4; i++) {
      const el = document.getElementById(`nav-${i}`)
      expect(el, `#nav-${i}`).toBeTruthy()
      expect(el).toHaveAttribute('role', 'button')
      expect(el).toHaveAttribute('tabindex', '0')
      expect(screen.getByRole('button', { name: labels[i] })).toBe(el)
    }

    expect(document.getElementById('nav-2')).toHaveAttribute('aria-pressed', 'false')
    act(() => {
      fireEvent.keyDown(document.getElementById('nav-2')!, { key: 'Enter' })
    })
    expect(nav.value).toBe(2)
    expect(document.getElementById('nav-2')).toHaveAttribute('aria-pressed', 'true')
    expect(document.getElementById('nav-0')).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('W15-04 Monetron leftover — e2e must not crash off-box', () => {
  it('playwright spec and compare.py do not write /opt/cursor', () => {
    const spec = read('examples/monetron/e2e/monetron.spec.ts')
    const py = read('examples/monetron/scripts/compare.py')
    const pw = read('examples/monetron/playwright.config.ts')
    expect(spec).not.toMatch(/\/opt\/cursor/)
    expect(py).not.toMatch(/\/opt\/cursor/)
    expect(pw).not.toMatch(/\/opt\/cursor/)
  })

  it('playwright webServer uses vite (live), not preview-only dist', () => {
    const pw = read('examples/monetron/playwright.config.ts')
    expect(pw).toMatch(/command:\s*'npx vite --host 127\.0\.0\.1 --port 4175'/)
    expect(pw).not.toMatch(/vite preview/)
  })
})
