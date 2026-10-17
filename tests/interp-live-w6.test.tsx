import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, act, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  Label,
  Alert,
  ListTile,
  Banner,
  Card,
  Button,
  Textarea,
  Select,
  Checkbox,
  Switch,
  listSignal,
  signal,
  interp,
} from '../src'

afterEach(cleanup)

function bumpList() {
  const todos = listSignal<{ title: string }>([])
  return {
    todos,
    add: () => {
      todos.add({ title: 'A' })
    },
  }
}

describe('Label live interp', () => {
  it('Label(`…${todos.$length}`) auto-updates', () => {
    const { todos, add } = bumpList()
    render(Label(`Items: ${todos.$length}`).build() as any)
    expect(screen.getByText('Items: 0')).toBeInTheDocument()
    act(add)
    expect(screen.getByText('Items: 1')).toBeInTheDocument()
  })

  it('Label(`Hi ${interp(name)}`) auto-updates', () => {
    const name = signal('Ada')
    render(Label(`Hi ${interp(name)}`).build() as any)
    expect(screen.getByText('Hi Ada')).toBeInTheDocument()
    act(() => {
      name.value = 'Bob'
    })
    expect(screen.getByText('Hi Bob')).toBeInTheDocument()
  })

  it('extra bindSignal is allowed alongside auto-bind', () => {
    const todos = listSignal<{ title: string }>([])
    const tick = signal(0)
    render(Label(`Items: ${todos.$length}`).bindSignal(tick).build() as any)
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Items: 1')).toBeInTheDocument()
    act(() => {
      tick.value = 1
    })
    expect(screen.getByText('Items: 1')).toBeInTheDocument()
  })

  it('todos.length still freezes (use $length)', () => {
    const todos = listSignal<{ title: string }>([])
    render(Label(`Frozen: ${todos.length}`).build() as any)
    expect(screen.getByText('Frozen: 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Frozen: 0')).toBeInTheDocument()
  })
})

describe('Alert live interp', () => {
  it('title and description with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Alert()
        .title(`Open: ${todos.$length}`)
        .description(`left ${todos.$length}`)
        .intent('info')
        .build() as any
    )
    expect(screen.getByText('Open: 0')).toBeInTheDocument()
    expect(screen.getByText('left 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Open: 1')).toBeInTheDocument()
    expect(screen.getByText('left 1')).toBeInTheDocument()
  })
})

describe('ListTile live interp', () => {
  it('title and subtitle with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      ListTile()
        .title(`Row ${todos.$length}`)
        .subtitle(`n=${todos.$length}`)
        .build() as any
    )
    expect(screen.getByText('Row 0')).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Row 1')).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })
})

describe('Banner live interp', () => {
  it('title and subtitle with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Banner(`Notice ${todos.$length}`).subtitle(`n=${todos.$length}`).build() as any
    )
    expect(screen.getByText('Notice 0')).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Notice 1')).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
  })
})

describe('Card live interp', () => {
  it('text, subtitle and number with $length auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Card()
        .text(`Total ${todos.$length}`)
        .subtitle(`n=${todos.$length}`)
        .number(`${todos.$length}`)
        .build() as any
    )
    expect(screen.getByText('Total 0')).toBeInTheDocument()
    expect(screen.getByText('n=0')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Total 1')).toBeInTheDocument()
    expect(screen.getByText('n=1')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('string children with interp auto-update', () => {
    const todos = listSignal<{ title: string }>([])
    render(Card().children(`Kids ${todos.$length}`).build() as any)
    expect(screen.getByText('Kids 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Kids 1')).toBeInTheDocument()
  })
})

describe('Button live interp', () => {
  it('Button(`…${todos.$length}`) auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Button(`Save ${todos.$length}`).build() as any)
    expect(screen.getByRole('button')).toHaveTextContent('Save 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('button')).toHaveTextContent('Save 1')
  })

  it('Button children text with interp auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Button().children(`Go ${todos.$length}`).build() as any)
    expect(screen.getByRole('button')).toHaveTextContent('Go 0')
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByRole('button')).toHaveTextContent('Go 1')
  })

  it('interp Button still supports .type("submit")', () => {
    const n = signal(1)
    const node = Button(`Save ${interp(n)}`).type('submit')
    expect(isValidElement(node)).toBe(true)
    render(node)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.type).toBe('submit')
    expect(button).toHaveTextContent('Save 1')
    act(() => {
      n.value = 2
    })
    expect(button).toHaveTextContent('Save 2')
    expect(button.type).toBe('submit')
  })
})

describe('field labels live interp', () => {
  it('Textarea label with $length auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Textarea().label(`Notes ${todos.$length}`).placeholder('notes').build() as any)
    expect(screen.getByText('Notes 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Notes 1')).toBeInTheDocument()
  })

  it('Select label with $length auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(
      Select()
        .label(`Pick ${todos.$length}`)
        .options([{ label: 'A', value: 'a' }])
        .build() as any
    )
    expect(screen.getByText('Pick 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Pick 1')).toBeInTheDocument()
  })

  it('Checkbox label with $length auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Checkbox().label(`Agree ${todos.$length}`).build() as any)
    expect(screen.getByText('Agree 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Agree 1')).toBeInTheDocument()
  })

  it('Switch label with $length auto-updates', () => {
    const todos = listSignal<{ title: string }>([])
    render(Switch().label(`Dark ${todos.$length}`).build() as any)
    expect(screen.getByText('Dark 0')).toBeInTheDocument()
    act(() => {
      todos.add({ title: 'A' })
    })
    expect(screen.getByText('Dark 1')).toBeInTheDocument()
  })
})
