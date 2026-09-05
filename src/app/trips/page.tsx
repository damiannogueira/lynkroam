import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TripCard } from "@/components/trip-card";

export default function TripsPage() {
  return (
    <div className="mx-auto w-full max-w-page space-y-section px-page-gutter py-section">
      <section className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          eyebrow="Your travel workspace"
          title="Trips"
          description="Turn scattered travel research into organized trip decisions, with every useful source and planning choice kept in context."
        />
        <Link
          className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand px-5 py-3 text-label font-semibold text-brand-contrast shadow-card transition-colors hover:bg-brand-strong sm:w-fit"
          href="/trips/new"
        >
          New Trip
        </Link>
      </section>

      <section className="space-y-5" aria-labelledby="sample-trips-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label font-semibold uppercase tracking-[0.14em] text-brand">
              Preview content
            </p>
            <h2
              id="sample-trips-heading"
              className="mt-2 text-heading font-semibold tracking-[-0.025em] text-ink"
            >
              Sample trip
            </h2>
          </div>
          <p className="max-w-reading text-small text-muted">
            This fictional trip demonstrates the structure only. Nothing shown
            here is saved or connected to real travel data.
          </p>
        </div>

        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <li>
            <TripCard
              name="Barcelona research trip"
              destination="Barcelona, Spain"
              planningContext="A flexible city break focused on architecture, local food, and walkable neighborhoods."
              sourceCount={12}
              progress="4 options shortlisted; booking decisions are still pending."
              href="/trips/barcelona"
              isSample
            />
          </li>
        </ul>
      </section>

      <section
        className="rounded-panel border border-dashed border-border-strong bg-surface px-6 py-8 sm:px-8"
        aria-labelledby="future-trips-heading"
      >
        <div className="max-w-reading space-y-3">
          <p className="text-label font-semibold text-accent-strong">
            Getting started
          </p>
          <h2
            id="future-trips-heading"
            className="text-heading font-semibold tracking-[-0.025em] text-ink"
          >
            Your trips will gather here
          </h2>
          <p className="text-body text-muted">
            When trip creation is connected to persistence, this dashboard will
            collect each planning workspace and show its research progress. For
            FE-04, the sample above previews that future structure.
          </p>
        </div>
      </section>
    </div>
  );
}
