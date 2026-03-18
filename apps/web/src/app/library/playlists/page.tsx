import type { ListPlaylistsResponseSchema } from "@/shared/validation";
import type { Metadata } from "next";

import { PlaylistManager } from "../../../components/library/playlist-manager";
import { PageHeader } from "../../../components/ui";
import { okOrNull, serverApi } from "../../../lib/api-server";

export const metadata: Metadata = { title: "Playlists" };

export default async function PlaylistsPage() {
  const playlists = okOrNull<ListPlaylistsResponseSchema>(await serverApi.library.listPlaylists());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        description="Watch later and Liked videos are created for you; the rest are yours."
        title="Playlists"
      />
      <PlaylistManager playlists={playlists?.items ?? []} />
    </div>
  );
}
