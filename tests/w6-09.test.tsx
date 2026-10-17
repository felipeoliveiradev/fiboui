import { type ReactElement } from 'react'
import { renderToString } from 'react-dom/server'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Avatar, Icon, Integration, Progress } from '../src'

afterEach(cleanup)

describe('Progress leftover a11y', () => {
  it('extra props do not clobber progressbar', () => {
    render(
      Progress()
        .value(40)
        .max(80)
        .label('Upload')
        .id('prog-upload')
        .props({ role: 'presentation', 'data-testid': 'prog-upload' })
        .build(),
    )
    const bar = screen.getByTestId('prog-upload')
    expect(bar).toHaveAttribute('id', 'prog-upload')
    expect(bar).toHaveAttribute('role', 'progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '80')
    expect(bar).toHaveAttribute('aria-label', 'Upload')
  })

  it('variants keep progressbar when extra role tries to drop it', () => {
    for (const variant of ['ring', 'circular', 'segments', 'steps', 'floating'] as const) {
      const { unmount } = render(
        Progress()
          .value(40)
          .max(100)
          .variant(variant)
          .label('Load')
          .props({ role: 'presentation', 'data-testid': `prog-${variant}` })
          .build(),
      )
      const bar = screen.getByTestId(`prog-${variant}`)
      expect(bar).toHaveAttribute('role', 'progressbar')
      expect(bar).toHaveAttribute('aria-valuenow', '40')
      unmount()
    }
  })

  it('circular SVG is hidden from AT (same as ring)', () => {
    const { container, unmount } = render(
      Progress().value(40).max(100).variant('circular').label('Load').build(),
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    unmount()

    const ring = render(Progress().value(40).variant('ring').size(80).label('Ring').build())
    expect(ring.container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Avatar leftover props', () => {
  it('id and extra props land; extra role does not drop img', () => {
    render(
      Avatar()
        .initials('AB')
        .id('av-ab')
        .props({ role: 'presentation', 'data-testid': 'av-ab' })
        .build(),
    )
    const el = screen.getByTestId('av-ab')
    expect(el).toHaveAttribute('id', 'av-ab')
    expect(el).toHaveAttribute('role', 'img')
    expect(el).toHaveAttribute('aria-label', 'AB')
  })

  it('renderToString does not throw', () => {
    expect(() =>
      renderToString(Avatar().initials('XY').src('/face.png').alt('Face').build() as ReactElement),
    ).not.toThrow()
  })
})

describe('Icon / Integration invalid source', () => {
  it('Icon plain object does not crash', () => {
    expect(() => render(Icon({ foo: 1 } as never).build())).not.toThrow()
    expect(() => render(Icon(42 as never).build())).not.toThrow()
  })

  it('Integration plain object does not crash', () => {
    expect(() => render(Integration({ foo: 1 } as never).build())).not.toThrow()
  })

  it('Icon still paints a URL as an image', () => {
    const { container } = render(Icon('https://cdn.example/icon.svg').build())
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://cdn.example/icon.svg')
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })
})
