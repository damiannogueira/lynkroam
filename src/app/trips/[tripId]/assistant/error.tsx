"use client";

type AssistantErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AssistantError({ reset }: AssistantErrorProps) {
  return (
    <section
      className="max-w-reading rounded-panel border border-warning/40 bg-warning/10 p-6 shadow-card sm:p-8"
      aria-labelledby="assistant-error-heading"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-2 h-2.5 w-2.5 shrink-0 rounded-pill bg-warning"
          aria-hidden="true"
        />
        <div>
          <h2
            id="assistant-error-heading"
            className="text-heading font-semibold tracking-[-0.025em] text-ink"
          >
            Research Assistant unavailable
          </h2>
          <p className="mt-3 text-body text-muted">
            Lynkroam could not display the assistant right now. Try loading this
            part of the trip workspace again.
          </p>
          <button
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-control bg-brand px-5 py-3 text-label font-semibold text-brand-contrast transition-colors hover:bg-brand-strong"
            type="button"
            onClick={reset}
          >
            Try assistant again
          </button>
        </div>
      </div>
    </section>
  );
}
