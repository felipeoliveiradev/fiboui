import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Text, Table, Tags, listSignal, page } from '../src'

afterEach(() => {
  cleanup()
})

describe('Table and Tags with listSignal', () => {
  it('rewrites one table row without running the page again', () => {
    const rows = listSignal([
      { _id: 'a', name: 'Ada' },
      { _id: 'b', name: 'Bea' },
    ])
    const paints: Record<string, number> = { a: 0, b: 0 }
    let builds = 0
    const Page = page(() => {
      builds += 1
      return Table()
        .data(rows)
        .columns([
          {
            header: 'Name',
            render: (row: { _id: string; name: string }) => {
              paints[row._id] = (paints[row._id] ?? 0) + 1
              return Text(row.name)
            },
          },
        ])
    })

    render(<Page />)
    expect(screen.getByText('Ada')).toBeTruthy()
    expect(builds).toBe(1)
    const a0 = paints.a
    const b0 = paints.b

    act(() => {
      rows.update('a', { name: 'Ada2' })
    })
    expect(screen.getByText('Ada2')).toBeTruthy()
    expect(screen.getByText('Bea')).toBeTruthy()
    expect(builds).toBe(1)
    expect(paints.a).toBe(a0 + 1)
    expect(paints.b).toBe(b0)
  })

  it('rewrites one tag without running the page again', () => {
    const tags = listSignal([
      { _id: 'a', title: 'Alpha' },
      { _id: 'b', title: 'Beta' },
    ])
    let builds = 0
    const Page = page(() => {
      builds += 1
      return Tags().items(tags)
    })

    render(<Page />)
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(builds).toBe(1)

    act(() => {
      tags.update('a', { title: 'Alpha2' })
    })
    expect(screen.getByText('Alpha2')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(builds).toBe(1)
  })
})
