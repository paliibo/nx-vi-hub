"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared-ui/components/button";

import { api } from "../../lib/api-client";

export const ClearHistoryButton = () => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const clear = async () => {
    setBusy(true);
    await api.library.clearHistory();
    setBusy(false);
    setConfirming(false);
    router.refresh();
  };

  // Two steps rather than a dialog: clearing history is destructive and
  // irreversible, and a misplaced click should not be enough to do it.
  if (!confirming) {
    return (
      <Button onClick={() => setConfirming(true)} size="sm" variant="outline">
        Clear history
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-body-s text-muted-foreground">Delete all history?</span>
      <Button onClick={() => setConfirming(false)} size="sm" variant="ghost">
        Cancel
      </Button>
      <Button disabled={busy} onClick={clear} size="sm" variant="destructive">
        {busy ? "Clearing…" : "Yes, clear"}
      </Button>
    </span>
  );
};
