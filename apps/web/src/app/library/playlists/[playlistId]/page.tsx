import type { Metadata } from "next";

import { notFound } from "next/navigation";

import type { PlaylistResponseSchema } from "@/shared/validation";

import { PlaylistItems } from "../../../../components/library/playlist-items";
import { EmptyState, PageHeader } from "../../../../components/ui";
import { okOrNull, serverApi } from "../../../../lib/api-server";

type PlaylistPageProps = { params: Promise<{ playlistId: string }> };

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const { playlistId } = await params;
  const playlist = okOrNull<PlaylistResponseSchema>(
    await serverApi.library.getPlaylist({ params: { playlistId } }),
  );
  return { title: playlist?.title ?? "Playlist" };
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { playlistId } = await params;

  const playlist = okOrNull<PlaylistResponseSchema>(
    await serverApi.library.getPlaylist({ params: { playlistId } }),
  );
  if (!playlist) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description={
          playlist.description ??
          `${playlist.itemCount} ${playlist.itemCount === 1 ? "video" : "videos"}`
        }
        eyebrow={playlist.system ? "Built-in playlist" : "Playlist"}
        title={playlist.title}
      />

      {playlist.items.length === 0 ? (
        <EmptyState
          description="Add videos with the Watch later button, or from a video's menu."
          title="This playlist is empty"
        />
      ) : (
        <PlaylistItems playlist={playlist} />
      )}
    </div>
  );
}
