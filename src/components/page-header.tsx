type PageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
}: PageHeaderProps) {
  return (
    <header className="max-w-reading space-y-4">
      {eyebrow ? (
        <p className="text-label font-semibold uppercase tracking-[0.16em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-4">
        <h1 className="text-display font-semibold tracking-[-0.035em] text-ink">
          {title}
        </h1>
        <p className="text-body text-muted">{description}</p>
      </div>
    </header>
  );
}
