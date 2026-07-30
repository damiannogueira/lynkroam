import Link from "next/link";

type TripNavProps = {
  tripId: string;
};

export function TripNav({ tripId }: TripNavProps) {
  const encodedTripId = encodeURIComponent(tripId);
  const basePath = `/trips/${encodedTripId}`;
  const navigationItems = [
    { href: basePath, label: "Workspace" },
    { href: `${basePath}/links`, label: "Links" },
    { href: `${basePath}/itinerary`, label: "Itinerary" },
  ];

  return (
    <nav
      className="rounded-card border border-border bg-surface p-2 shadow-card"
      aria-label="Trip workspace navigation"
    >
      <ul className="flex flex-wrap gap-2">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              className="inline-flex min-h-11 items-center rounded-control px-4 py-2 text-label font-semibold text-ink transition-colors hover:bg-brand-soft hover:text-brand"
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
