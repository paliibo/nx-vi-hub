import Link from "next/link";

import { requireSession } from "../../lib/session";

const TABS = [
  { href: "/library", label: "Overview" },
  { href: "/library/history", label: "History" },
  { href: "/library/liked", label: "Liked" },
  { href: "/library/playlists", label: "Playlists" },
];

/**
 * The whole library is behind a session, so the check lives here rather than
 * being repeated in each page — and a signed-out visitor is redirected before
 * any child starts fetching.
 */
export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  await requireSession("/library");

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:py-8">
      <nav aria-label="Library sections" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4">
        {TABS.map(tab => (
          <Link
            className="focus-ring shrink-0 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
