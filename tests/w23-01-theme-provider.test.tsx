import { cleanup, render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { FiboThemeProvider } from '../src/theme/provider'
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

describe('W23-01 useTheme ↔ FiboThemeProvider', () => {
  it('useTheme under FiboThemeProvider noir reports ThemeType.Noir, not Material', () => {
    function Probe() {
      const theme = useTheme()
      return (
        <span data-testid="probe">
          {String(theme.type)}:{theme.brightness}
        </span>
      )
    }
    render(
      <FiboThemeProvider theme="noir">
        <Probe />
      </FiboThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent(`${ThemeType.Noir}:${Brightness.Dark}`)
    expect(screen.getByTestId('probe')).not.toHaveTextContent(ThemeType.Material)
  })

  it('useTheme under FiboThemeProvider keeps success/warning/info/surfaceContainerLow', () => {
    function Probe() {
      const theme = useTheme()
      const c = theme.colorScheme
      return (
        <span data-testid="probe">
          {[c?.success, c?.warning, c?.info, c?.surfaceContainerLow, c?.errorContainer].join('|')}
        </span>
      )
    }
    render(
      <FiboThemeProvider theme="noir">
        <Probe />
      </FiboThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent(
      [
        noirTheme.colors.success,
        noirTheme.colors.warning,
        noirTheme.colors.info,
        noirTheme.colors.surfaceContainerLow ?? noirTheme.colors.surface,
        noirTheme.colors.errorContainer ?? noirTheme.colors.error,
      ].join('|'),
    )
  })

  it('useTheme under default FiboThemeProvider keeps material success token', () => {
    function Probe() {
      const theme = useTheme()
      return <span data-testid="probe">{theme.colorScheme?.success ?? ''}</span>
    }
    render(
      <FiboThemeProvider>
        <Probe />
      </FiboThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent(materialTheme.colors.success ?? '')
    expect(screen.getByTestId('probe').textContent).not.toBe('')
  })
})

describe('W23-01 ThemeProvider host CSS', () => {
  it('ThemeType.Noir stamps fibo-theme-noir and --fibo-theme on SSR', () => {
    const html = renderToString(
      <ThemeProvider
        theme={{
          type: ThemeType.Noir,
          brightness: Brightness.Dark,
          colorScheme: {
            background: noirTheme.colors.background,
            onBackground: noirTheme.colors.onBackground,
            primary: noirTheme.colors.primary,
            success: noirTheme.colors.success,
          },
        }}
      >
        <span>body</span>
      </ThemeProvider>,
    )
    expect(html).toContain('fibo-theme-noir')
    expect(html).toContain('data-fibo-theme="noir"')
    expect(html).toMatch(/--fibo-theme:\s*noir/)
    expect(html).toContain('--fibo-success')
    expect(html).toContain(noirTheme.colors.success)
  })

  it('paints typography.fontFamily as host font and --fibo-font-family', () => {
    const { container } = render(
      <ThemeProvider
        theme={{
          type: ThemeType.Web,
          brightness: Brightness.Light,
          typography: { fontFamily: '"Inter", system-ui, sans-serif' },
          colorScheme: { background: '#fff', onBackground: '#111' },
        }}
      >
        <span>hi</span>
      </ThemeProvider>,
    )
    const root = container.firstElementChild as HTMLElement
    expect(root.className).toContain('fibo-theme-web')
    expect(cssVar(root, '--fibo-font-family')).toBe('"Inter", system-ui, sans-serif')
    expect(root.style.fontFamily).toContain('Inter')
  })

  it('useTheme inside ThemeProvider is stable when FiboThemeProvider also wraps (no hook crash)', () => {
    function Probe() {
      const theme = useTheme()
      return <span data-testid="probe">{String(theme.type)}:{theme.colorScheme?.primary}</span>
    }
    const { rerender } = render(
      <ThemeProvider
        theme={{
          type: ThemeType.Cupertino,
          brightness: Brightness.Light,
          colorScheme: { primary: '#007AFF' },
        }}
      >
        <Probe />
      </ThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent(`${ThemeType.Cupertino}:#007AFF`)

    rerender(
      <FiboThemeProvider theme="noir">
        <Probe />
      </FiboThemeProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent(`${ThemeType.Noir}:${noirTheme.colors.primary}`)
  })
})
