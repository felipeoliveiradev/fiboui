import { type ReactElement } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import '../examples/site/src/modules/site/route'
import { menuOpen } from '../examples/site/src/modules/site/state'
import { MediaView } from '../examples/site/src/modules/site/Views/demos/MediaView'
import { SignalsView } from '../examples/site/src/modules/site/Views/demos/SignalsView'
import {
  setFilter,
  todos,
} from '../examples/site/src/modules/site/Views/demos/SignalsViewModel'
import { ThemeView } from '../examples/site/src/modules/site/Views/demos/ThemeView'
import { selectTone } from '../examples/site/src/modules/site/Views/demos/ThemeViewModel'
import { selectWidth } from '../examples/site/src/modules/site/Views/demos/MediaViewModel'

function resetTodos() {
  todos.set([
    { label: 'Ship the Stage demos', done: false },
    { label: 'Wire signals to the list', done: true },
    { label: 'Keep the tree fluent', done: false },
  ])
  setFilter('all')
}

beforeEach(() => {
  resetTodos()
  menuOpen.value = false
  selectTone('pink')
  selectWidth('large')
})

afterEach(() => {
  cleanup()
  resetTodos()
  menuOpen.value = false
  selectTone('pink')
  selectWidth('large')
})

describe('W25-04 site demos leftover a11y', () => {
  it('add-task field has an accessible name (placeholder is not a name here)', () => {
    render(SignalsView() as ReactElement)
    expect(screen.getByRole('textbox', { name: /add a task/i })).toBeTruthy()
  })

  it('todo toggle buttons have names (not empty icon controls)', () => {
    render(SignalsView() as ReactElement)
    expect(
      screen.getByRole('button', { name: /mark ship the stage demos done/i }),
    ).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /mark wire signals to the list open/i }),
    ).toBeTruthy()
  })

  it('todo remove buttons are named, not only ✕', () => {
    render(SignalsView() as ReactElement)
    expect(
      screen.getByRole('button', { name: /remove ship the stage demos/i }),
    ).toBeTruthy()
    expect(screen.queryAllByRole('button', { name: '✕' })).toHaveLength(0)
  })

  it('filter tabs expose pressed state', () => {
    render(SignalsView() as ReactElement)
    expect(screen.getByRole('button', { name: /^all$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^open$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    fireEvent.click(screen.getByRole('button', { name: /^open$/i }))
    expect(screen.getByRole('button', { name: /^open$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^all$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('theme chips expose name + pressed state', () => {
    render(ThemeView() as ReactElement)
    expect(screen.getByRole('button', { name: /^pink$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^ink$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    fireEvent.click(screen.getByRole('button', { name: /^ink$/i }))
    expect(screen.getByRole('button', { name: /^ink$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('media width tabs expose pressed state', () => {
    render(MediaView() as ReactElement)
    expect(screen.getByRole('button', { name: /^large$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /^small$/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    fireEvent.click(screen.getByRole('button', { name: /^small$/i }))
    expect(screen.getByRole('button', { name: /^small$/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('browser Back / popstate closes the site menu overlay', async () => {
    menuOpen.value = true
    expect(menuOpen.value).toBe(true)
    await act(async () => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(menuOpen.value).toBe(false)
  })
})
