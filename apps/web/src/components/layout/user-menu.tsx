"use client";

import { ExitIcon, GearIcon, PersonIcon, VideoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SessionUserSchema } from "@/shared/types/db";

import { Avatar } from "@/shared-ui/components/avatar";
import { Button } from "@/shared-ui/components/button";

import { api } from "../../lib/api-client";

const MENU_LINKS = [
  { href: "/studio", icon: VideoIcon, label: "Your studio" },
  { href: "/library", icon: PersonIcon, label: "Your library" },
  { href: "/settings", icon: GearIcon, label: "Settings" },
];

export const UserMenu = ({ session }: { session: null | SessionUserSchema }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Create account</Link>
        </Button>
      </div>
    );
  }

  const signOut = async () => {
    setSigningOut(true);
    await api.auth.logout({ body: {} });
    setOpen(false);
    // refresh() re-runs the server components so every surface that read the
    // session — sidebar, menus, library links — reflects the sign-out at once.
    router.refresh();
    router.push("/");
    setSigningOut(false);
  };

  const initials = session.displayName.slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase transition-colors hover:bg-border"
        onClick={() => setOpen(value => !value)}
        type="button"
      >
        {session.avatarUrl ? (
          <Avatar className="h-9 w-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="h-full w-full object-cover" src={session.avatarUrl} />
          </Avatar>
        ) : (
          initials
        )}
      </button>

      {open && (
        <>
          {/* Click-away layer. Sits below the menu so the menu stays clickable. */}
          <button
            aria-hidden="true"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            tabIndex={-1}
            type="button"
          />

          <div
            className="absolute right-0 top-11 z-50 w-60 animate-rise-in overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
            role="menu"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-medium">{session.displayName}</p>
              <p className="truncate text-muted-foreground text-body-s">@{session.username}</p>
            </div>

            <div className="p-1">
              {MENU_LINKS.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    className="focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    href={link.href}
                    key={link.href}
                    onClick={() => setOpen(false)}
                    role="menuitem"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-border p-1">
              <button
                className="focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
                disabled={signingOut}
                onClick={signOut}
                role="menuitem"
                type="button"
              >
                <ExitIcon className="h-4 w-4" />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
