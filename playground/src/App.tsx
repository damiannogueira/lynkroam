import './App.css'
import { Disclosure } from './components/hand-built/Disclosure'

function App() {
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
      </main>
    </div>
  )
}

export default App
