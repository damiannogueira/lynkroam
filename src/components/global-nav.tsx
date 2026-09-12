import Link from "next/link";

const navigationItems = [
  { href: "/trips", label: "Trips" },
  { href: "/explore", label: "Explore" },
  { href: "/trips/new", label: "New Trip" },
  { href: "/health", label: "Health" },
];

export function GlobalNav() {
  return (
    <nav aria-label="Primary navigation">
      <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
        {navigationItems.map((item) => (
          <li key={item.href}>
            <Link
              className="inline-flex min-h-11 items-center rounded-control px-3 py-2 text-label font-semibold text-muted transition-colors hover:bg-brand-soft hover:text-brand"
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
