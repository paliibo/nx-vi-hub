"use client";

import type { SessionUserSchema } from "@/shared/types/db";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Logo } from "../brand";
import { ThemeToggle } from "../theme";
import { UserMenu } from "./user-menu";

export const TopBar = ({ session }: { session: null | SessionUserSchema }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("q") ?? "");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = term.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md">
      <Logo />

      <form className="ml-auto flex max-w-md flex-1 items-center" onSubmit={submit} role="search">
        <label className="relative flex w-full items-center">
          <span className="sr-only">Search videos</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            className="focus-ring h-9 w-full rounded-full border border-border bg-surface pl-9 pr-16 text-sm placeholder:text-muted-foreground"
            onChange={event => setTerm(event.target.value)}
            placeholder="Search"
            type="search"
            value={term}
          />
          {/* Advertises the palette shortcut without a second control. */}
          <kbd className="pointer-events-none absolute right-3 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </label>
      </form>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <UserMenu session={session} />
      </div>
    </header>
  );
};
