import { PageHeader } from "@/components/page-header";
import { TripExplorer } from "@/components/trip-explorer";

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-page space-y-section px-page-gutter py-section">
      <PageHeader
        eyebrow="Visual destination research"
        title="3D Trip Explorer"
        description="Choose a destination to compare the research themes that will shape this interactive travel scene. The experience keeps its essential context available outside the visual layer."
      />

      <TripExplorer />
    </div>
  );
}
