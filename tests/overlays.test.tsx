import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BottomSheet } from '../src/overlay/BottomSheet'
import { Dialog } from '../src/overlay/Dialog'
import { SnackBar } from '../src/overlay/SnackBar'

afterEach(cleanup)

describe('overlays', () => {
  it('closed Dialog renders no alertdialog', () => {
    render(Dialog().title('Delete').message('Sure?').build())
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('open Dialog shows the title and confirm calls onConfirm', () => {
    const onConfirm = vi.fn()
    render(
      Dialog()
        .open(true)
        .title('Delete')
        .message('Sure?')
        .confirmLabel('Delete')
        .cancelLabel('Cancel')
        .onConfirm(onConfirm)
        .build(),
    )
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Delete')
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('SnackBar shows the message', () => {
    render(SnackBar().open(true).message('Saved').build())
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
  })

  it('BottomSheet open has role=dialog and a scrollable body', () => {
    render(
      BottomSheet()
        .open(true)
        .title('Share')
        .detents(['medium', 'large'])
        .detent('medium')
        .build(),
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Share')
    expect(dialog).toHaveStyle({ maxHeight: '50vh' })
    expect(dialog.querySelector('.fibo-bottom-sheet-body')).toBeTruthy()
    expect(dialog.querySelector('.fibo-bottom-sheet-handle')).toBeTruthy()
  })
})
