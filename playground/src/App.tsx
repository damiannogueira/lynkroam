import { useCallback, useRef, useState } from 'react'
import './App.css'
import { Disclosure } from './components/hand-built/Disclosure'
import { ModalDialog } from './components/hand-built/ModalDialog'
import { Tabs, type TabItem } from './components/hand-built/Tabs'
import { ShadcnDialogDemo } from './components/shadcn-demo/ShadcnDialogDemo'
import { ShadcnTabsDemo } from './components/shadcn-demo/ShadcnTabsDemo'

const accessibilityReviewTabs: TabItem[] = [
  {
    id: 'semantics',
    label: 'Semantics',
    content: (
      <div>
        <h3>Roles create the tab relationship</h3>
        <p>
          The tab list, tabs, and active panel expose their purpose and current
          selection to assistive technology through explicit roles and ARIA
          relationships.
        </p>
        <a href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/">
          Review the WAI-ARIA Tabs Pattern
        </a>
      </div>
    ),
  },
  {
    id: 'focus',
    label: 'Focus movement',
    content: (
      <div>
        <h3>One tab stop enters the tab list</h3>
        <p>
          Only the selected tab participates in the page tab order. Arrow keys
          move focus within the tab list, while Tab continues into the active
          panel content.
        </p>
        <button type="button" className="sample-action">
          Test focus inside the panel
        </button>
      </div>
    ),
  },
  {
    id: 'activation',
    label: 'Activation',
    content: (
      <div>
        <h3>Selection follows keyboard focus</h3>
        <p>
          These local panels activate immediately when focus moves with an
          arrow key, Home, or End because displaying their content has no
          noticeable delay.
        </p>
      </div>
    ),
  },
]

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalTriggerRef = useRef<HTMLButtonElement | null>(null)

  const openModal = useCallback((): void => {
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback((): void => {
    setIsModalOpen(false)
  }, [])

  return (
    <div className="page-shell">
      <header className="page-header">
        <p className="eyebrow">FlyRank FE-05</p>
        <h1>FE-05 Accessible Component Playground</h1>
        <p className="page-introduction">
          This standalone accessibility drill is separate from the Lynkroam
          capstone. It is a focused space for building and reviewing accessible
          interface fundamentals from scratch.
        </p>
      </header>

      <main>
        <section className="review-section" aria-labelledby="disclosure-title">
          <div className="section-heading">
            <p className="section-label">Hand-built component 01</p>
            <h2 id="disclosure-title">Disclosure</h2>
            <p>
              Each trigger reveals or hides related content while announcing
              its current state to assistive technology.
            </p>
          </div>

          <aside className="keyboard-note" aria-labelledby="keyboard-title">
            <h3 id="keyboard-title">Keyboard review</h3>
            <p>
              Press <kbd>Tab</kbd> to reach a disclosure trigger, then use
              <kbd>Enter</kbd> or <kbd>Space</kbd> to toggle it. Continue tabbing
              to confirm that content inside a collapsed disclosure is not
              reachable.
            </p>
          </aside>

          <div className="disclosure-list">
            <Disclosure title="What makes this disclosure accessible?">
              <p>
                The trigger is a native button whose expanded state and
                controlled content are connected with ARIA. When collapsed,
                the content remains in the DOM but is hidden from display and
                keyboard navigation.
              </p>
              <a href="https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/">
                Review the WAI-ARIA Disclosure Pattern
              </a>
            </Disclosure>

            <Disclosure title="What should I test?" defaultOpen>
              <p>
                Confirm that the visible indicator changes direction, the
                button reports the correct state, and both Enter and Space
                operate the trigger without custom keyboard event handling.
              </p>
              <button type="button" className="sample-action">
                Example focusable action
              </button>
            </Disclosure>
          </div>
        </section>

        <section className="review-section" aria-labelledby="tabs-title">
          <div className="section-heading">
            <p className="section-label">Hand-built component 02</p>
            <h2 id="tabs-title">Tabs</h2>
            <p>
              The tab list announces a single set of related views, identifies
              the selected tab, and connects each trigger to its controlled
              panel.
            </p>
          </div>

          <aside
            className="keyboard-note"
            aria-labelledby="tabs-keyboard-title"
          >
            <h3 id="tabs-keyboard-title">Keyboard review</h3>
            <p>
              Press <kbd>Tab</kbd> to enter the tab list. Use
              <kbd>ArrowLeft</kbd> and <kbd>ArrowRight</kbd> to move and wrap,
              or <kbd>Home</kbd> and <kbd>End</kbd> to jump to either edge. Press
              <kbd>Tab</kbd> again to move into focusable panel content.
            </p>
          </aside>

          <Tabs
            label="Accessibility review topics"
            items={accessibilityReviewTabs}
            defaultActiveId="semantics"
          />
        </section>

        <section className="review-section" aria-labelledby="modal-title">
          <div className="section-heading">
            <p className="section-label">Hand-built component 03</p>
            <h2 id="modal-title">Modal dialog</h2>
            <p>
              The dialog moves focus into a blocking task, contains keyboard
              focus while open, and restores focus to its opener when closed.
            </p>
          </div>

          <aside
            className="keyboard-note"
            aria-labelledby="modal-keyboard-title"
          >
            <h3 id="modal-keyboard-title">Keyboard review</h3>
            <p>
              Open the dialog, then use <kbd>Tab</kbd> and
              <kbd>Shift + Tab</kbd> to verify focus wraps in both directions.
              Press <kbd>Escape</kbd> to close it and confirm focus returns to
              the opener.
            </p>
          </aside>

          <div className="modal-demo">
            <a className="modal-demo__context-link" href="#modal-review-trigger">
              Focusable element before the modal trigger
            </a>
            <button
              ref={modalTriggerRef}
              type="button"
              className="sample-action"
              id="modal-review-trigger"
              onClick={openModal}
            >
              Open modal dialog
            </button>
            <button type="button" className="modal-demo__after-action">
              Focusable element after the modal trigger
            </button>
            <p>
              After every close method, keyboard focus should return to the
              “Open modal dialog” button.
            </p>
          </div>

          <ModalDialog
            isOpen={isModalOpen}
            title="Review modal focus behavior"
            description="Use this dialog to verify initial focus, containment, closing behavior, and focus restoration."
            onClose={closeModal}
            returnFocusRef={modalTriggerRef}
          >
            <p>
              Focus begins on the Close button. Continue through every control
              to confirm that focus remains inside this dialog.
            </p>
            <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/">
              Review the WAI-ARIA Modal Dialog Pattern
            </a>
            <label className="modal-dialog__check">
              <input type="checkbox" />
              I verified the dialog’s forward and backward focus order
            </label>
            <div className="modal-dialog__actions">
              <button type="button" className="modal-demo__after-action">
                Secondary review action
              </button>
              <button type="button" className="sample-action" onClick={closeModal}>
                Finish review
              </button>
            </div>
          </ModalDialog>
        </section>

        <section
          className="comparison-area"
          aria-labelledby="shadcn-comparison-title"
        >
          <div className="comparison-intro">
            <p className="section-label">Library comparison</p>
            <h2 id="shadcn-comparison-title">shadcn/ui comparison</h2>
            <p>
              These examples compose generated shadcn wrappers backed by Radix,
              so their accessibility behavior is delegated to the library
              primitives. The hand-built examples above remain the original
              exercise implementations.
            </p>
          </div>

          <div className="comparison-grid">
            <ShadcnDialogDemo />
            <ShadcnTabsDemo />
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
