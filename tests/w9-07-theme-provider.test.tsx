import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { FiboThemeProvider, useFiboTheme } from '../src/theme/provider'
import { Brightness, ThemeType } from '../src/theme/colorEnums'
import { materialTheme } from '../src/theme/material'
import { noirTheme } from '../src/theme/noir'
import { ThemeProvider, useTheme } from '../src/theme/useTheme'

afterEach(() => {
  cleanup()
})

function cssVar(el: Element, name: string): string {
  return (el as HTMLElement).style.getPropertyValue(name).trim()
}

describe('FiboThemeProvider vs base.css --fibo-theme', () => {
  it('stamps --fibo-theme matching base.css material on the default root', () => {
    const base = readFileSync(resolve(__dirname, '../src/styles/base.css'), 'utf8')
    expect(base).toMatch(/--fibo-theme:\s*'material'/)

    const html = renderToString(
      <FiboThemeProvider>
        <span>body</span>
      </FiboThemeProvider>,
    )
    expect(html).toMatch(/--fibo-theme:\s*material/)
    expect(html).toContain('fibo-theme-material')
    expect(html).toContain('data-fibo-theme="material"')
  })

  it('setTheme noir flips --fibo-theme and token CSS vars (dark)', () => {
    function Flip() {
      const { setTheme } = useFiboTheme()
      return (
        <button type="button" onClick={() => setTheme('noir')}>
          dark
        </button>
      )
    }
    const { container } = render(
      <FiboThemeProvider>
        <Flip />
      </FiboThemeProvider>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(cssVar(root, '--fibo-theme')).toBe('material')
    expect(cssVar(root, '--fibo-background')).toBe(materialTheme.colors.background)
    expect(cssVar(root, '--fibo-primary')).toBe(materialTheme.colors.primary)
    expect(root.style.colorScheme).toBe('light')

    fireEvent.click(screen.getByText('dark'))

    expect(root.className).toContain('fibo-theme-noir')
    expect(root.getAttribute('data-fibo-theme')).toBe('noir')
    expect(cssVar(root, '--fibo-theme')).toBe('noir')
    expect(cssVar(root, '--fibo-background')).toBe(noirTheme.colors.background)
    expect(cssVar(root, '--fibo-on-background')).toBe(noirTheme.colors.onBackground)
    expect(cssVar(root, '--fibo-primary')).toBe(noirTheme.colors.primary)
    expect(root.style.colorScheme).toBe('dark')
  })
})

describe('useFiboTheme context default', () => {
  it('returns material tokens without a provider (matches base.css)', () => {
    function Probe() {
      const { themeName, theme } = useFiboTheme()
      return (
        <span data-testid="probe">
          {themeName}:{theme.colors.primary}
        </span>
      )
    }
    expect(() => render(<Probe />)).not.toThrow()
    expect(screen.getByTestId('probe')).toHaveTextContent(`material:${materialTheme.colors.primary}`)
  })
})

describe('useTheme / ThemeProvider dark-light CSS vars', () => {
  it('default useTheme exposes material colorScheme, not an empty object', () => {
    function Probe() {
      const theme = useTheme()
      return (
        <span data-testid="probe">
          {theme.brightness}:{theme.colorScheme?.primary ?? ''}
        </span>
      )
    }
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent(`light:${materialTheme.colors.primary}`)
  })

  it('ThemeProvider brightness flip paints --fibo-* vars on the host', () => {
    const light = {
      type: ThemeType.Material,
      brightness: Brightness.Light,
      colorScheme: {
        background: '#FFFBFE',
        onBackground: '#1C1B1F',
        primary: '#6750A4',
      },
    }
    const dark = {
      type: ThemeType.Material,
      brightness: Brightness.Dark,
      colorScheme: {
        background: '#0A0A0B',
        onBackground: '#F4F4F6',
        primary: '#F4F4F6',
      },
    }
    const { container, rerender } = render(
      <ThemeProvider theme={light}>
        <span>hi</span>
      </ThemeProvider>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(cssVar(root, '--fibo-background')).toBe('#FFFBFE')
    expect(cssVar(root, '--fibo-primary')).toBe('#6750A4')
    expect(root.style.colorScheme).toBe('light')

    rerender(
      <ThemeProvider theme={dark}>
        <span>hi</span>
      </ThemeProvider>,
    )
    expect(cssVar(root, '--fibo-background')).toBe('#0A0A0B')
    expect(cssVar(root, '--fibo-on-background')).toBe('#F4F4F6')
    expect(cssVar(root, '--fibo-primary')).toBe('#F4F4F6')
    expect(root.style.colorScheme).toBe('dark')
  })
})
