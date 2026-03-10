"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { tw } from "@/tailwind";

import { api } from "../../lib/api-client";
import { formatCompact } from "../../lib/format";

type SubscribeButtonProps = {
  handle: string;
  /** Null when nobody is signed in, which is not the same as "not subscribed". */
  isSubscribed: boolean | null;
  returnTo: string;
  subscriberCount: number;
};

export const SubscribeButton = ({
  handle,
  isSubscribed,
  returnTo,
  subscriberCount,
}: SubscribeButtonProps) => {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(Boolean(isSubscribed));
  const [count, setCount] = useState(subscriberCount);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (isSubscribed === null) {
      router.push(`/sign-in?next=${encodeURIComponent(returnTo)}`);
      return;
    }

    setPending(true);
    const next = !subscribed;

    // Optimistic, then reconciled with the server's count.
    setSubscribed(next);
    setCount(value => value + (next ? 1 : -1));

    const result = next
      ? await api.channels.subscribe({ body: {}, params: { handle } })
      : await api.channels.unsubscribe({ params: { handle } });

    if (result.status === 200) {
      setSubscribed(result.body.isSubscribed);
      setCount(result.body.subscriberCount);
    } else {
      setSubscribed(!next);
      setCount(value => value + (next ? -1 : 1));
    }

    setPending(false);
  };

  return (
    <button
      aria-pressed={subscribed}
      className={tw(
        "focus-ring rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
        subscribed
          ? "border border-border bg-muted text-foreground hover:bg-border"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
      disabled={pending}
      onClick={toggle}
      type="button"
    >
      {subscribed ? "Subscribed" : "Subscribe"}
      <span className="ml-1.5 font-normal opacity-70">{formatCompact(count)}</span>
    </button>
  );
};
