import type { ListSubscriptionsResponseSchema } from "@/shared/validation";
import type { Metadata } from "next";

import { LayersIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { EmptyState, PageHeader } from "../../components/ui";
import { VideoCard } from "../../components/video";
import { okOrNull, serverApi } from "../../lib/api-server";
import { formatCompact } from "../../lib/format";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage() {
  await requireSession("/subscriptions");

  const subscriptions = okOrNull<ListSubscriptionsResponseSchema>(
    await serverApi.library.subscriptions(),
  );

  const channels = subscriptions?.items ?? [];

  return (
    <div className="flex flex-col gap-8 px-4 py-6 lg:py-8">
      <PageHeader
        description="The newest upload from every channel you follow."
        title="Subscriptions"
      />

      {channels.length === 0 ? (
        <EmptyState
          action={
            <Link
              className="focus-ring rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              href="/search"
            >
              Browse channels
            </Link>
          }
          description="Subscribe to a channel and its newest videos show up here."
          icon={<LayersIcon className="h-5 w-5" />}
          title="No subscriptions yet"
        />
      ) : (
        <div className="flex flex-col gap-10">
          {channels.map(channel => (
            <section className="flex flex-col gap-3" key={channel.id}>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ backgroundColor: channel.accentColor }}
                >
                  {channel.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <Link
                    className="focus-ring rounded text-headline-s transition-colors hover:text-primary"
                    href={`/channel/${channel.handle}`}
                  >
                    {channel.name}
                  </Link>
                  <p className="text-body-s text-muted-foreground">
                    {formatCompact(channel.subscriberCount)} subscribers
                  </p>
                </div>
              </div>

              {channel.latestVideo ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  <VideoCard hideChannel video={channel.latestVideo} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing published on this channel yet.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
