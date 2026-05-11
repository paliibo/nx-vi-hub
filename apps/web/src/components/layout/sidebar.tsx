"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SessionUserSchema } from "@/shared/types/db";

import { tw } from "@/tailwind";

import { LIBRARY_LINKS, type NavLink, PRIMARY_LINKS, STUDIO_LINKS } from "./nav-links";

type SidebarProps = {
  categories: { accentColor: string; name: string; slug: string }[];
  session: null | SessionUserSchema;
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

const NavItem = ({ link, pathname }: { link: NavLink; pathname: string }) => {
  const Icon = link.icon;
  const active = isActive(pathname, link.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={tw(
        "focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
      href={link.href}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {link.label}
    </Link>
  );
};

const Section = ({ children, title }: { children: React.ReactNode; title?: string }) => (
  <div className="flex flex-col gap-0.5">
    {title && <p className="px-3 pb-1 pt-4 text-muted-foreground text-label">{title}</p>}
    {children}
  </div>
);

export const Sidebar = ({ categories, session }: SidebarProps) => {
  const pathname = usePathname();

  const visible = (links: NavLink[]) =>
    links.filter(link => !link.requiresAuth || Boolean(session));

  const libraryLinks = visible(LIBRARY_LINKS);
  const studioLinks = visible(STUDIO_LINKS);

  return (
    <nav
      aria-label="Main"
      className="scrollbar-none sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border px-3 pb-8 lg:block"
    >
      <Section>
        {visible(PRIMARY_LINKS).map(link => (
          <NavItem key={link.href} link={link} pathname={pathname} />
        ))}
      </Section>

      {libraryLinks.length > 0 && (
        <Section title="Library">
          {libraryLinks.map(link => (
            <NavItem key={link.href} link={link} pathname={pathname} />
          ))}
        </Section>
      )}

      <Section title="Browse">
        {categories.map(category => {
          const href = `/category/${category.slug}`;
          const active = isActive(pathname, href);

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={tw(
                "focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              href={href}
              key={category.slug}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: category.accentColor }}
              />
              {category.name}
            </Link>
          );
        })}
      </Section>

      {studioLinks.length > 0 && (
        <Section title="Yours">
          {studioLinks.map(link => (
            <NavItem key={link.href} link={link} pathname={pathname} />
          ))}
        </Section>
      )}

      <p className="px-3 pt-6 text-muted-foreground text-body-s">
        Vi Hub · a self-hostable video hub
      </p>
    </nav>
  );
};
