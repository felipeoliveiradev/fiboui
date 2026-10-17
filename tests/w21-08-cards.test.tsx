import { isValidElement, type ReactElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../src/interactive/Button'
import { Form, required } from '../src/interactive/Form'
import { AssetCard } from '../src/structure/cards/AssetCard'
import { CollectionCard } from '../src/structure/cards/CollectionCard'
import { ContentCard } from '../src/structure/cards/ContentCard'
import {
  ActionCard,
  InfoCard,
  InputCard,
  MetricCard,
} from '../src/structure/cards/variants'
import * as cardsBarrel from '../src/structure/cards'

afterEach(cleanup)

function imgSrc(node: Parameters<typeof render>[0]): string {
  const { container } = render(node)
  const img = container.querySelector('img')
  return img?.getAttribute('src') ?? ''
}

function styleDump(root: HTMLElement): string {
  const nodes = [root, ...Array.from(root.querySelectorAll('*'))] as HTMLElement[]
  return nodes
    .map((el) => `${el.style.backgroundImage} ${el.getAttribute('style') ?? ''} ${el.getAttribute('src') ?? ''}`)
    .join('\n')
}

describe('W21-08 InputCard dual .type() leftover', () => {
  it('.type("email") sets the HTML input type (proxy dual-use, no second swallowed .type())', () => {
    const node = InputCard().type('email').placeholder('E')
    expect(isValidElement(node)).toBe(true)
    render(node)
    expect(screen.getByPlaceholderText('E')).toHaveAttribute('type', 'email')
  })

  it('.type("password") reaches the native input', () => {
    render(InputCard().type('password').placeholder('Pwd').build())
    expect(screen.getByPlaceholderText('Pwd')).toHaveAttribute('type', 'password')
  })

  it('.props({ type: "email" }) is not overwritten by the default text type', () => {
    render(InputCard().placeholder('ViaProps').props({ type: 'email' }).build())
    expect(screen.getByPlaceholderText('ViaProps')).toHaveAttribute('type', 'email')
  })

  it('rest.type cannot leak a function / checkbox onto the input', () => {
    render(
      InputCard()
        .placeholder('Safe')
        .props({ type: 'checkbox' as never })
        .build(),
    )
    const input = screen.getByPlaceholderText('Safe') as HTMLInputElement
    expect(input.type).toBe('text')
    expect(input.getAttribute('type')).toBe('text')
  })
})

describe('W21-08 form field cards name / rules', () => {
  it('InputCard().name() lands on the native input for FormData', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          InputCard().name('email').placeholder('Mail'),
          Button('Save').submit(),
        ])
        .build() as ReactElement,
    )
    const input = screen.getByPlaceholderText('Mail') as HTMLInputElement
    expect(input).toHaveAttribute('name', 'email')
    fireEvent.change(input, { target: { value: 'a@b.c' } })
    fireEvent.submit(input.closest('form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.c' })
  })

  it('InputCard().rules() run on Form submit', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          InputCard().name('email').placeholder('Need').rules(required('Need email')),
          Button('Save').submit(),
        ])
        .build() as ReactElement,
    )
    fireEvent.submit(screen.getByPlaceholderText('Need').closest('form')!)
    expect(await screen.findByText('Need email')).toBeTruthy()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('ActionCard withSwitch forwards .name() into FormData', async () => {
    const onSubmit = vi.fn()
    render(
      Form()
        .onSubmit(onSubmit)
        .children([
          ActionCard().title('Dark').withSwitch().name('dark'),
          Button('Save').submit(),
        ])
        .build() as ReactElement,
    )
    const toggle = screen.getByRole('switch') as HTMLInputElement
    expect(toggle).toHaveAttribute('name', 'dark')
    fireEvent.click(toggle)
    fireEvent.submit(toggle.closest('form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual({ dark: 'on' })
  })
})

describe('W21-08 ActionCard keyboard', () => {
  it('.onClick() is keyboard-activatable (Enter / Space)', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      ActionCard()
        .title('Go')
        .onClick(onClick)
        .props({ 'data-testid': 'action-card' })
        .build(),
    )
    const host = screen.getByTestId('action-card')
    expect(host).toHaveAttribute('role', 'button')
    expect(host).toHaveAttribute('tabindex', '0')
    host.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('locks role=button when pressable even if props try to clobber it', () => {
    render(
      ActionCard()
        .title('Go')
        .onClick(() => undefined)
        .props({ role: 'presentation', 'data-testid': 'act' })
        .build(),
    )
    const el = screen.getByTestId('act')
    expect(el).toHaveAttribute('role', 'button')
    expect(screen.getByRole('button', { name: 'Go' })).toBe(el)
  })

  it('withButton action is a real button in the tab order', async () => {
    const user = userEvent.setup()
    const onPress = vi.fn()
    render(ActionCard().title('Notify').withButton('Enable', onPress).build())
    const btn = screen.getByRole('button', { name: 'Enable' })
    btn.focus()
    await user.keyboard('{Enter}')
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('non-pressable ActionCard keeps a custom role from props', () => {
    render(
      ActionCard()
        .title('Row')
        .props({ role: 'listitem', 'data-testid': 'row' })
        .build(),
    )
    const el = screen.getByTestId('row')
    expect(el).toHaveAttribute('role', 'listitem')
    expect(el).not.toHaveAttribute('tabindex')
  })
})

describe('W21-08 image card javascript: src', () => {
  it('AssetCard strips javascript: src', () => {
    expect(
      imgSrc(AssetCard().image('javascript:alert(1)').title('Ada').price('1').likes('0').build()),
    ).not.toMatch(/javascript/i)
  })

  it('CollectionCard strips javascript: src and does not paint it as CSS', () => {
    const { container } = render(
      CollectionCard().image('javascript:alert(1)').title('Visions').author('Ada').build(),
    )
    const src = container.querySelector('img')?.getAttribute('src') ?? ''
    expect(src).not.toMatch(/javascript/i)
    expect(styleDump(container)).not.toMatch(/javascript/i)
  })

  it('ContentCard strips javascript: src', () => {
    expect(imgSrc(ContentCard().image('javascript:alert(1)').title('Story').build())).not.toMatch(
      /javascript/i,
    )
  })

  it('AssetCard rest.image cannot override a safe src with javascript:', () => {
    const src = imgSrc(
      AssetCard()
        .image('/ok.png')
        .title('Ok')
        .price('1')
        .likes('0')
        .props({ image: 'javascript:alert(1)' })
        .build(),
    )
    expect(src).not.toMatch(/javascript/i)
    expect(src).toBe('/ok.png')
  })

  it('CollectionCard rest.image cannot override a safe src with javascript:', () => {
    const { container } = render(
      CollectionCard()
        .image('/ok.png')
        .title('Ok')
        .author('Ada')
        .props({ image: 'javascript:alert(1)' })
        .build(),
    )
    const src = container.querySelector('img')?.getAttribute('src') ?? ''
    expect(src).not.toMatch(/javascript/i)
    expect(src).toBe('/ok.png')
    expect(styleDump(container)).not.toMatch(/javascript/i)
  })

  it('strips data: / vbscript: / file: and odd javascript: casing', () => {
    for (const src of [
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'file:///etc/passwd',
      'JAVASCRIPT:alert(1)',
      '  javascript:alert(1)',
      '\tjavascript:alert(1)',
      '\uFEFFjavascript:alert(1)',
    ]) {
      expect(
        imgSrc(AssetCard().image(src).title('X').price('1').likes('0').build()),
        src,
      ).not.toMatch(/javascript|data:|vbscript|file:/i)
      cleanup()
    }
  })

  it('keeps http(s) and relative image src', () => {
    expect(
      imgSrc(
        AssetCard().image('https://example.com/a.png').title('Https').price('1').likes('0').build(),
      ),
    ).toBe('https://example.com/a.png')
    cleanup()
    expect(
      imgSrc(ContentCard().image('/logo.png').title('Rel').build()),
    ).toBe('/logo.png')
  })
})

describe('W21-08 cards/index exports', () => {
  it('barrel exports every specialized + variant factory', () => {
    const names = [
      'ActionCard',
      'AssetCard',
      'CollectionCard',
      'ContentCard',
      'InfoCard',
      'InputCard',
      'MetricCard',
      'ProfileCard',
    ] as const
    for (const name of names) {
      expect(typeof (cardsBarrel as Record<string, unknown>)[name], name).toBe('function')
    }
    expect(typeof InfoCard).toBe('function')
    expect(typeof MetricCard).toBe('function')
  })
})
