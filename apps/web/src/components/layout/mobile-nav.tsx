"use client";

import type { SessionUserSchema } from "@/shared/types/db";

import { tw } from "@/tailwind";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LIBRARY_LINKS, PRIMARY_LINKS } from "./nav-links";

/**
 * Bottom bar for small screens, where the sidebar is hidden. Shows at most four
 * destinations — beyond that the targets get too narrow to hit reliably.
 */
export const MobileNav = ({ session }: { session: null | SessionUserSchema }) => {
  const pathname = usePathname();

  const links = [...PRIMARY_LINKS, LIBRARY_LINKS[0]]
    .filter(link => !link.requiresAuth || Boolean(session))
    .slice(0, 4);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur lg:hidden"
    >
      {links.map(link => {
        const Icon = link.icon;
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={tw(
              "focus-ring flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
            href={link.href}
            key={link.href}
          >
            <Icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
