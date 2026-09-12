import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SignatureShaderHero } from "@/components/signature-shader-hero";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-page px-page-gutter py-section">
      <section className="relative isolate flex min-h-[clamp(34rem,72vh,48rem)] items-center overflow-hidden rounded-panel border border-border bg-surface-elevated px-5 py-10 shadow-card sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <SignatureShaderHero />

        <div className="relative z-10 max-w-reading space-y-8 rounded-panel border border-surface/70 bg-surface/90 p-6 shadow-card backdrop-blur-sm sm:p-8 lg:p-10">
          <PageHeader
            eyebrow="Travel research, organized"
            title="Turn scattered travel research into confident trip decisions."
            description="Lynkroam brings useful sources, comparisons, and planning context into one workspace so each trip decision stays connected to the research behind it."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-control bg-brand px-5 py-3 text-label font-semibold text-brand-contrast shadow-card transition-colors hover:bg-brand-strong sm:w-fit"
              href="/trips"
            >
              View trips
            </Link>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border-strong bg-surface px-5 py-3 text-label font-semibold text-ink transition-colors hover:border-brand hover:text-brand sm:w-fit"
              href="/explore"
            >
              Explore
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
