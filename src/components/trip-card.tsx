import Link from "next/link";

type TripCardProps = {
  name: string;
  destination: string;
  planningContext: string;
  sourceCount: number;
  progress: string;
  href: string;
  isSample?: boolean;
};

export function TripCard({
  name,
  destination,
  planningContext,
  sourceCount,
  progress,
  href,
  isSample = false,
}: TripCardProps) {
  return (
    <article className="flex h-full flex-col rounded-card border border-border bg-surface-elevated p-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-label font-semibold text-brand">{destination}</p>
        {isSample ? (
          <span className="rounded-pill bg-brand-soft px-3 py-1 text-small font-semibold text-brand">
            Sample trip
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="text-heading font-semibold tracking-[-0.025em] text-ink">
          {name}
        </h3>
        <p className="text-body text-muted">{planningContext}</p>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-border pt-5">
        <div>
          <dt className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
            Research sources
          </dt>
          <dd className="mt-1 text-label font-semibold text-ink">
            {sourceCount} placeholder sources
          </dd>
        </div>
        <div>
          <dt className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
            Decision progress
          </dt>
          <dd className="mt-1 text-label text-ink">{progress}</dd>
        </div>
      </dl>

      <Link
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border-strong bg-surface px-4 py-3 text-label font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
        href={href}
        aria-label={`Open ${name}`}
      >
        Open trip workspace
      </Link>
    </article>
  );
}
