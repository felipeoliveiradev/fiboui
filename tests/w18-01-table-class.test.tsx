import { type ReactElement } from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Table } from '../src'

afterEach(cleanup)

describe('W18-01 Table — theme host class', () => {
  it('stamps fibo-table on the <table> so theme CSS applies', () => {
    const { container } = render(
      Table()
        .columns([{ header: 'Name', accessor: 'name' }])
        .data([{ name: 'Ada' }])
        .build() as ReactElement
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    expect(table!.className.split(/\s+/)).toContain('fibo-table')
  })

  it('merges fibo-table with extra className', () => {
    const { container } = render(
      Table()
        .className('extra-table')
        .columns([{ header: 'Name', accessor: 'name' }])
        .data([{ name: 'Ada' }])
        .build() as ReactElement
    )
    const table = container.querySelector('table')
    expect(table).not.toBeNull()
    expect(table!.className.split(/\s+/)).toContain('fibo-table')
    expect(table!.className.split(/\s+/)).toContain('extra-table')
  })
})
