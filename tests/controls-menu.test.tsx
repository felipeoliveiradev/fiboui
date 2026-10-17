import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContextMenu } from '../src/interactive/ContextMenu'
import { Menu } from '../src/interactive/Menu'
import { SearchBar } from '../src/interactive/SearchBar'
import { Tooltip } from '../src/interactive/Tooltip'

afterEach(() => {
  cleanup()
})

describe('SearchBar', () => {
  it('submits the query and prevents the form default', () => {
    const onSubmit = vi.fn()
    const onChange = vi.fn()
    render(
      SearchBar()
        .value('')
        .placeholder('Search')
        .onChange(onChange)
        .onSubmit(onSubmit)
        .build() as never
    )

    const input = screen.getByPlaceholderText('Search')
    expect(input).toHaveAttribute('type', 'search')
    fireEvent.change(input, { target: { value: 'widgets' } })
    expect(onChange).toHaveBeenCalledWith('widgets')

    const form = input.closest('form')
    expect(form).not.toBeNull()
    let prevented = false
    const mark = (event: Event) => {
      prevented = event.defaultPrevented
    }
    document.addEventListener('submit', mark)
    fireEvent.submit(form!)
    document.removeEventListener('submit', mark)

    expect(prevented).toBe(true)
    expect(onSubmit).toHaveBeenCalledWith('widgets')
  })
})

describe('Menu', () => {
  it('shows Edit when open', () => {
    const onPress = vi.fn()
    render(
      Menu()
        .label('More')
        .items([
          { label: 'Edit', onPress },
          { label: 'Delete', onPress: () => {} },
        ])
        .open(true)
        .build() as never
    )

    const trigger = screen.getByRole('button', { name: 'More' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }))
    expect(onPress).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Edit').tagName).toBe('BUTTON')
  })

  it('hides items until opened', () => {
    render(
      Menu()
        .label('More')
        .items([{ label: 'Edit', onPress: () => {} }])
        .build() as never
    )

    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Edit')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'More' }))
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })
})

describe('ContextMenu', () => {
  it('opens near the pointer and can start open for tests', () => {
    const onPress = vi.fn()
    const { unmount } = render(
      ContextMenu()
        .items([{ label: 'Copy', onPress }])
        .child('target')
        .build() as never
    )

    expect(screen.queryByText('Copy')).toBeNull()
    fireEvent.contextMenu(screen.getByText('target'), { clientX: 12, clientY: 24 })
    const item = screen.getByRole('menuitem', { name: 'Copy' })
    expect(item).toBeInTheDocument()
    fireEvent.click(item)
    expect(onPress).toHaveBeenCalledTimes(1)
    unmount()

    render(
      ContextMenu()
        .items([{ label: 'Copy', onPress: () => {} }])
        .child('target')
        .open(true)
        .build() as never
    )
    expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeInTheDocument()
  })
})

describe('Tooltip', () => {
  it('keeps the tooltip text in the document', () => {
    render(Tooltip().text('Save').child('icon').build() as never)

    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Save')
    const host = screen.getByTitle('Save')
    expect(host).toHaveAttribute('title', 'Save')

    fireEvent.mouseEnter(host)
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-state', 'visible')
  })
})
