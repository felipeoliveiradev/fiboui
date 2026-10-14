# Troubleshooting

## Styles look unstyled / preflight wiped headings

You forgot `import 'fiboui/style.css'`. `Text().variant('h1')` also applies an inline rem scale so headings stay visible under Tailwind preflight.

## `require is not defined` / `ERR_REQUIRE_ESM`

The package is ESM-only. Use `import`. Set `"type": "module"` in the consumer or use a bundler.

## `Cannot find module 'fiboui/src/...'`

`src/` is not published. Import from `fiboui` or a subpath (`fiboui/layout`, …).

## Next.js: window / document errors

Add `'use client'` to the module that constructs builders. Do not call `mount()` inside the App Router.

## `useFiboTheme` / `useRouter` throws

Those hooks require `FiboThemeProvider` and `Router` ancestors.

## Hover transform “jumps”

Chain `.scale()` and `.translateY()` on the **same** `PseudoStateBuilder` so they compose. Two separate `.hover()` calls that each set `transform` will fight.

## Duration “stacks”

Call `.duration(ms)` once per builder. 2.2 replaces the previous transition class instead of appending another.

## `Button.onHover` vs `.hover()`

`onHover(fn)` is a `mouseenter` callback. Visual hover is `.hover(h => …)`.

## Sticky header covers the hash target

Use `.anchor('id')` (adds `scroll-margin-top`) and `.sticky()` on the header (publishes `--fibo-sticky-offset`). Override with `.scrollMargin(n)`.

## List items remount on every keystroke

Set `.key(stableId)` on each mapped builder. Do not use the array index if the list can reorder.

## Signals do not update the UI

- `Text(() => sig.value)` or `bindText(sig)` for text
- `.bindSignal(sig)` / `.observer()` + function `.children(() => …)` for trees
- `useSignal(sig)` inside a React function component

Reading `sig.value` during a one-time assemble does not subscribe.
