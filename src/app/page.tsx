import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function Home() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-page items-center px-page-gutter py-section">
      <div className="w-full rounded-panel border border-border bg-surface-elevated p-6 shadow-card sm:p-10 lg:p-14">
        <PageHeader
          eyebrow="Travel research, organized"
          title="Lynkroam"
          description="Lynkroam is a visual travel research workspace that helps travelers turn scattered travel links into organized trip decisions."
        />
        <div className="mt-8 max-w-reading space-y-6">
          <p className="text-body text-muted">
            The routed trip workspace is being established. Trip planning,
            source organization, and itinerary views will arrive in the next
            implementation phases.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-control bg-brand px-5 py-3 text-label font-semibold text-brand-contrast shadow-card transition-colors hover:bg-brand-strong"
              href="/trips/new"
            >
              Start a new trip
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-3 text-label font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
              href="/health"
            >
              View application health
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
