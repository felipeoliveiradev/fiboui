import { type ReactElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Table } from '../src'

afterEach(cleanup)

const people = [
  { name: 'Cara', age: 30 },
  { name: 'Ada', age: 20 },
  { name: 'Bea', age: 40 },
]

function bodyNames(): string[] {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelectorAll('td')[0]?.textContent ?? '')
}

describe('Table sort', () => {
  it('.sortable(true) sorts a clicked header ascending then descending and sets aria-sort', () => {
    render(
      Table()
        .sortable(true)
        .columns([
          { header: 'Name', accessor: 'name' },
          { header: 'Age', accessor: 'age' },
        ])
        .data(people)
        .build() as ReactElement
    )

    const name = screen.getByRole('columnheader', { name: 'Name' })
    const age = screen.getByRole('columnheader', { name: 'Age' })
    expect(name).toHaveAttribute('aria-sort', 'none')
    expect(age).toHaveAttribute('aria-sort', 'none')
    expect(bodyNames()).toEqual(['Cara', 'Ada', 'Bea'])

    fireEvent.click(name)
    expect(name).toHaveAttribute('aria-sort', 'ascending')
    expect(age).toHaveAttribute('aria-sort', 'none')
    expect(bodyNames()).toEqual(['Ada', 'Bea', 'Cara'])

    fireEvent.click(name)
    expect(name).toHaveAttribute('aria-sort', 'descending')
    expect(bodyNames()).toEqual(['Cara', 'Bea', 'Ada'])

    fireEvent.click(age)
    expect(age).toHaveAttribute('aria-sort', 'ascending')
    expect(name).toHaveAttribute('aria-sort', 'none')
    expect(bodyNames()).toEqual(['Ada', 'Cara', 'Bea'])
  })

  it('column.sortable sorts that header without Table.sortable()', () => {
    render(
      Table()
        .columns([
          { header: 'Name', accessor: 'name', sortable: true },
          { header: 'Age', accessor: 'age' },
        ])
        .data(people)
        .build() as ReactElement
    )

    const name = screen.getByRole('columnheader', { name: 'Name' })
    const age = screen.getByRole('columnheader', { name: 'Age' })
    expect(name).toHaveAttribute('aria-sort', 'none')
    expect(age).not.toHaveAttribute('aria-sort')

    fireEvent.click(age)
    expect(bodyNames()).toEqual(['Cara', 'Ada', 'Bea'])

    fireEvent.click(name)
    expect(name).toHaveAttribute('aria-sort', 'ascending')
    expect(bodyNames()).toEqual(['Ada', 'Bea', 'Cara'])
  })
})
