import { StrictMode, createElement, type ReactNode } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Chart } from '../src/content/Chart'
import { googleEngine, leafletEngine, MapView } from '../src/content/MapView'
import { PhotosPicker } from '../src/interactive/PhotosPicker'
import { barPercent, conicGradient, pieSlices, project } from '../src/content/Chart/geometry'

afterEach(cleanup)

describe('chart geometry', () => {
  it('splits a pie into equal clockwise slices and a matching gradient', () => {
    const slices = pieSlices([1, 1])
    expect(slices[0].end - slices[0].start).toBeCloseTo(Math.PI)
    expect(slices[1].end - slices[0].start).toBeCloseTo(Math.PI * 2)
    expect(conicGradient([
      { value: 1, color: '#111' },
      { value: 1, color: '#222' },
    ])).toContain('50%')
    expect(barPercent(25, 100)).toBe(25)
  })

  it('projects the centre of the bounds to the middle of the view', () => {
    const at = project(10, 20, { minLat: 0, maxLat: 20, minLng: 0, maxLng: 40 })
    expect(at).toEqual({ x: 0.5, y: 0.5 })
  })
})

describe('Chart, MapView, PhotosPicker', () => {
  it('draws a css pie and a css bar chart', () => {
    const pie = render(
      Chart().type('pie').renderer('css').series([{ data: [1, 3] }]).build() as never,
    )
    const disc = pie.container.querySelector('[aria-label="pie chart"]') as HTMLElement
    expect(disc.style.backgroundImage || disc.style.background).toContain('conic-gradient')
    pie.unmount()

    render(
      Chart().type('bar').renderer('css').series([{ data: [2, 4] }]).labels(['A', 'B']).build() as never,
    )
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('places a map pin from latitude and longitude', () => {
    render(
      MapView().markers([{ lat: 10, lng: 20, label: 'Studio' }]).build() as never,
    )
    const pin = screen.getByRole('button', { name: 'Studio' }) as HTMLElement
    expect(pin.style.left).toBe('50%')
    expect(pin.style.top).toBe('50%')
  })

  it('mounts Leaflet when the namespace is passed and asks for a Google key otherwise', () => {
    const leaflet = {
      map(el: HTMLElement) {
        el.dataset.engine = 'leaflet'
        return { setView() {}, fitBounds() {}, remove() {} }
      },
      tileLayer(url: string) {
        const host = document.querySelector('.fibo-map')
        if (host) host.setAttribute('data-tiles', url)
        return { addTo() {} }
      },
      marker() {
        return {
          addTo() { return this },
          bindPopup() { return this },
          on() { return this },
          remove() {},
        }
      },
    }
    const view = render(
      MapView().engine(leafletEngine({ leaflet })).markers([{ lat: 1, lng: 2, label: 'A' }]).build() as never,
    )
    expect(view.container.querySelector('.fibo-map')?.getAttribute('data-engine')).toBe('leaflet')
    view.unmount()

    const dark = render(
      MapView().theme('noir').engine(leafletEngine({ leaflet })).markers([{ lat: 1, lng: 2 }]).build() as never,
    )
    const darkHost = dark.container.querySelector('.fibo-map') as HTMLElement | null
    expect(darkHost?.dataset.basemap).toBe('dark')
    expect(darkHost?.dataset.tiles).toContain('openstreetmap')
    dark.unmount()

    render(MapView().engine(googleEngine()).build() as never)
    expect(screen.getByText(/apiKey/)).toBeTruthy()
  })

  it('removes a leaflet map before React mounts the container again', () => {
    let maps = 0
    const leaflet = {
      map(el: HTMLElement) {
        maps += 1
        if (el.dataset.ready === '1') throw new Error('Map container is already initialized.')
        el.dataset.ready = '1'
        return {
          setView() {},
          fitBounds() {},
          remove() {
            el.dataset.ready = ''
          },
        }
      },
      tileLayer() {
        return { addTo() {} }
      },
      marker() {
        return {
          addTo() { return this },
          bindPopup() { return this },
          on() { return this },
          remove() {},
        }
      },
    }
    const view = MapView().engine(leafletEngine({ leaflet })).markers([{ lat: 1, lng: 2 }]).build()
    render(view as never, {
      wrapper: ({ children }: { children: ReactNode }) => createElement(StrictMode, null, children),
    })
    expect(maps).toBeGreaterThan(0)
    expect(document.querySelector('.fibo-map')).toBeTruthy()
  })

  it('accepts image files and reports them', () => {
    const createObjectURL = vi.fn(() => 'blob:photo')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    const onChange = vi.fn()
    render(PhotosPicker().label('Library').limit(1).onChange(onChange).build() as never)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.accept).toBe('image/*')
    const file = new File(['png'], 'shot.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(onChange).toHaveBeenCalledWith([file])
    expect(screen.getByRole('img', { name: 'shot.png' })).toBeTruthy()
  })
})
