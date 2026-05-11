import type { Metadata } from "next";

import Link from "next/link";

import { PasswordForm } from "../../components/settings/password-form";
import { ProfileForm } from "../../components/settings/profile-form";
import { PageHeader } from "../../components/ui";
import { PLAYER_SHORTCUTS } from "../../components/watch/player-shortcuts";
import { formatDate } from "../../lib/format";
import { requireSession } from "../../lib/session";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireSession("/settings");

  return (
    <div className="flex flex-col gap-10 px-4 py-6 lg:py-8">
      <PageHeader
        description={`Signed in as @${session.username} · joined ${formatDate(session.createdAt)}`}
        title="Settings"
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-m">Profile</h2>
        <ProfileForm session={session} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-m">Password</h2>
        <PasswordForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-m">Channel</h2>
        {session.channel ? (
          <p className="text-sm text-muted-foreground">
            You publish as{" "}
            <Link
              className="focus-ring rounded font-medium text-primary hover:underline"
              href={`/channel/${session.channel.handle}`}
            >
              {session.channel.name}
            </Link>
            .
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            You do not have a channel yet.{" "}
            <Link
              className="focus-ring rounded font-medium text-primary hover:underline"
              href="/studio"
            >
              Create one
            </Link>{" "}
            to start publishing.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-headline-m">Player shortcuts</h2>
        <dl className="grid max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
          {PLAYER_SHORTCUTS.map(shortcut => (
            <div className="flex items-center justify-between gap-3" key={shortcut.action}>
              <dt className="text-sm text-muted-foreground">{shortcut.action}</dt>
              <dd className="flex gap-1">
                {shortcut.keys.map(key => (
                  <kbd
                    className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium"
                    key={key}
                  >
                    {key}
                  </kbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
