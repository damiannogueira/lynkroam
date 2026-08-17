import type { ResearchAssistantUIMessage } from "@/lib/ai/types";

type FetchUrlMetadataPart = Extract<
  ResearchAssistantUIMessage["parts"][number],
  { type: "tool-fetchUrlMetadata" }
>;

type FetchUrlMetadataToolProps = {
  part: FetchUrlMetadataPart;
};

function getHostname(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

export function FetchUrlMetadataTool({ part }: FetchUrlMetadataToolProps) {
  if (part.state === "input-streaming") {
    const partialUrl = part.input?.url;

    return (
      <div
        className="rounded-card border border-dashed border-brand/50 bg-brand-soft p-4 text-ink transition-colors duration-200"
        role="status"
      >
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 animate-pulse rounded-pill bg-brand"
            aria-hidden="true"
          />
          <p className="text-label font-semibold text-brand">
            Preparing source inspection
          </p>
        </div>
        <p className="mt-2 text-small text-muted">
          The Research Assistant is identifying the webpage to inspect.
        </p>
        {partialUrl ? (
          <p className="mt-3 break-all rounded-control bg-surface/70 px-3 py-2 text-small text-muted">
            {partialUrl}
          </p>
        ) : null}
      </div>
    );
  }

  if (part.state === "input-available") {
    const hostname = getHostname(part.input.url);

    return (
      <div
        className="rounded-card border border-accent/50 bg-surface-elevated p-4 text-ink shadow-elevated transition-colors duration-200"
        role="status"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-pill border border-accent text-small font-semibold text-accent"
            aria-hidden="true"
          >
            …
          </span>
          <div>
            <p className="text-label font-semibold text-ink">
              Inspecting source
            </p>
            {hostname ? (
              <p className="text-small text-muted">{hostname}</p>
            ) : null}
          </div>
        </div>
        <p className="mt-3 break-all rounded-control border border-border bg-surface px-3 py-2 text-small text-muted">
          {part.input.url}
        </p>
        <p className="mt-2 text-small text-muted">
          Retrieving page-level metadata.
        </p>
      </div>
    );
  }

  if (part.state === "output-available") {
    const { description, hostname, siteName, title, url } = part.output;

    return (
      <div
        className="rounded-card border border-positive/40 bg-surface p-4 text-ink shadow-card transition-colors duration-200 sm:p-5"
        role="status"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-positive text-small font-semibold text-brand-contrast"
            aria-hidden="true"
          >
            ✓
          </span>
          <div className="min-w-0">
            <p className="text-small font-semibold uppercase tracking-[0.12em] text-positive">
              Source metadata ready
            </p>
            <h4 className="mt-1 break-words text-body font-semibold text-ink">
              {title ?? "Title unavailable"}
            </h4>
            <p className="mt-1 break-words text-small text-muted">
              {siteName ? `${siteName} · ${hostname}` : hostname}
            </p>
          </div>
        </div>

        {description ? (
          <p className="mt-4 break-words text-body text-muted">
            {description}
          </p>
        ) : null}

        <a
          className="mt-4 inline-flex min-h-11 max-w-full items-center rounded-control border border-border-strong px-3 py-2 text-label font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
          href={url}
          target="_blank"
          rel="noreferrer noopener"
        >
          <span className="truncate">Open source</span>
          <span className="ml-2 shrink-0" aria-hidden="true">
            ↗
          </span>
        </a>
        <p className="mt-2 break-all text-small text-muted">{url}</p>
      </div>
    );
  }

  if (part.state === "output-error") {
    return (
      <div
        className="rounded-card border border-warning/40 bg-warning/10 p-4 text-ink transition-colors duration-200"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill border border-warning text-small font-semibold text-warning"
            aria-hidden="true"
          >
            !
          </span>
          <div>
            <p className="text-label font-semibold text-ink">
              Source inspection failed
            </p>
            <p className="mt-1 text-small text-muted">
              Check the URL or try another public webpage. The rest of your
              conversation is still available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
