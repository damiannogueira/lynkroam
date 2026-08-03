import { type ReactNode, useId, useState } from 'react'

export type DisclosureProps = {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: DisclosureProps) {
  const contentId = useId()
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = (): void => {
    setIsOpen((currentState) => !currentState)
  }

  return (
    <div className="disclosure">
      <button
        type="button"
        className="disclosure__trigger"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={handleToggle}
      >
        <span>{title}</span>
        <span
          className="disclosure__indicator"
          data-expanded={isOpen}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <div
        className="disclosure__content"
        id={contentId}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  )
}
