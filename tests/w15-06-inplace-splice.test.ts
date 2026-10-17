import { describe, expect, it } from 'vitest'
import { listSignal } from '../src/core/listSignal'

type Row = { n: number }

describe('W15-06 listSignal in-place splice', () => {
  it('does not notify, and does not drop stored rows, when .value is spliced', () => {
    const list = listSignal<Row>([{ n: 1 }, { n: 2 }])
    const seen: number[] = []
    list.subscribe((v) => seen.push(v.length))

    list.value.splice(0, 1)

    expect(seen).toEqual([])
    expect(list.map((row) => row.n)).toEqual([1, 2])

    list.add({ n: 3 })
    expect(seen[seen.length - 1]).toBe(3)
    expect(list.map((row) => row.n)).toEqual([1, 2, 3])
  })

  it('keeps hidden rows when the visible slice is spliced during view', () => {
    const list = listSignal<{ title: string }>([
      { title: 'Ship' },
      { title: 'Docs' },
    ])
    list.view('ship', ['title'])
    list.value.splice(0, 1)
    list.add({ title: 'Note' })
    expect(list.map((row) => row.title)).toEqual(['Ship', 'Docs', 'Note'])
  })

  it('insert and move still notify (splice a copy, then assign)', () => {
    const list = listSignal<Row>([{ n: 1 }, { n: 2 }])
    const seen: number[][] = []
    list.subscribe((v) => seen.push(v.map((row) => row.n)))

    list.insert(1, { n: 9 })
    expect(seen[seen.length - 1]).toEqual([1, 9, 2])

    list.move(1, 0)
    expect(seen[seen.length - 1]).toEqual([9, 1, 2])
    expect(list.map((row) => row.n)).toEqual([9, 1, 2])
  })
})
