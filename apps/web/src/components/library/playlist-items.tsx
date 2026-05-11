"use client";

import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useState } from "react";

import type { PlaylistSchema } from "@/shared/types";

import { api } from "../../lib/api-client";
import { formatDuration, formatViews } from "../../lib/format";
import { VideoPoster } from "../video/video-poster";

/** Moves the item at `from` to `to`, returning a new array. */
const reorder = <T,>(items: T[], from: number, to: number): T[] => {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const PlaylistItems = ({ playlist }: { playlist: PlaylistSchema }) => {
  const [items, setItems] = useState(playlist.items);
  const [busy, setBusy] = useState(false);

  const persistOrder = async (next: typeof items) => {
    const previous = items;
    setItems(next);
    setBusy(true);

    // The endpoint takes the whole ordered list, so a dropped request cannot
    // leave the playlist half-reordered.
    const result = await api.library.reorderPlaylist({
      body: { itemIds: next.map(item => item.id) },
      params: { playlistId: playlist.id },
    });

    if (result.status !== 200) setItems(previous);
    setBusy(false);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    void persistOrder(reorder(items, index, target));
  };

  const remove = async (itemId: string) => {
    const previous = items;
    setItems(current => current.filter(item => item.id !== itemId));

    const result = await api.library.removePlaylistItem({
      params: { itemId, playlistId: playlist.id },
    });

    if (result.status !== 200) setItems(previous);
  };

  return (
    <ol className="flex flex-col divide-y divide-border rounded-xl border border-border">
      {items.map((item, index) => (
        <li className="flex items-center gap-4 p-3" key={item.id}>
          <span className="w-6 shrink-0 text-center tabular-nums text-muted-foreground text-body-s">
            {index + 1}
          </span>

          <Link
            className="focus-ring relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted"
            href={`/watch/${item.video.slug}`}
            tabIndex={-1}
          >
            <VideoPoster
              accentColor={item.video.channel.accentColor}
              seed={item.video.slug}
              thumbnailUrl={item.video.thumbnailUrl}
              title={item.video.title}
            />
            <span className="absolute bottom-1 right-1 rounded bg-overlay/80 px-1 text-[10px] text-white">
              {formatDuration(item.video.durationSeconds)}
            </span>
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              className="focus-ring line-clamp-2 rounded text-sm font-medium transition-colors hover:text-primary"
              href={`/watch/${item.video.slug}`}
            >
              {item.video.title}
            </Link>
            <p className="text-muted-foreground text-body-s">
              {item.video.channel.name} · {formatViews(item.video.views)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              aria-label={`Move ${item.video.title} up`}
              className="focus-ring rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              disabled={busy || index === 0}
              onClick={() => move(index, -1)}
              type="button"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
            <button
              aria-label={`Move ${item.video.title} down`}
              className="focus-ring rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              disabled={busy || index === items.length - 1}
              onClick={() => move(index, 1)}
              type="button"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <button
              aria-label={`Remove ${item.video.title}`}
              className="focus-ring rounded p-1.5 text-muted-foreground transition-colors hover:text-danger"
              onClick={() => void remove(item.id)}
              type="button"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ol>
  );
};
