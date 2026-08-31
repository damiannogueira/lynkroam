export type DecisionState =
  | "Inbox"
  | "Considering"
  | "Shortlisted"
  | "Booked"
  | "Rejected";

export type ResearchCardData = {
  title: string;
  category: string;
  sourceContext: string;
  note: string;
  decisionState: DecisionState;
};

type ResearchCardProps = ResearchCardData;

const stateStyles: Record<DecisionState, string> = {
  Inbox: "border-inbox/35 bg-inbox/10 text-inbox",
  Considering: "border-considering/35 bg-considering/10 text-considering",
  Shortlisted: "border-shortlisted/35 bg-shortlisted/10 text-shortlisted",
  Booked: "border-booked/35 bg-booked/10 text-booked",
  Rejected: "border-rejected/35 bg-rejected/10 text-rejected",
};

export function ResearchCard({
  title,
  category,
  sourceContext,
  note,
  decisionState,
}: ResearchCardProps) {
  return (
    <article className="rounded-card border border-border bg-surface-elevated p-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-small font-semibold uppercase tracking-[0.12em] text-accent-strong">
          {category}
        </p>
        <span
          className={`rounded-pill border px-3 py-1 text-small font-semibold ${stateStyles[decisionState]}`}
        >
          {decisionState}
        </span>
      </div>

      <h4 className="mt-4 text-body font-semibold text-ink">{title}</h4>

      <dl className="mt-4 space-y-3 text-small">
        <div>
          <dt className="font-semibold text-ink">Source context</dt>
          <dd className="mt-1 break-words text-muted">{sourceContext}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Research note</dt>
          <dd className="mt-1 text-muted">{note}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Decision state</dt>
          <dd className="mt-1 text-muted">{decisionState}</dd>
        </div>
      </dl>
    </article>
  );
}
