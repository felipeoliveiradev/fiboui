import { describe, expect, it } from 'vitest'
import { planEnter, suggestIndent } from '../examples/site/src/modules/site/Views/playground/indent'
import { computeLabels } from '../examples/site/src/modules/site/Views/playground/labels'
import { fillFor } from '../examples/site/src/modules/site/Views/playground/fill'
import { runPlay, explain } from '../examples/site/src/modules/site/Views/playground/run'

describe('playground indent', () => {
  it('deepens after a factory that already has a call on the same line', () => {
    expect(suggestIndent('Column().gap(12)', '', '')).toBe('  ')
  })

  it('ignores a comment that looks like an open call', () => {
    expect(suggestIndent('  // .children([', '', '  ')).toBeNull()
    expect(suggestIndent('  .gap(12) // .children([', '', '  ')).toBe('  ')
  })

  it('deepens an unclosed callback brace', () => {
    expect(suggestIndent('  .onPress(() => {', '', '  ')).toBe('    ')
  })

  it('deepens a typed itemStyle callback', () => {
    expect(suggestIndent('  .itemStyle((s: Style) =>', '', '  ')).toBe('    ')
  })

  it('keeps a chain line at the same indent', () => {
    expect(suggestIndent('  .gap(12)', '.padding(8)', '  ')).toBe('  ')
  })

  it('indents .children under return Row()', () => {
    expect(suggestIndent('return Row()', '.children([', '')).toBe('  ')
    expect(planEnter('return Row()', '.children([').insert).toBe('\n  ')
  })

  it('opens a blank line inside children brackets and leaves the closer aligned', () => {
    const plan = planEnter('  .children([', '])')
    expect(plan.insert).toBe('\n    \n  ')
    expect(plan.caret).toBe(5)
    const planCall = planEnter('  .gap(', ')')
    expect(planCall.insert).toBe('\n    \n  ')
    const planBlock = planEnter('  .onPress(() => {', '})')
    expect(planBlock.insert).toBe('\n    \n  ')
  })
})

describe('playground closing labels', () => {
  it('does not end the chain on a parenthesis inside a block comment', () => {
    const text = 'Column().children([\n  /* ) */\n  Text(\'a\'),\n])'
    const labels = computeLabels(text)
    const column = labels.find((item) => item.label === 'Column')
    expect(column).toBeTruthy()
    const line = text.slice(0, column!.offset).split('\n').length
    expect(line).toBe(4)
  })

  it('skips a comment between methods', () => {
    const text = 'Column()\n  .padding(8) // tight\n  .children([\n    Text(\'a\'),\n  ])'
    const labels = computeLabels(text)
    const column = labels.find((item) => item.label === 'Column')
    expect(text.slice(0, column!.offset).split('\n').length).toBe(5)
  })

  it('does not label a factory inside a string', () => {
    const text = 'const s = `\nColumn()\n  .gap(1)\n`'
    expect(computeLabels(text).some((item) => item.label === 'Column')).toBe(false)
  })

  it('labels Center the same way the extension factory list does', () => {
    const text = 'Center()\n  .padding(8)'
    expect(computeLabels(text).some((item) => item.label === 'Center')).toBe(true)
  })

  it('reads the outer label when two closes share a line', () => {
    const text = 'Column(Box()\n  .padding(8))'
    const labels = computeLabels(text)
    const line = text.split('\n')[1]
    const onSecond = labels.filter((item) => text.slice(0, item.offset).endsWith(line) || text.slice(0, item.offset).split('\n').length === 2)
    expect(onSecond.some((item) => item.label === 'Column')).toBe(true)
  })
})

describe('playground fills', () => {
  it('keeps string, number, callback and empty samples apart', () => {
    expect(fillFor('placeholder', 'method').text).toBe("('')")
    expect(fillFor('onScroll', 'method').text).toBe("('')")
    expect(fillFor('hover', 'method').text).toBe('(() => )')
    expect(fillFor('hidden', 'method').text).toBe('()')
    expect(fillFor('sm', 'method').text).toBe('({})')
    expect(fillFor('columns', 'method').text).toBe('([])')
    expect(fillFor('scaledToFill', 'method').text).toBe('()')
    expect(fillFor('computed', 'function').text).toBe('(() => )')
    expect(fillFor('required', 'function').text).toBe("('')")
    expect(fillFor('Image', 'factory').text).toBe("('')")
  })
})

describe('playground runner', () => {
  it('does not treat the word return inside a string as a return', () => {
    const result = runPlay("Column().children([\n  Text('press return'),\n])")
    expect(result.ok).toBe(true)
  })

  it('inserts a comma before a trailing comment', () => {
    const result = runPlay("return Column().children([\n  Text('a') // note\n  Text('b')\n])")
    expect(result.ok).toBe(true)
  })

  it('teaches Textfield as TextField without the comma lesson', () => {
    const taught = explain('Textfield is not defined')
    expect(taught.hint).toContain('TextField')
    expect(taught.lesson).toBe('')
  })

  it('keeps listSignal as the name for a wrong-case lookup', () => {
    const taught = explain('Listsignal is not defined')
    expect(taught.hint).toContain('listSignal')
  })
})
