import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Box, Button, List, Text, listSignal, page } from '../src'

afterEach(() => cleanup())

describe('List rows', () => {
  it('runs renderItem again only for the row that changed', () => {
    const todos = listSignal([{ title: 'A' }, { title: 'B' }])
    const counts = new Map<string, number>()
    let builds = 0
    const idA = todos.value[0]._id
    const idB = todos.value[1]._id

    const Page = page(() => {
      builds += 1
      return [
        List().items(todos).renderItem((row) => {
          counts.set(row._id, (counts.get(row._id) ?? 0) + 1)
          return Text(row.title)
        }),
        Button('patch').onPress(() => {
          todos.update(idA, { title: 'A1' })
        }),
        Button('add').onPress(() => {
          todos.add({ title: 'C' })
        }),
      ]
    })

    render(<Page />)
    expect(screen.getByText('A')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
    expect(counts.get(idA)).toBe(1)
    expect(counts.get(idB)).toBe(1)
    expect(builds).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: 'patch' }))
    expect(screen.getByText('A1')).toBeTruthy()
    expect(screen.getByText('B')).toBeTruthy()
    expect(counts.get(idA)).toBe(2)
    expect(counts.get(idB)).toBe(1)
    expect(builds).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: 'add' }))
    expect(screen.getByText('C')).toBeTruthy()
    expect(counts.get(idA)).toBe(2)
    expect(counts.get(idB)).toBe(1)
    const idC = todos.value[2]._id
    expect(counts.get(idC)).toBe(1)
    expect(builds).toBe(1)
  })

  it('does not rerun the page or the other rows when the list sits beside the read', () => {
    const todos = listSignal([{ title: 'A' }, { title: 'B' }])
    const counts = new Map<string, number>()
    let builds = 0
    const idA = todos.value[0]._id
    const idB = todos.value[1]._id
    const Page = page(() => {
      builds += 1
      return [
        Box().observer().children(() => {
          void todos.value
          return Text(String(todos.value.length))
        }),
        Box().observer().children(() => {
          return List().items(todos).renderItem((row) => {
            counts.set(row._id, (counts.get(row._id) ?? 0) + 1)
            return Text(row.title)
          })
        }),
      ]
    })

    render(<Page />)
    expect(builds).toBe(1)
    expect(counts.get(idA)).toBe(1)
    expect(counts.get(idB)).toBe(1)
    act(() => {
      todos.update(idA, { title: 'A1' })
    })
    expect(screen.getByText('A1')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(builds).toBe(1)
    expect(counts.get(idA)).toBe(2)
    expect(counts.get(idB)).toBe(1)
  })
})
