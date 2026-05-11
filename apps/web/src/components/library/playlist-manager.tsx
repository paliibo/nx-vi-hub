"use client";

import { PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { PlaylistSummarySchema } from "@/shared/types";

import { Button } from "@/shared-ui/components/button";

import { api } from "../../lib/api-client";
import { formatRelativeTime } from "../../lib/format";

export const PlaylistManager = ({ playlists }: { playlists: PlaylistSummarySchema[] }) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    setBusy(true);
    setError(null);

    const result = await api.library.createPlaylist({
      body: { title: title.trim(), visibility: "PRIVATE" },
    });

    if (result.status === 201) {
      setTitle("");
      setCreating(false);
      router.refresh();
    } else {
      const body = result.body as null | { message?: string };
      setError(body?.message ?? "Could not create the playlist.");
    }

    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {creating ? (
        <form className="flex flex-wrap items-start gap-2" onSubmit={create}>
          <input
            autoFocus
            className="focus-ring h-9 min-w-[14rem] flex-1 rounded-lg border border-border bg-transparent px-3 text-sm"
            maxLength={80}
            onChange={event => setTitle(event.target.value)}
            placeholder="Playlist name"
            value={title}
          />
          <Button disabled={busy} size="sm" type="submit">
            {busy ? "Creating…" : "Create"}
          </Button>
          <Button onClick={() => setCreating(false)} size="sm" type="button" variant="ghost">
            Cancel
          </Button>
          {error && (
            <p className="w-full text-danger text-body-s" role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <Button className="w-fit" onClick={() => setCreating(true)} size="sm" variant="outline">
          <PlusIcon className="mr-1.5 h-4 w-4" />
          New playlist
        </Button>
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map(playlist => (
          <li key={playlist.id}>
            <Link
              className="focus-ring flex h-full flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
              href={`/library/playlists/${playlist.id}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-headline-s">{playlist.title}</span>
                {playlist.system && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-label">
                    Built in
                  </span>
                )}
              </span>
              <span className="text-muted-foreground text-body-s">
                {playlist.itemCount} {playlist.itemCount === 1 ? "video" : "videos"} ·{" "}
                {formatRelativeTime(playlist.updatedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
