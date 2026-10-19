import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { mapReindentCaret, planEnter, reindent, suggestIndent } from '../examples/site/src/modules/site/Views/playground/indent'
import { computeLabels, FACTORY_NAMES } from '../examples/site/src/modules/site/Views/playground/labels'
import { fillFor } from '../examples/site/src/modules/site/Views/playground/fill'
import * as fiboui from 'fiboui'
import { SIGNAL_METHODS, queryAt } from '../examples/site/src/modules/site/Views/playground/suggest'
import { buttonExample, formExample, helloExample } from '../examples/site/src/modules/site/Views/playground/examples'
import { resolveImportScope, takeImports } from '../examples/site/src/modules/site/Views/playground/imports'
import { runPlay, explain } from '../examples/site/src/modules/site/Views/playground/run'
import { pathToRoute } from '../examples/site/src/modules/site/route'

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

  it('reindents a flat list back into the chain', () => {
    const messy = [
      'return Column()',
      '.children([',
      'List()',
      '.items(todos)',
      '.renderItem((item) =>',
      'Row()',
      '.children([',
      'Text(item.text),',
      '])',
      ')',
      '])',
    ].join('\n')
    expect(reindent(messy)).toBe([
      'return Column()',
      '  .children([',
      '    List()',
      '      .items(todos)',
      '      .renderItem((item) =>',
      '        Row()',
      '          .children([',
      '            Text(item.text),',
      '          ])',
      '      )',
      '  ])',
    ].join('\n'))
  })

  it('keeps the chain after a closed block and lines siblings up', () => {
    const messy = [
      'const todos = listSignal([])',
      'return Column()',
      '.children([',
      'Form()',
      '.flexDirection(\'row\')',
      '.validation({',
      'title: [\'required\'],',
      '})',
      '.onSubmit((value) => todos.add(value))',
      '.children([',
      'TextField()',
      '.name(\'title\')',
      '.placeholder(\'Todo\'),',
      'Button(\'Add\')',
      '.submit(),',
      ']),',
      'List()',
      '.items(todos)',
      '.renderItem((item) =>',
      'Row()',
      '.children([',
      'Text(item.text),',
      'Button(\'Remove\')',
      '.onPress(() => todos.delete(item._id)),',
      '])',
      ')',
      '])',
    ].join('\n')
    expect(reindent(messy)).toBe([
      'const todos = listSignal([])',
      'return Column()',
      '  .children([',
      '    Form()',
      '      .flexDirection(\'row\')',
      '      .validation({',
      '        title: [\'required\'],',
      '      })',
      '      .onSubmit((value) => todos.add(value))',
      '      .children([',
      '        TextField()',
      '          .name(\'title\')',
      '          .placeholder(\'Todo\'),',
      '        Button(\'Add\')',
      '          .submit(),',
      '      ]),',
      '    List()',
      '      .items(todos)',
      '      .renderItem((item) =>',
      '        Row()',
      '          .children([',
      '            Text(item.text),',
      '            Button(\'Remove\')',
      '              .onPress(() => todos.delete(item._id)),',
      '          ])',
      '      )',
      '  ])',
    ].join('\n'))
    expect(reindent(reindent(messy))).toBe(reindent(messy))
  })

  it('indents the chain of a factory that sits on the arrow line', () => {
    const messy = [
      'List()',
      '.items(todos)',
      '.renderItem((item) => Row()',
      '.children([',
      'Text(item.text),',
      'Button(\'Remove\')',
      '.onPress(() => todos.delete(item._id)),',
      '])',
      ')',
    ].join('\n')
    expect(reindent(messy)).toBe([
      'List()',
      '  .items(todos)',
      '  .renderItem((item) => Row()',
      '    .children([',
      '      Text(item.text),',
      '      Button(\'Remove\')',
      '        .onPress(() => todos.delete(item._id)),',
      '    ])',
      '  )',
    ].join('\n'))
  })

  it('indents the body of renderItem and other arrows', () => {
    expect(suggestIndent('      .renderItem((item) =>', '', '      ')).toBe('        ')
    expect(suggestIndent('        .onPress(() =>', '', '        ')).toBe('          ')
    expect(suggestIndent('    .when(\'hover\', (s) =>', '', '    ')).toBe('      ')
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

  it('deepens Enter after .children / .children() / .children([])', () => {
    expect(planEnter('  .children', '').insert).toBe('\n    ')
    expect(planEnter('  .children()', '').insert).toBe('\n    ')
    expect(planEnter('  .children([])', '').insert).toBe('\n    ')
    expect(planEnter('  .items', '').insert).toBe('\n    ')
    expect(planEnter('  .items()', '').insert).toBe('\n    ')
    expect(planEnter('  .items([])', '').insert).toBe('\n    ')
    expect(suggestIndent('  .children([])', '.gap(8)', '  ')).toBe('  ')
  })

  it('indents the chain of a factory with nested parens on the arrow line', () => {
    const messy = [
      'List()',
      '.items(todos)',
      '.renderItem((item) => Row(Box())',
      '.children([',
      'Text(item.text),',
      '])',
      ')',
    ].join('\n')
    expect(reindent(messy)).toBe([
      'List()',
      '  .items(todos)',
      '  .renderItem((item) => Row(Box())',
      '    .children([',
      '      Text(item.text),',
      '    ])',
      '  )',
    ].join('\n'))
    expect(suggestIndent('  .renderItem((item) => Row(Box())', '.children([', '  ')).toBe('    ')
    expect(suggestIndent('  .renderItem((item) => Row(Box()).gap(8)', '.children([', '  ')).toBe('    ')
  })

  it('maps the caret onto the same token after reindent', () => {
    const before = 'List()\n.items(todos)'
    const after = reindent(before)
    expect(after).toBe('List()\n  .items(todos)')
    const pos = before.indexOf('.items') + 1
    const next = mapReindentCaret(before, after, pos)
    expect(after[next]).toBe('i')
    expect(after.slice(next, next + 5)).toBe('items')
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

  it('fills pattern with a valid regex, not a line comment', () => {
    const fill = fillFor('pattern', 'method')
    expect(fill.text.includes('//')).toBe(false)
    expect(fill.text).toBe('(/./)')
    const result = runPlay(`return TextField().pattern${fill.text}`)
    expect(result.ok).toBe(true)
  })

  it('fills list-signal methods so Run does not get a leftover string', () => {
    expect(fillFor('add', 'method', true).text).toBe('()')
    expect(fillFor('clear', 'method', true).text).toBe('()')
    expect(fillFor('set', 'method', true).text).toBe('([])')
    expect(fillFor('filter', 'method', true).text).toBe('(() => )')
    expect(fillFor('map', 'method', true).text).toBe('(() => )')
    expect(fillFor('length', 'method', true).text).toBe('')
    expect(fillFor('$length', 'method', true).text).toBe('')
    expect(fillFor('delete', 'method', true).text).toBe("('')")
    expect(fillFor('remove', 'method', true).text).toBe("('')")
    expect(fillFor('filter', 'method').text).toBe("('')")
    expect(fillFor('filter', 'method', false).text).toBe("('')")
  })

  it('runs the signal fills without a leftover string argument', () => {
    const add = fillFor('add', 'method', true)
    expect(runPlay(`const todos = listSignal([])\ntodos.add${add.text}\nreturn Text('ok')`).ok).toBe(true)
    const len = fillFor('length', 'method', true)
    expect(runPlay(`const todos = listSignal([])\nconst n = todos.length${len.text}\nreturn Text(String(n))`).ok).toBe(true)
    const set = fillFor('set', 'method', true)
    expect(runPlay(`const todos = listSignal([])\ntodos.set${set.text}\nreturn Text('ok')`).ok).toBe(true)
    const dollar = fillFor('$length', 'method', true)
    expect(runPlay(`const todos = listSignal([])\nreturn Text('n' + todos.$length${dollar.text})`).ok).toBe(true)
    const del = fillFor('delete', 'method', true)
    expect(runPlay(`const todos = listSignal([])\ntodos.delete${del.text}\nreturn Text('ok')`).ok).toBe(true)
  })

  it('does not string-fill Chip or IconButton — they are not exports', () => {
    expect(fillFor('Chip', 'factory').text).toBe('()')
    expect(fillFor('IconButton', 'factory').text).toBe('()')
    expect(fillFor('Badge', 'factory').text).toBe("('')")
  })

  it('does not suggest factories that Run cannot see', () => {
    const dead = FACTORY_NAMES.filter((name) => typeof (fiboui as Record<string, unknown>)[name] !== 'function')
    expect(dead).toEqual([])
    for (const name of ['ActionCard', 'CardSvg', 'InfoCard', 'InputCard', 'MetricCard']) {
      expect(FACTORY_NAMES).not.toContain(name)
    }
    expect(runPlay('return ActionCard()').ok).toBe(false)
    expect(runPlay('return Badge()').ok).toBe(true)
  })

  it('fills insert and move so Run does not throw', () => {
    const insert = fillFor('insert', 'method', true)
    expect(insert.text).toBe('(0, {})')
    expect(runPlay(`const todos = listSignal([])\ntodos.insert${insert.text}\nreturn Text('ok')`).ok).toBe(true)
    const move = fillFor('move', 'method', true)
    expect(move.text).toBe('(0, 0)')
    expect(runPlay(`const todos = listSignal([{ text: 'a' }, { text: 'b' }])\ntodos.move${move.text}\nreturn Text('ok')`).ok).toBe(true)
    expect(fillFor('add', 'method', true).text).toBe('()')
  })

  it('lists delete and $length on a list-signal receiver', () => {
    expect([...SIGNAL_METHODS]).toContain('delete')
    expect([...SIGNAL_METHODS]).toContain('$length')
    const q = queryAt('todos.$le', 'todos.$le'.length)
    expect(q?.kind).toBe('method')
    expect(q?.signal).toBe(true)
    expect(q?.partial).toBe('$le')
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

  it('runs the Hello, Button and Form samples', () => {
    expect(runPlay(helloExample).ok).toBe(true)
    expect(runPlay(buttonExample).ok).toBe(true)
    expect(runPlay(formExample).ok).toBe(true)
  })

  it('runs Button().type("submit") as written — no rewrite to .submit()', () => {
    const src = readFileSync(
      resolve(__dirname, '../examples/site/src/modules/site/Views/playground/run.ts'),
      'utf8',
    )
    expect(src).not.toContain('function fixButtonType')
    expect(src).not.toContain('.htmlType(\'button\')')
    const result = runPlay("return Form().children([\n  Button('Send').type('submit'),\n])")
    expect(result.ok).toBe(true)
  })
})

describe('site routes', () => {
  it('maps /play and /shop, plus leftover /playground and /store aliases', () => {
    expect(pathToRoute('/')).toBe('home')
    expect(pathToRoute('/play')).toBe('play')
    expect(pathToRoute('/play/')).toBe('play')
    expect(pathToRoute('/playground')).toBe('play')
    expect(pathToRoute('/shop')).toBe('shop')
    expect(pathToRoute('/shop/')).toBe('shop')
    expect(pathToRoute('/store')).toBe('shop')
  })

  it('home shop CTA opens in-app /shop, not the old store host', () => {
    const src = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/Views/Home.ts'), 'utf8')
    expect(src).not.toContain('fiboui-store.vercel.app')
    expect(src).toContain("navigate('shop')")
  })

  it('App mounts MenuOverlay so /play hamburger is not a dead control', () => {
    const app = readFileSync(resolve(__dirname, '../examples/site/src/main/App.ts'), 'utf8')
    const site = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/Views/SitePage.ts'), 'utf8')
    expect(app).toContain('MenuOverlay')
    expect(site).not.toContain('MenuOverlay')
  })

  it('boots location.hash after mount so /#work is not a dead link', () => {
    const main = readFileSync(resolve(__dirname, '../examples/site/src/main.ts'), 'utf8')
    const ui = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/Views/ui.ts'), 'utf8')
    expect(main).toContain('bootHash')
    expect(ui).toContain('export function bootHash')
    expect(ui).toContain('location.hash')
    expect(ui).toContain('getElementById')
  })

  it('go() waits for the anchor instead of a fixed two-rAF hop', () => {
    const ui = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/Views/ui.ts'), 'utf8')
    expect(ui).toContain('waitScroll')
    expect(ui).not.toMatch(/requestAnimationFrame\(\(\) => \{\s*requestAnimationFrame\(\(\) => scrollTo/)
  })

  it('waitScroll stamps location.hash so Work is a real /#work link', () => {
    const ui = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/Views/ui.ts'), 'utf8')
    expect(ui).toMatch(/scrollTo\([^\n]*hash:\s*true/)
  })

  it('restores /#work after back from /play or /shop', () => {
    const ui = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/Views/ui.ts'), 'utf8')
    expect(ui).toContain("addEventListener('popstate'")
    expect(ui).toContain("addEventListener('hashchange'")
    expect(ui).toMatch(/popstate[\s\S]*bootHash/)
    expect(ui).toMatch(/hashchange[\s\S]*bootHash/)
  })

  it('navigate home drops leftover hash so Home is not stuck on /#work', () => {
    const src = readFileSync(resolve(__dirname, '../examples/site/src/modules/site/route.ts'), 'utf8')
    expect(src).toContain('location.hash')
    expect(src).toMatch(/history\.pushState\([^)]*path/)
  })
})

describe('playground imports', () => {
  it('scaffolds an import from lucide-react', () => {
    const fill = fillFor('import', 'function')
    expect(`import${fill.text}`).toBe("import {  } from 'lucide-react'")
    expect(fill.start).toBe(3)
  })

  it('reads a named icon import and drops it from the body', () => {
    const taken = takeImports("import { Search as Glass } from 'lucide-react'\nreturn Text('a')")
    expect(taken.error).toBeNull()
    expect(taken.specs).toEqual([{ module: 'lucide-react', bindings: [{ local: 'Glass', imported: 'Search' }] }])
    expect(taken.body).not.toContain('import')
    expect(taken.body).toContain("return Text('a')")
  })

  it('reads an import split across lines', () => {
    const taken = takeImports("import {\n  Search,\n} from 'lucide-react'\nreturn Text('a')")
    expect(taken.error).toBeNull()
    expect(taken.specs[0]?.bindings).toEqual([{ local: 'Search', imported: 'Search' }])
  })

  it('rejects modules other than lucide-react', () => {
    const taken = takeImports("import { x } from 'left-pad'\nreturn Text('a')")
    expect(taken.error).toContain('lucide-react')
  })

  it('binds the imported icon into the preview', async () => {
    const resolved = await resolveImportScope(
      [{ module: 'lucide-react', bindings: [{ local: 'Search', imported: 'Search' }] }],
      async () => ({ Search() { return null } }),
    )
    expect(resolved.ok).toBe(true)
    if (!resolved.ok) return
    const result = runPlay('return Text(Search.name)', resolved.scope)
    expect(result.ok).toBe(true)
  })

  it('suggests icon names inside the import braces', () => {
    const at = queryAt("import { Sea } from 'lucide-react'", 'import { Sea'.length)
    expect(at).toEqual({ kind: 'import', partial: 'Sea', from: 'import { '.length, signal: false })
  })
})

describe('site CSS', () => {
  it('does not collapse reset textarea to 1lh', () => {
    const css = readFileSync(resolve(__dirname, '../examples/site/src/site.css'), 'utf8')
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const blocks = withoutComments.split('}')
    for (const block of blocks) {
      if (/\.fibo-reset\s+textarea/.test(block) && /height\s*:\s*1lh/.test(block)) {
        throw new Error('site.css still forces reset textarea to height: 1lh')
      }
    }
    expect(withoutComments).toMatch(/\.fibo-reset\s+textarea/)
    expect(withoutComments).toMatch(/height\s*:\s*auto/)
  })
})
