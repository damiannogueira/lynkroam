import {
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'

export type ModalDialogProps = {
  isOpen: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  returnFocusRef: RefObject<HTMLElement | null>
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      element.tabIndex >= 0 &&
      element.getClientRects().length > 0 &&
      !element.closest('[aria-hidden="true"]') &&
      !element.closest('[hidden]'),
  )
}

export function ModalDialog({
  isOpen,
  title,
  description,
  children,
  onClose,
  returnFocusRef,
}: ModalDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const backdropRef = useRef<HTMLDivElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    const returnFocusElement = returnFocusRef.current
    const backdropElement = backdropRef.current
    const backgroundInertStates: Array<{
      element: HTMLElement
      inert: boolean
    }> = backdropElement
      ? Array.from(document.body.children)
          .filter(
            (element): element is HTMLElement =>
              element instanceof HTMLElement && element !== backdropElement,
          )
          .map((element) => ({ element, inert: element.inert }))
      : []

    backgroundInertStates.forEach(({ element }) => {
      element.inert = true
    })
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleDocumentKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const dialog = dialogRef.current

      if (!dialog) {
        return
      }

      const focusableElements = getFocusableElements(dialog)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (focusableElements.length === 1) {
        event.preventDefault()
        firstElement.focus()
        return
      }

      const activeElement = document.activeElement
      const focusIsOutsideDialog = !dialog.contains(activeElement)

      if (event.shiftKey && (activeElement === firstElement || focusIsOutsideDialog)) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || focusIsOutsideDialog)
      ) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown)
      document.body.style.overflow = previousBodyOverflow
      backgroundInertStates.forEach(({ element, inert }) => {
        element.inert = inert
      })

      if (returnFocusElement?.isConnected) {
        returnFocusElement.focus()
      }
    }
  }, [isOpen, onClose, returnFocusRef])

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="modal-dialog__header">
          <div>
            <p className="section-label">Focus management review</p>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-dialog__close"
            aria-label="Close modal dialog"
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
            <span>Close</span>
          </button>
        </div>

        {description ? (
          <p className="modal-dialog__description" id={descriptionId}>
            {description}
          </p>
        ) : null}

        <div className="modal-dialog__content">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
