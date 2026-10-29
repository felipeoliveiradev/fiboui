import { describe, expect, it } from 'vitest'
import { TextField, createComponent, preset } from '../src'

describe('createComponent()', () => {
  it('wraps a normal function that returns a builder (memo-style)', () => {
    const glassField = () => {
      return TextField().variant('outlined').rounded(16).className('cubee-field')
    }
    const GlassField = createComponent(glassField)

    const field = GlassField()
      .label('E-mail')
      .name('email')
      .type('email')
      .placeholder('voce@email.com')
      .id('email')

    expect(typeof (field as { build?: unknown }).build).toBe('function')
    const classes = (field as unknown as { _classNames?: string[] })._classNames ?? []
    expect(classes.join(' ')).toContain('cubee-field')
  })

  it('optional base factory injects { f } into the body', () => {
    const GlassField = createComponent(TextField, ({ f }) => {
      return f.variant('outlined').rounded(16).className('cubee-field')
    })
    const field = GlassField().label('Senha').name('password')
    const classes = (field as unknown as { _classNames?: string[] })._classNames ?? []
    expect(classes.join(' ')).toContain('cubee-field')
  })

  it('preset is an alias of createComponent', () => {
    expect(preset).toBe(createComponent)
  })
})
