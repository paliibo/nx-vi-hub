"use client";

import {
  HomeIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  VideoIcon,
} from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { SearchSuggestionsResponseSchema } from "@/shared/validation";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared-ui/components/command";
import { Dialog, DialogContent } from "@/shared-ui/components/dialog";

import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { api } from "../../lib/api-client";
import { formatDuration } from "../../lib/format";

const EMPTY: SearchSuggestionsResponseSchema = { channels: [], videos: [] };

/**
 * ⌘K palette. Searches the catalog as you type and doubles as a shortcut
 * surface for the handful of actions that would otherwise need their own
 * buttons in the header.
 */
export const CommandPalette = () => {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestionsResponseSchema>(EMPTY);
  /** The term the results in state belong to. Drives the loading indicator. */
  const [loadedTerm, setLoadedTerm] = useState("");

  const debouncedQuery = useDebouncedValue(query, 180);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(value => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const term = query.trim();
  const debouncedTerm = debouncedQuery.trim();

  useEffect(() => {
    // Nothing to search for. Returning early rather than clearing state keeps
    // the effect free of a synchronous setState, which would cost a second
    // render pass on every keystroke that empties the field.
    if (!debouncedTerm) return;

    // Guards against an earlier, slower request landing after a later one and
    // overwriting fresher results.
    let cancelled = false;

    api.catalog
      .suggest({ query: { limit: 6, q: debouncedTerm } })
      .then(result => {
        if (cancelled) return;
        setResults(result.status === 200 ? result.body : EMPTY);
      })
      .catch(() => {
        if (!cancelled) setResults(EMPTY);
      })
      .finally(() => {
        if (!cancelled) setLoadedTerm(debouncedTerm);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedTerm]);

  // Both derived rather than stored. Keeping them out of state means the effect
  // contains no synchronous setState, so a keystroke costs one render instead of
  // three — and "loading" cannot fall out of step with the results it describes.
  const visible = debouncedTerm ? results : EMPTY;
  const loading = Boolean(debouncedTerm) && loadedTerm !== debouncedTerm;

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        {/* cmdk does its own filtering by default, but our results are already
            filtered by the API — leaving it on would hide matches whose text
            differs from the query. */}
        <Command shouldFilter={false}>
          <CommandInput
            onValueChange={setQuery}
            placeholder="Search videos and channels…"
            value={query}
          />

          <CommandList className="max-h-[22rem]">
            {term && !loading && visible.videos.length === 0 && visible.channels.length === 0 && (
              <CommandEmpty>No matches for “{term}”.</CommandEmpty>
            )}

            {visible.videos.length > 0 && (
              <CommandGroup heading="Videos">
                {visible.videos.map(video => (
                  <CommandItem
                    key={video.id}
                    onSelect={() => go(`/watch/${video.slug}`)}
                    value={video.id}
                  >
                    <VideoIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{video.title}</span>
                    <span className="ml-2 shrink-0 text-muted-foreground text-body-s">
                      {formatDuration(video.durationSeconds)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {visible.channels.length > 0 && (
              <CommandGroup heading="Channels">
                {visible.channels.map(channel => (
                  <CommandItem
                    key={channel.id}
                    onSelect={() => go(`/channel/${channel.handle}`)}
                    value={channel.id}
                  >
                    <span
                      aria-hidden="true"
                      className="mr-2 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: channel.accentColor }}
                    />
                    <span className="flex-1 truncate">{channel.name}</span>
                    <span className="ml-2 shrink-0 text-muted-foreground text-body-s">
                      @{channel.handle}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup heading="Go to">
              {term && (
                <CommandItem
                  onSelect={() => go(`/search?q=${encodeURIComponent(term)}`)}
                  value="__search"
                >
                  <MagnifyingGlassIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  Search all videos for “{term}”
                </CommandItem>
              )}
              <CommandItem onSelect={() => go("/")} value="__home">
                <HomeIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Home
              </CommandItem>
              <CommandItem onSelect={() => go("/library")} value="__library">
                <LayersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                Your library
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Appearance">
              <CommandItem
                onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
                value="__theme"
              >
                {theme === "dark" ? (
                  <SunIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                ) : (
                  <MoonIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                )}
                Switch to {theme === "dark" ? "light" : "dark"} theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
