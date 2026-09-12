"use client";

import { StatefulActionButton } from "@/components/stateful-action-button";

const DEMO_ACTION_DELAY_MS = 900;

function wait(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
}

async function runSuccessfulAction() {
  await wait(DEMO_ACTION_DELAY_MS);
}

async function runFailedAction() {
  await wait(DEMO_ACTION_DELAY_MS);
  throw new Error("Controlled motion demo failure.");
}

export function MotionActionDemo() {
  return (
    <section className="space-y-5" aria-labelledby="motion-outcomes-heading">
      <div className="max-w-reading space-y-2">
        <h2
          id="motion-outcomes-heading"
          className="text-heading font-semibold tracking-[-0.025em] text-ink"
        >
          Test both outcomes
        </h2>
        <p className="text-body text-muted">
          Each action follows the same loading lifecycle before reaching its
          clearly labeled, deterministic result.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <article className="rounded-card border border-border bg-surface-elevated p-5 shadow-card sm:p-6">
          <h3 className="text-body font-semibold text-ink">Success path</h3>
          <p className="mt-2 text-small text-muted">
            Always completes successfully after showing the loading state.
          </p>
          <StatefulActionButton
            className="mt-6 w-full sm:w-fit"
            onAction={runSuccessfulAction}
            idleLabel="Send message"
            loadingLabel="Sending..."
            successLabel="Sent"
            errorLabel="Try again"
          />
        </article>

        <article className="rounded-card border border-border bg-surface-elevated p-5 shadow-card sm:p-6">
          <h3 className="text-body font-semibold text-ink">Error path</h3>
          <p className="mt-2 text-small text-muted">
            Always returns the controlled error state after loading.
          </p>
          <StatefulActionButton
            className="mt-6 w-full sm:w-fit"
            onAction={runFailedAction}
            idleLabel="Send message"
            loadingLabel="Sending..."
            successLabel="Sent"
            errorLabel="Try again"
          />
        </article>
      </div>
    </section>
  );
}
