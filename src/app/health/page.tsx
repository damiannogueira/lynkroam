import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { fetchHealth, type HealthResponse } from "@/lib/health";

export default async function HealthPage() {
  await connection();

  let health: HealthResponse | null = null;

  try {
    health = await fetchHealth();
  } catch {
    health = null;
  }

  return (
    <div className="mx-auto w-full max-w-page px-page-gutter py-section">
      <PageHeader
        eyebrow="Runtime verification"
        title="Application Health"
        description="Verify that the deployed Lynkroam application and its server-rendered data path are responding together."
      />

      <section
        className="mt-8 max-w-reading rounded-panel border border-border bg-surface-elevated p-6 shadow-card sm:p-8"
        aria-labelledby="health-summary-heading"
      >
        <div className="space-y-2">
          <h2
            id="health-summary-heading"
            className="text-heading font-semibold tracking-[-0.025em] text-ink"
          >
            Runtime status
          </h2>
          <p className="text-small text-muted">
            This endpoint reports only operational metadata and contains no
            sensitive information.
          </p>
        </div>

        {health ? (
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-surface p-4">
              <dt className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
                Application
              </dt>
              <dd className="mt-2 text-body font-semibold text-ink">
                {health.app}
              </dd>
            </div>

            <div className="rounded-card border border-border bg-surface p-4">
              <dt className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
                Status
              </dt>
              <dd className="mt-2 flex items-center gap-2 text-body font-semibold text-positive">
                <span
                  className="h-2.5 w-2.5 rounded-pill bg-positive"
                  aria-hidden="true"
                />
                {health.status}
              </dd>
            </div>

            <div className="rounded-card border border-border bg-surface p-4">
              <dt className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
                Environment
              </dt>
              <dd className="mt-2 break-words text-body font-semibold text-ink">
                {health.environment}
              </dd>
            </div>

            <div className="rounded-card border border-border bg-surface p-4">
              <dt className="text-small font-semibold uppercase tracking-[0.12em] text-muted">
                Timestamp
              </dt>
              <dd className="mt-2 break-words text-body font-semibold text-ink">
                <time dateTime={health.timestamp}>{health.timestamp}</time>
              </dd>
            </div>
          </dl>
        ) : (
          <div
            className="mt-8 rounded-card border border-warning/40 bg-warning/10 p-5"
            role="status"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-pill bg-warning"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-body font-semibold text-ink">
                  Health data unavailable
                </h3>
                <p className="mt-2 text-small text-muted">
                  Lynkroam could not complete its internal health request.
                  Please try again after the server endpoint is available.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <Link
        className="mt-6 inline-flex min-h-11 items-center rounded-control px-3 py-2 text-label font-semibold text-brand transition-colors hover:bg-brand-soft"
        href="/trips"
      >
        Back to Trips
      </Link>
    </div>
  );
}
