import type { Metadata } from "next";

import { redirect } from "next/navigation";

import type { ListCategoriesResponseSchema } from "@/shared/validation";

import { VideoForm } from "../../../components/studio/video-form";
import { PageHeader } from "../../../components/ui";
import { okOrNull, serverApi } from "../../../lib/api-server";
import { requireSession } from "../../../lib/session";

export const metadata: Metadata = { title: "New video" };

export default async function NewVideoPage() {
  const session = await requireSession("/studio/new");
  if (!session.channel) redirect("/studio");

  const categories = okOrNull<ListCategoriesResponseSchema>(await serverApi.catalog.categories());

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:py-8">
      <PageHeader
        description="Vi Hub references media by URL rather than hosting uploads, so point it at a file that is already online."
        eyebrow="Studio"
        title="Publish a video"
      />
      <VideoForm categories={categories?.items ?? []} />
    </div>
  );
}
