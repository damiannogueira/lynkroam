import { useCallback, useRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModalDialog } from './ModalDialog'

function stubVisibleClientRects(): void {
  const emptyRectList = document.documentElement.getClientRects()
  const visibleRectList = new Proxy(emptyRectList, {
    get(target, property) {
      if (property === 'length') {
        return 1
      }

      return Reflect.get(target, property, target)
    },
  })

  vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue(visibleRectList)
}

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  const openModal = useCallback((): void => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback((): void => {
    setIsOpen(false)
  }, [])

  return (
    <section aria-label="Modal test harness">
      <button ref={openerRef} type="button" onClick={openModal}>
        Open test dialog
      </button>
      <ModalDialog
        isOpen={isOpen}
        title="Test focus behavior"
        description="Verify modal interaction behavior."
        onClose={closeModal}
        returnFocusRef={openerRef}
      >
        <a href="https://example.com/pattern">Review pattern</a>
        <button type="button">Final dialog action</button>
      </ModalDialog>
    </section>
  )
}

describe('ModalDialog', () => {
  beforeEach(() => {
    stubVisibleClientRects()
  })

  it('opens in the document body with initial focus and background isolation', async () => {
    const user = userEvent.setup()
    const { container } = render(<ModalHarness />)

    await user.click(screen.getByRole('button', { name: 'Open test dialog' }))

    const dialog = screen.getByRole('dialog', { name: 'Test focus behavior' })
    expect(dialog.parentElement?.parentElement).toBe(document.body)
    expect(screen.getByRole('button', { name: 'Close modal dialog' })).toHaveFocus()
    expect(container.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('wraps forward focus from the final control to the close button', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByRole('button', { name: 'Open test dialog' }))

    screen.getByRole('button', { name: 'Final dialog action' }).focus()
    await user.tab()

    expect(screen.getByRole('button', { name: 'Close modal dialog' })).toHaveFocus()
  })

  it('wraps backward focus from the close button to the final control', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByRole('button', { name: 'Open test dialog' }))

    await user.tab({ shift: true })

    expect(screen.getByRole('button', { name: 'Final dialog action' })).toHaveFocus()
  })

  it('closes with Escape and restores focus, overflow, and inert states', async () => {
    const user = userEvent.setup()
    document.body.style.overflow = 'clip'
    const previousInertSibling = document.createElement('div')
    previousInertSibling.inert = true
    document.body.append(previousInertSibling)
    const { container } = render(<ModalHarness />)
    const opener = screen.getByRole('button', { name: 'Open test dialog' })
    const initialContainerInert = container.inert

    await user.click(opener)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('clip')
    expect(container.inert).toBe(initialContainerInert)
    expect(previousInertSibling.inert).toBe(true)
    previousInertSibling.remove()
  })

  it('closes with the close button and performs cleanup', async () => {
    const user = userEvent.setup()
    const { container } = render(<ModalHarness />)
    const opener = screen.getByRole('button', { name: 'Open test dialog' })
    const initialContainerInert = container.inert

    await user.click(opener)
    await user.click(screen.getByRole('button', { name: 'Close modal dialog' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
    expect(container.inert).toBe(initialContainerInert)
  })

  it('closes when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByRole('button', { name: 'Open test dialog' }))
    const dialog = screen.getByRole('dialog', { name: 'Test focus behavior' })
    const backdrop = dialog.parentElement

    if (!(backdrop instanceof HTMLElement)) {
      throw new Error('Expected the dialog to have an HTMLElement backdrop.')
    }

    await user.click(backdrop)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('stays open when content inside the dialog is clicked', async () => {
    const user = userEvent.setup()
    render(<ModalHarness />)
    await user.click(screen.getByRole('button', { name: 'Open test dialog' }))
    const dialog = screen.getByRole('dialog', { name: 'Test focus behavior' })

    await user.click(dialog)

    expect(dialog).toBeVisible()
  })
})
