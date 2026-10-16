import { describe, expect, it } from 'vitest'
import { buttonExample, formExample, helloExample } from '../examples/site/src/modules/site/Views/playground/examples'
import { toReact } from '../examples/site/src/modules/site/Views/playground/react'

describe('playground react equivalent', () => {
  it('turns a column of text into JSX', () => {
    expect(toReact(helloExample)).toBe(`return (
  <Column
    padding={28}
    gap={12}
    bg="#0a0a0a"
  >
    <Text
      fontSize={48}
      fontWeight={800}
      letterSpacing="-0.04em"
      textTransform="uppercase"
      color="#ffffff"
    >
      Play
    </Text>
    <Text
      fontSize={14}
      color="#9a9a9a"
    >
      Edit the code. The preview follows.
    </Text>
  </Column>
)`)
  })

  it('keeps a callback on the prop and the label as children', () => {
    const jsx = toReact(buttonExample)
    expect(jsx).toContain('<Button')
    expect(jsx).toContain('bg="#ff2d8a"')
    expect(jsx).toContain('onPress={() => {')
    expect(jsx).toContain("console.log('pressed')")
    expect(jsx).toContain('Press')
    expect(jsx).toContain('</Button>')
  })

  it('maps a bare field and a flag method', () => {
    const jsx = toReact(`return TextField()
  .name('name')
  .resetStyle()
  .lineHeight(0.8)
  .borderBottom('1px solid #fff')
  .width('100%')
  .placeholder('Name')`)
    expect(jsx).toBe(`return (
  <TextField
    name="name"
    resetStyle
    lineHeight={0.8}
    borderBottom="1px solid #fff"
    width="100%"
    placeholder="Name"
  />
)`)
  })

  it('leaves signal code in place and nests the list item', () => {
    const jsx = toReact(formExample)
    expect(jsx.startsWith('const notes = listSignal([])')).toBe(true)
    expect(jsx).toContain('<Form')
    expect(jsx).toContain('validation={{')
    expect(jsx).toContain('required(\'Write a note\')')
    expect(jsx).toContain('submit')
    expect(jsx).toContain("{'Notes ' + notes.$length}")
    expect(jsx).toContain('items={notes}')
    expect(jsx).toContain('<Text')
    expect(jsx).toContain('{item.text}')
  })
})
