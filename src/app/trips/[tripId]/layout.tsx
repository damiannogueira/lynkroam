import { PageHeader } from "@/components/page-header";
import { TripNav } from "@/components/trip-nav";

function formatTripTitle(tripId: string) {
  const readableId = tripId
    .replace(/[-_]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!readableId) {
    return "Sample research trip";
  }

  const title = readableId.replace(/\b\p{L}/gu, (letter) =>
    letter.toLocaleUpperCase(),
  );

  return `${title} research trip`;
}

export default async function TripLayout({
  children,
  params,
}: LayoutProps<"/trips/[tripId]">) {
  const { tripId } = await params;

  return (
    <div className="mx-auto w-full max-w-workspace px-page-gutter py-section">
      <PageHeader
        eyebrow="Fictional sample trip"
        title={formatTripTitle(tripId)}
        description="This FE-04 workspace uses fictional, non-persistent Barcelona planning content to demonstrate Lynkroam’s trip structure."
      />
      <div className="mt-8">
        <TripNav tripId={tripId} />
      </div>
      <div className="mt-10">{children}</div>
    </div>
  );
}
