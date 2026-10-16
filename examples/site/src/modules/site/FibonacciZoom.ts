/**
 * Exact port of the zoom loop from
 * https://codepen.io/thehack/pen/PzaarZ
 *
 * Mount with FibonacciSpiral() — fiboui Box + canvas child.
 * Box.props({ ref }) does not forward through memo; bind on the canvas node.
 */

import { createElement } from 'react'
import { Box } from 'fiboui/structure'

/** CodePen uses 1.027/frame — slower for a calmer hero loop */
const GROW = 1.008
const SIZE_MIN = 0.2
const SIZE_MAX = 1.3
const FIB_CAP = 6008

const DIRECTIONS: [number, number][] = [
  [-1, -1],
  [-1, 1],
  [1, 1],
  [1, -1],
]

const ARC_RANGE: [number, number][] = [
  [0, 1.5],
  [1.5, 1],
  [1, 0.5],
  [0.5, 0],
]

const WAYS: [number, number][] = [
  [-1, -1],
  [-1, -1],
  [-1, 1],
  [1, -1],
]

function strokeSpiral(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  size: number,
  lastValue: number,
  value: number,
  step: number,
  xAdjust: number,
  yAdjust: number,
  lastYAdjust: number,
  i: number,
) {
  if (i > 3) i = 0
  if (step === 1) yAdjust = size
  if (value > FIB_CAP) return

  ctx.arc(
    startX + xAdjust * DIRECTIONS[i][0],
    startY + yAdjust * DIRECTIONS[i][1],
    value * size,
    ARC_RANGE[i][0] * Math.PI,
    ARC_RANGE[i][1] * Math.PI,
    true,
  )
  i += 1
  if (step % 2 === 0) {
    const old = yAdjust
    strokeSpiral(
      ctx,
      startX,
      startY,
      size,
      value,
      lastValue + value,
      step + 1,
      xAdjust,
      Math.pow(Math.sqrt(lastYAdjust) + Math.sqrt(yAdjust), 2),
      old,
      i,
    )
  } else {
    strokeSpiral(
      ctx,
      startX,
      startY,
      size,
      value,
      lastValue + value,
      step + 1,
      xAdjust + yAdjust,
      yAdjust,
      lastYAdjust,
      i,
    )
  }
}

function strokeRects(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  size: number,
  moveX: number,
  moveY: number,
  lastValue: number,
  value: number,
  i: number,
) {
  if (value > FIB_CAP) return
  const x = startX + WAYS[i][0] * moveX * size
  const y = startY + WAYS[i][1] * moveY * size
  const s = value * size
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fillRect(x, y, s, s)
  ctx.rect(x, y, s, s)

  if (i === 3) {
    strokeRects(ctx, startX, startY, size, moveX + moveY, lastValue + value + moveY, value, lastValue + value, 0)
  } else if (i === 0) {
    strokeRects(ctx, startX, startY, size, lastValue + value + moveX, moveY, value, lastValue + value, i + 1)
  } else if (i === 1) {
    strokeRects(ctx, startX, startY, size, moveX, value - moveY, value, lastValue + value, i + 1)
  } else {
    strokeRects(ctx, startX, startY, size, value - moveX, lastValue - moveY, value, lastValue + value, i + 1)
  }
}

let raf = 0
let boundCanvas: HTMLCanvasElement | null = null
let ro: ResizeObserver | null = null

function stopFibonacciZoom() {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  if (ro) {
    ro.disconnect()
    ro = null
  }
  boundCanvas = null
}

function bindFibonacciZoom(canvas: HTMLCanvasElement) {
  if (boundCanvas === canvas && raf) return
  stopFibonacciZoom()
  boundCanvas = canvas

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let cssW = 1
  let cssH = 1
  let dpr = 1

  const resize = () => {
    dpr = Math.min(2, globalThis.devicePixelRatio || 1)
    cssW = Math.max(1, canvas.clientWidth)
    cssH = Math.max(1, canvas.clientHeight)
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
  }
  resize()
  ro = new ResizeObserver(resize)
  ro.observe(canvas)

  let size = SIZE_MIN

  const tick = () => {
    if (boundCanvas !== canvas) return
    while (size > SIZE_MAX) size *= SIZE_MIN / SIZE_MAX

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, cssW, cssH)

    const startX = cssW * 0.5
    const startY = cssH * 0.5
    const unit = size * (Math.min(cssW, cssH) / 420)

    ctx.beginPath()
    strokeSpiral(ctx, startX, startY, unit, 1, 1, 0, 0, 0, 0, 0)
    strokeRects(ctx, startX, startY, unit, 0, 1, 1, 1, 0)

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.35
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()

    size *= GROW
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

/** Full-bleed φ-zoom for the pink hero band. */
export function FibonacciSpiral() {
  return Box()
    .position('absolute')
    .inset(0)
    .overflow('hidden')
    .pointerEvents('none')
    .children([
      createElement('canvas', {
        key: 'fib-zoom',
        'aria-label': 'Fibonacci golden spiral zoom',
        style: {
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none',
        },
        ref: (canvas: HTMLCanvasElement | null) => {
          if (canvas) bindFibonacciZoom(canvas)
          else stopFibonacciZoom()
        },
      }),
    ])
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    if (boundCanvas) bindFibonacciZoom(boundCanvas)
  })
}
