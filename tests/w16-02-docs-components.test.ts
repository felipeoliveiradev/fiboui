import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Avatar } from '../src/content/Avatar'
import { Progress } from '../src/content/Progress'
import { Skeleton } from '../src/content/Skeleton'
import { Text } from '../src/content/Text'
import { Button } from '../src/interactive/Button'
import { Box } from '../src/structure/Box'
import { url } from '../src/interactive/Form/validators'

const DOCS = join(process.cwd(), 'docs/components')

function readDoc(name: string): string {
  return readFileSync(join(DOCS, name), 'utf8')
}

function ownMethods(builder: object): Set<string> {
  const names = new Set<string>()
  let proto: object | null = Object.getPrototypeOf(builder)
  while (proto && proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key !== 'constructor' && typeof (proto as Record<string, unknown>)[key] === 'function') {
        names.add(key)
      }
    }
    proto = Object.getPrototypeOf(proto)
  }
  return names
}

describe('W16-02 component docs vs code', () => {
  it('Button has shape/onPress, not pill/iconRight/loading', () => {
    const methods = ownMethods(Button('x'))
    expect(methods.has('shape')).toBe(true)
    expect(methods.has('onPress')).toBe(true)
    expect(methods.has('pill')).toBe(false)
    expect(methods.has('iconRight')).toBe(false)
    expect(methods.has('loading')).toBe(false)
  })

  it('Avatar has image, src alias, and initials', () => {
    const names = ownMethods(Avatar())
    expect(names.has('image')).toBe(true)
    expect(names.has('src')).toBe(true)
    expect(names.has('initials')).toBe(true)
  })

  it('Text has text/nowrap/italic/underline, not content/truncate', () => {
    const methods = ownMethods(Text('x'))
    expect(methods.has('text')).toBe(true)
    expect(methods.has('nowrap')).toBe(true)
    expect(methods.has('italic')).toBe(true)
    expect(methods.has('underline')).toBe(true)
    expect(methods.has('content')).toBe(false)
    expect(methods.has('truncate')).toBe(false)
  })

  it('Box has width/height/flexDirection, not w/h/col/flex1/maxW', () => {
    const methods = ownMethods(Box())
    expect(methods.has('width')).toBe(true)
    expect(methods.has('height')).toBe(true)
    expect(methods.has('flexDirection')).toBe(true)
    expect(methods.has('w')).toBe(false)
    expect(methods.has('h')).toBe(false)
    expect(methods.has('col')).toBe(false)
    expect(methods.has('flex1')).toBe(false)
    expect(methods.has('maxW')).toBe(false)
    expect(methods.has('minW')).toBe(false)
  })

  it('Progress has variant; Skeleton has shape, not variant', () => {
    expect(ownMethods(Progress()).has('variant')).toBe(true)
    expect(ownMethods(Skeleton()).has('shape')).toBe(true)
    expect(ownMethods(Skeleton()).has('variant')).toBe(false)
  })

  it('url() only accepts http/https', () => {
    expect(url().check('https://example.com', {})).toBe(true)
    expect(url().check('ftp://example.com', {})).toBe(false)
    expect(url().check('javascript:alert(1)', {})).toBe(false)
  })

  it('interactive-button.md matches Button API', () => {
    const md = readDoc('interactive-button.md')
    expect(md).not.toMatch(/\.pill\(/)
    expect(md).not.toMatch(/\.iconRight\(/)
    expect(md).not.toMatch(/\.loading\(/)
    expect(md).not.toMatch(/variant\('secondary'\)/)
    expect(md).toMatch(/\.shape\('pill'\)/)
    expect(md).toMatch(/\.onPress\(/)
  })

  it('content-all.md Avatar/Progress/Skeleton use real methods', () => {
    const md = readDoc('content-all.md')
    expect(md).toMatch(/Avatar\(\)\.(image|src)\(/)
    expect(md).not.toMatch(/Progress\(\)\.value\(75\)\.variant\('success'\)/)
    expect(md).not.toMatch(/Skeleton\(\)\.variant\(/)
    expect(md).toMatch(/Skeleton\(\)\.shape\(/)
  })

  it('structure-all.md defines every render* it mounts', () => {
    const md = readDoc('structure-all.md')
    const mounted = [...md.matchAll(/:component="(render\w+)"/g)].map((m) => m[1])
    expect(mounted.length).toBeGreaterThan(0)
    for (const name of mounted) {
      expect(md).toMatch(new RegExp(`const ${name}\\s*=`))
    }
  })

  it('content-text.md does not advertise dead Text helpers', () => {
    const md = readDoc('content-text.md')
    expect(md).not.toMatch(/`\.content\(/)
    expect(md).not.toMatch(/`\.truncate\(\)`/)
    expect(md).toMatch(/`\.text\(/)
    expect(md).toMatch(/`\.italic\(\)`/)
    expect(md).toMatch(/`\.underline\(\)`/)
  })

  it('layout docs use width/height, not w/h/flex1/col', () => {
    const layoutAll = readDoc('layout-all.md')
    expect(layoutAll).not.toMatch(/\.flex1\(/)
    expect(layoutAll).not.toMatch(/\.col\(/)
    expect(layoutAll).not.toMatch(/\.h\(/)
    expect(layoutAll).not.toMatch(/\.w\(/)
    const inputs = readDoc('interactive-inputs.md')
    expect(inputs).not.toMatch(/\.maxW\(/)
  })

  it('layout-scaffold.md uses bottomAppBar/useProvider, not Footer/consume chain', () => {
    const md = readDoc('layout-scaffold.md')
    expect(md).not.toMatch(/\bFooter\s*\(/)
    expect(md).not.toMatch(/\.consume\('theme'\)\s*\n\s*\.backgroundColor/)
    expect(md).toMatch(/bottomAppBar/)
    expect(md).not.toMatch(/footerBar/)
    expect(md).toMatch(/useProvider/)
  })

  it('interactive-form.md says url() is http/https', () => {
    const md = readDoc('interactive-form.md')
    expect(md).toMatch(/http\/https|http:|https:/)
  })
})
