import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Badge, Box, Collapse, Table, Tags, Text } from '../src'

afterEach(cleanup)

describe('Table rest-spread role', () => {
  it('id and extra props land on the table host', () => {
    render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data([{ name: 'Ada' }])
        .id('tbl-ada')
        .props({ role: 'region', 'data-testid': 'tbl-ada' })
        .build()
    )
    const el = screen.getByTestId('tbl-ada')
    expect(el).toHaveAttribute('id', 'tbl-ada')
    expect(el).toHaveAttribute('role', 'region')
    expect(screen.getByText('Ada')).toBeInTheDocument()
  })
})

describe('Collapse rest-spread role', () => {
  it('id and extra props land on the disclosure host', () => {
    render(
      Collapse()
        .title('More')
        .content(Text('Hidden'))
        .id('cl-more')
        .props({ role: 'group', 'data-testid': 'cl-more' })
        .build()
    )
    const el = screen.getByTestId('cl-more')
    expect(el).toHaveAttribute('id', 'cl-more')
    expect(el).toHaveAttribute('role', 'group')
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
  })
})

describe('Box / Tags rest-spread (already-clean lock)', () => {
  it('Box forwards role and id', () => {
    render(
      Box()
        .id('bx')
        .props({ role: 'region', 'data-testid': 'bx' })
        .children('hello-box')
        .build()
    )
    const el = screen.getByTestId('bx')
    expect(el).toHaveAttribute('id', 'bx')
    expect(el).toHaveAttribute('role', 'region')
    expect(el).toHaveTextContent('hello-box')
  })

  it('Tags forwards role and id', () => {
    render(
      Tags()
        .items([{ title: 'alpha' }])
        .id('tg')
        .props({ role: 'list', 'data-testid': 'tg' })
        .build()
    )
    const el = screen.getByTestId('tg')
    expect(el).toHaveAttribute('id', 'tg')
    expect(el).toHaveAttribute('role', 'list')
    expect(screen.getByText('alpha')).toBeInTheDocument()
  })
})

describe('SSR window during render', () => {
  it('Table / Tags / Badge / Collapse renderToString without window', () => {
    expect(() =>
      renderToString(
        Table()
          .columns([{ header: 'Name', accessor: 'name' }])
          .data([{ name: 'Ada' }])
          .build() as ReactElement
      )
    ).not.toThrow()
    expect(() =>
      renderToString(Tags().items([{ title: 'ssr-tag' }]).build() as ReactElement)
    ).not.toThrow()
    expect(() =>
      renderToString(Badge().text('ssr-badge').intent('info').build() as ReactElement)
    ).not.toThrow()
    expect(() =>
      renderToString(
        Collapse().title('SSR').content(Text('body')).build() as ReactElement
      )
    ).not.toThrow()
    expect(() =>
      renderToString(Box().children('ssr-box').build() as ReactElement)
    ).not.toThrow()
  })
})
