import { describe, expect, it } from 'vitest'
import { buttonExample, formExample, helloExample } from '../examples/site/src/modules/site/Views/playground/examples'
import { runPlay } from '../examples/site/src/modules/site/Views/playground/run'

describe('playground auto-return', () => {
  it('still wraps a root builder when a callback contains return', () => {
    const result = runPlay(`Column().children([
  Button('x').onPress(() => { return 1 }),
])`)
    expect(result.ok).toBe(true)
  })

  it('still wraps Form when onSubmit returns a value', () => {
    const result = runPlay(`Form()
  .onSubmit((values) => {
    return values
  })
  .children([
    Button('Send').type('submit'),
  ])`)
    expect(result.ok).toBe(true)
  })

  it('does not double-wrap a top-level return', () => {
    expect(runPlay(helloExample).ok).toBe(true)
    expect(runPlay(buttonExample).ok).toBe(true)
    expect(runPlay(formExample).ok).toBe(true)
  })

  it('does not treat return inside a string as a top-level return', () => {
    const result = runPlay("Column().children([\n  Text('press return'),\n])")
    expect(result.ok).toBe(true)
  })
})
