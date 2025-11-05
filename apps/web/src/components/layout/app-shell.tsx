import type { SessionUserSchema } from "@/shared/types/db";

import { type ReactNode, Suspense } from "react";

import { CommandPalette } from "../search/command-palette";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

type AppShellProps = {
  categories: { accentColor: string; name: string; slug: string }[];
  children: ReactNode;
  session: null | SessionUserSchema;
};

export const AppShell = ({ categories, children, session }: AppShellProps) => (
  <div className="min-h-dvh">
    {/* TopBar reads useSearchParams, which opts the whole route into client-side
        rendering unless it is isolated behind its own Suspense boundary. */}
    <Suspense fallback={<div className="h-14 border-b border-border" />}>
      <TopBar session={session} />
    </Suspense>

    <div className="flex">
      <Sidebar categories={categories} session={session} />

      <main className="min-w-0 flex-1 pb-20 lg:pb-10" id="main">
        {children}
      </main>
    </div>

    <MobileNav session={session} />
    <CommandPalette />
  </div>
);
