"use client";

import type { PlaylistSummarySchema, ReactionType, VideoDetailSchema } from "@/shared/types";

import {
  BookmarkIcon,
  Link2Icon,
  ThickArrowDownIcon,
  ThickArrowUpIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { tw } from "@/tailwind";

import { api } from "../../lib/api-client";
import { formatCompact } from "../../lib/format";

type VideoActionsProps = {
  signedIn: boolean;
  video: VideoDetailSchema;
};

export const VideoActions = ({ signedIn, video }: VideoActionsProps) => {
  const router = useRouter();

  const [reaction, setReaction] = useState<null | ReactionType>(video.viewerReaction);
  const [likes, setLikes] = useState(video.likeCount);
  const [dislikes, setDislikes] = useState(video.dislikeCount);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const react = async (next: ReactionType) => {
    if (!signedIn) {
      router.push(`/sign-in?next=/watch/${video.slug}`);
      return;
    }

    // Clicking the active reaction clears it, which is what the null body means.
    const value = reaction === next ? null : next;

    // Optimistic: the counts update immediately and are replaced by the
    // server's numbers when the request lands. A failure restores the old ones.
    const previous = { dislikes, likes, reaction };
    setReaction(value);
    setLikes(count => count + (value === "LIKE" ? 1 : 0) - (reaction === "LIKE" ? 1 : 0));
    setDislikes(count => count + (value === "DISLIKE" ? 1 : 0) - (reaction === "DISLIKE" ? 1 : 0));

    const result = await api.videos.react({ body: { type: value }, params: { slug: video.slug } });

    if (result.status === 200) {
      setLikes(result.body.likeCount);
      setDislikes(result.body.dislikeCount);
      setReaction(result.body.viewerReaction);
    } else {
      setReaction(previous.reaction);
      setLikes(previous.likes);
      setDislikes(previous.dislikes);
    }
  };

  const saveToWatchLater = async () => {
    if (!signedIn) {
      router.push(`/sign-in?next=/watch/${video.slug}`);
      return;
    }

    const playlists = await api.library.listPlaylists();
    if (playlists.status !== 200) return;

    const watchLater = (playlists.body.items as PlaylistSummarySchema[]).find(
      playlist => playlist.system === "watch-later",
    );
    if (!watchLater) return;

    const result = await api.library.addPlaylistItem({
      body: { videoId: video.id },
      params: { playlistId: watchLater.id },
    });

    if (result.status === 201) setSaved(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center overflow-hidden rounded-full border border-border">
        <button
          aria-label={reaction === "LIKE" ? "Remove like" : "Like"}
          aria-pressed={reaction === "LIKE"}
          className={tw(
            "focus-ring flex items-center gap-1.5 px-4 py-2 text-sm transition-colors hover:bg-muted",
            reaction === "LIKE" && "bg-primary/15 text-primary",
          )}
          onClick={() => react("LIKE")}
          type="button"
        >
          <ThickArrowUpIcon className="h-4 w-4" />
          {formatCompact(likes)}
        </button>

        <span aria-hidden="true" className="h-5 w-px bg-border" />

        <button
          aria-label={reaction === "DISLIKE" ? "Remove dislike" : "Dislike"}
          aria-pressed={reaction === "DISLIKE"}
          className={tw(
            "focus-ring flex items-center gap-1.5 px-4 py-2 text-sm transition-colors hover:bg-muted",
            reaction === "DISLIKE" && "bg-danger/15 text-danger",
          )}
          onClick={() => react("DISLIKE")}
          type="button"
        >
          <ThickArrowDownIcon className="h-4 w-4" />
          {formatCompact(dislikes)}
        </button>
      </div>

      <button
        className="focus-ring flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        onClick={saveToWatchLater}
        type="button"
      >
        <BookmarkIcon className="h-4 w-4" />
        {saved ? "Saved" : "Watch later"}
      </button>

      <button
        className="focus-ring flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        onClick={copyLink}
        type="button"
      >
        <Link2Icon className="h-4 w-4" />
        {copied ? "Link copied" : "Share"}
      </button>
    </div>
  );
};
