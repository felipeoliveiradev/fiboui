import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeScanner } from '../src/interactive/CodeScanner'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function hideCamera() {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: undefined,
  })
}

describe('CodeScanner', () => {
  it('shows Camera unavailable when getUserMedia is missing', () => {
    hideCamera()
    render(CodeScanner().onScan(() => {}).label('Scan').build() as never)
    fireEvent.click(screen.getByRole('button', { name: 'Scan' }))
    expect(screen.getByText('Camera unavailable')).toBeTruthy()
  })

  it('uses BarcodeDetector when the camera API is stubbed', async () => {
    const track = { stop: vi.fn() }
    const getUserMedia = vi.fn(async () => ({ getTracks: () => [track] }))
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    })
    const detect = vi.fn(async () => [{ rawValue: 'ABC123' }])
    vi.stubGlobal('BarcodeDetector', class {
      detect = detect
    })
    const onScan = vi.fn()
    render(CodeScanner().label('Scan').onScan(onScan).build() as never)
    fireEvent.click(screen.getByRole('button', { name: 'Scan' }))
    await waitFor(() => expect(onScan).toHaveBeenCalledWith('ABC123'))
    expect(getUserMedia).toHaveBeenCalled()
    expect(detect).toHaveBeenCalled()
  })
})
