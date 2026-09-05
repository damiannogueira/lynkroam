import Link from "next/link";
import { PageHeader } from "@/components/page-header";

const inputClasses =
  "mt-2 min-h-11 w-full rounded-control border border-border-strong bg-surface px-4 py-3 text-body text-ink shadow-sm outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/25";

export default function CreateTripPage() {
  return (
    <div className="mx-auto w-full max-w-page px-page-gutter py-section">
      <div className="max-w-form">
        <PageHeader
          eyebrow="Start planning"
          title="Create Trip"
          description="Set up the planning context for a new travel research workspace."
        />

        <section
          className="mt-8 rounded-panel border border-border bg-surface-elevated p-6 shadow-card sm:p-8"
          aria-labelledby="trip-form-heading"
        >
          <div className="space-y-2">
            <h2
              id="trip-form-heading"
              className="text-heading font-semibold tracking-[-0.025em] text-ink"
            >
              Trip details
            </h2>
            <p className="text-body text-muted">
              This FE-04 form is a visual placeholder. It does not save or
              create a trip yet.
            </p>
          </div>

          <form className="mt-8 space-y-6">
            <div>
              <label
                className="text-label font-semibold text-ink"
                htmlFor="trip-name"
              >
                Trip name
              </label>
              <input
                className={inputClasses}
                id="trip-name"
                name="tripName"
                type="text"
                placeholder="Spring in Barcelona"
                aria-describedby="trip-name-help"
              />
              <p id="trip-name-help" className="mt-2 text-small text-muted">
                Use a name that will make this workspace easy to recognize.
              </p>
            </div>

            <div>
              <label
                className="text-label font-semibold text-ink"
                htmlFor="destination"
              >
                Destination
              </label>
              <input
                className={inputClasses}
                id="destination"
                name="destination"
                type="text"
                placeholder="Barcelona, Spain"
                aria-describedby="destination-help"
              />
              <p id="destination-help" className="mt-2 text-small text-muted">
                Enter a city, region, country, or multi-stop travel area.
              </p>
            </div>

            <div>
              <label
                className="text-label font-semibold text-ink"
                htmlFor="planning-context"
              >
                Trip dates or planning context
              </label>
              <textarea
                className={`${inputClasses} min-h-32 resize-y`}
                id="planning-context"
                name="planningContext"
                placeholder="Late April, flexible dates, focused on food and architecture"
                aria-describedby="planning-context-help"
              />
              <p
                id="planning-context-help"
                className="mt-2 text-small text-muted"
              >
                Add approximate dates, flexibility, priorities, or constraints.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <button
                className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-control bg-muted px-5 py-3 text-label font-semibold text-surface opacity-75 sm:w-auto"
                type="submit"
                disabled
                aria-describedby="submit-help"
              >
                Create Trip
              </button>
              <p id="submit-help" className="mt-3 text-small text-muted">
                Trip creation will be enabled when persistence is implemented
                in a future phase.
              </p>
            </div>
          </form>
        </section>

        <Link
          className="mt-6 inline-flex min-h-11 items-center rounded-control px-2 py-2 text-label font-semibold text-brand transition-colors hover:bg-brand-soft"
          href="/trips"
        >
          Back to Trips
        </Link>
      </div>
    </div>
  );
}
